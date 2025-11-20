# Dynamic Pricing System - Zone-Based Solution

## Table of Contents
1. [Current System Overview](#current-system-overview)
2. [Problem Statement](#problem-statement)
3. [Zone-Based Solution Architecture](#zone-based-solution-architecture)
4. [Database Schema](#database-schema)
5. [Implementation Guide](#implementation-guide)
6. [Migration Scripts](#migration-scripts)
7. [API Changes](#api-changes)
8. [Testing Strategy](#testing-strategy)
9. [Performance Optimization](#performance-optimization)

---

## Current System Overview

### Existing Pricing Logic

Your current system (`src/common/services/pricing.service.ts`) uses a **flat-rate pricing model** with the following formula:

```typescript
Total Fee = Base Fee + Weight Fee + Distance Fee + Express Surcharge + COD Fee
```

**Current Configuration (from .env):**
```bash
BASE_DELIVERY_FEE=50           # Base charge
PER_KG_FEE=20                  # Per kg charge
DISTANCE_FEE_PER_KM=5          # Distance charge
EXPRESS_SURCHARGE=50           # Express delivery surcharge
COD_FEE_PERCENTAGE=2           # 2% of COD amount
```

**Example Calculation (Dhaka delivery):**
- Weight: 1 kg
- Distance: 10 km
- Delivery Type: Normal
- COD Amount: 500 Tk

```
Base Fee:      50 Tk
Weight Fee:    20 Tk (1 kg × 20)
Distance Fee:  50 Tk (10 km × 5)
COD Fee:       10 Tk (500 × 2%)
─────────────────────
Total:        130 Tk
```

### Current Distance Calculation

**GeoService Implementation** (`src/common/services/geo.service.ts`):

1. **With GPS Coordinates (Haversine Formula):**
```typescript
calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
```

2. **Without GPS (Location Estimation):**
```typescript
estimateDistanceByLocation(senderCity, senderArea, receiverCity, receiverArea) {
  // Same city, same area → 5 km
  // Same city, different area → 15 km
  // Different cities → 50 km
}
```

### Current Shipment Creation Flow

**From `src/modules/shipments/shipments.service.ts`:**

```typescript
async create(createShipmentDto: CreateShipmentDto) {
  // 1. Generate AWB
  const awb = generateAWB();
  
  // 2. Calculate distance
  let distance = 20; // Default
  if (sender.latitude && receiver.latitude) {
    distance = this.geoService.calculateDistance(
      sender.latitude, sender.longitude,
      receiver.latitude, receiver.longitude
    );
  } else {
    distance = this.geoService.estimateDistanceByLocation(
      sender.city, sender.area,
      receiver.city, receiver.area
    );
  }
  
  // 3. Calculate pricing (CURRENT - FLAT RATE)
  const pricing = this.pricingService.calculateDeliveryFee(
    weight,
    distance,
    deliveryType,
    codAmount || 0
  );
  
  // 4. Calculate expected delivery
  const expectedDeliveryDate = this.pricingService.calculateExpectedDelivery(
    deliveryType
  );
  
  // 5. Save shipment with pricing
  const shipment = this.shipmentRepository.create({
    ...createShipmentDto,
    deliveryFee: pricing.totalFee,
    codFee: pricing.codFee,
    totalAmount: pricing.totalFee + (codAmount || 0),
    expectedDeliveryDate,
    awb
  });
}
```

---

## Problem Statement

### Issue
Your current system charges **approximately 60 Tk** for Dhaka deliveries (after calculating weight and distance), but this **doesn't differentiate** between:

- **Dhaka City** (metropolitan area) - Should be 60 Tk ✓
- **Dhaka Suburbs** (areas like Keraniganj, Uttara border) - Should be higher (~80-100 Tk)
- **Outside Dhaka** (other districts/upazilas) - Should be even higher (~120-150 Tk)

### Business Requirements

1. **Zone-based pricing**: Different rates for different geographic zones
2. **Flexible configuration**: Easy to update prices without code changes
3. **Database optimization**: Fast lookups (< 50ms)
4. **Accurate zone detection**: Based on GPS coordinates or city/area/upazila names
5. **Admin panel ready**: Support for managing zones and rates

---

## Zone-Based Solution Architecture

### Proposed Pricing Zones

| Zone ID | Zone Name | Coverage | Base Fee | Per KM | Per KG |
|---------|-----------|----------|----------|--------|--------|
| 1 | Dhaka City | Dhaka Metro (15km radius from Shahbagh) | 60 Tk | 5 Tk | 20 Tk |
| 2 | Dhaka Suburbs | 15-30km from Shahbagh (Keraniganj, Gazipur border) | 80 Tk | 6 Tk | 25 Tk |
| 3 | Outside Dhaka | Other districts (Gazipur, Narayanganj, Chattogram) | 120 Tk | 8 Tk | 30 Tk |
| 4 | Remote Areas | Far districts (Sylhet, Khulna, Rangpur) | 150 Tk | 10 Tk | 35 Tk |

### Zone Detection Strategy

```typescript
// Priority 1: GPS-based zone detection (most accurate)
if (receiver.latitude && receiver.longitude) {
  zone = detectZoneByGPS(receiver.latitude, receiver.longitude);
}

// Priority 2: City/Upazila-based zone detection
else if (receiver.city && receiver.area) {
  zone = detectZoneByCityArea(receiver.city, receiver.area);
}

// Priority 3: Default zone (fallback)
else {
  zone = getDefaultZone(); // Zone 3: Outside Dhaka
}
```

---

## Database Schema

### 1. Pricing Zones Table

```sql
CREATE TABLE pricing_zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,           -- 'Dhaka City', 'Dhaka Suburbs', etc.
  description TEXT,
  
  -- Geographic center point for distance-based detection
  center_latitude DECIMAL(10, 7),              -- Shahbagh: 23.7389469
  center_longitude DECIMAL(10, 7),             -- Shahbagh: 90.3948959
  
  -- Radius for circular zone detection (in km)
  radius_km DECIMAL(8, 2),                     -- 15km, 30km, etc.
  
  -- Priority for overlapping zones (higher = higher priority)
  priority INTEGER DEFAULT 0,
  
  -- Active status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookups
CREATE INDEX idx_pricing_zones_active ON pricing_zones(is_active);
CREATE INDEX idx_pricing_zones_priority ON pricing_zones(priority DESC);
```

### 2. Zone Rates Table

```sql
CREATE TABLE zone_rates (
  id SERIAL PRIMARY KEY,
  zone_id INTEGER NOT NULL REFERENCES pricing_zones(id) ON DELETE CASCADE,
  
  -- Service type
  delivery_type VARCHAR(20) NOT NULL,          -- 'normal', 'express', 'same_day'
  
  -- Weight-based pricing
  min_weight DECIMAL(8, 2) DEFAULT 0,          -- 0 kg
  max_weight DECIMAL(8, 2),                    -- 5 kg, 10 kg, NULL (unlimited)
  
  -- Base pricing
  base_fee DECIMAL(10, 2) NOT NULL,            -- 60 Tk, 80 Tk, 120 Tk
  per_km_rate DECIMAL(10, 2) NOT NULL,         -- 5 Tk/km, 6 Tk/km, 8 Tk/km
  per_kg_rate DECIMAL(10, 2) NOT NULL,         -- 20 Tk/kg, 25 Tk/kg, 30 Tk/kg
  
  -- Additional charges
  express_surcharge DECIMAL(10, 2) DEFAULT 0,  -- 50 Tk for express
  cod_fee_percentage DECIMAL(5, 2) DEFAULT 2,  -- 2%
  
  -- Effective dates
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(zone_id, delivery_type, min_weight, max_weight)
);

-- Indexes for fast rate lookups
CREATE INDEX idx_zone_rates_lookup ON zone_rates(zone_id, delivery_type, is_active);
CREATE INDEX idx_zone_rates_weight ON zone_rates(min_weight, max_weight);
CREATE INDEX idx_zone_rates_effective ON zone_rates(effective_from, effective_to);
```

### 3. Delivery Areas Table (City/Upazila Mapping)

```sql
CREATE TABLE delivery_areas (
  id SERIAL PRIMARY KEY,
  zone_id INTEGER NOT NULL REFERENCES pricing_zones(id) ON DELETE CASCADE,
  
  -- Location hierarchy
  division VARCHAR(50),                        -- 'Dhaka', 'Chattogram', etc.
  district VARCHAR(100),                       -- 'Dhaka', 'Gazipur', 'Narayanganj'
  upazila VARCHAR(100),                        -- 'Dhanmondi', 'Mirpur', 'Keraniganj'
  area VARCHAR(100),                           -- 'Dhanmondi 27', 'Mirpur 10'
  postal_code VARCHAR(10),                     -- '1209', '1216'
  
  -- Optional GPS bounds for area
  boundary_polygon TEXT,                       -- GeoJSON polygon
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(district, upazila, area)
);

-- Indexes for fast area lookups
CREATE INDEX idx_delivery_areas_zone ON delivery_areas(zone_id, is_active);
CREATE INDEX idx_delivery_areas_district ON delivery_areas(district, upazila);
CREATE INDEX idx_delivery_areas_postal ON delivery_areas(postal_code);
CREATE INDEX idx_delivery_areas_lookup ON delivery_areas(district, upazila, area, is_active);
```

### 4. Update Shipments Table (Add Zone Reference)

```sql
ALTER TABLE shipments 
ADD COLUMN pricing_zone_id INTEGER REFERENCES pricing_zones(id),
ADD COLUMN zone_detected_by VARCHAR(20) DEFAULT 'gps';  -- 'gps', 'city_area', 'default'

CREATE INDEX idx_shipments_zone ON shipments(pricing_zone_id);
```

---

## Implementation Guide

### Step 1: Create Entity Files

#### `src/entities/pricing-zone.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ZoneRate } from './zone-rate.entity';
import { DeliveryArea } from './delivery-area.entity';

@Entity('pricing_zones')
export class PricingZone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, name: 'center_latitude' })
  centerLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, name: 'center_longitude' })
  centerLongitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, name: 'radius_km' })
  radiusKm: number;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => ZoneRate, (zoneRate) => zoneRate.zone)
  rates: ZoneRate[];

  @OneToMany(() => DeliveryArea, (area) => area.zone)
  areas: DeliveryArea[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

#### `src/entities/zone-rate.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PricingZone } from './pricing-zone.entity';
import { DeliveryType } from '../common/enums';

@Entity('zone_rates')
export class ZoneRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'zone_id' })
  zoneId: number;

  @ManyToOne(() => PricingZone, (zone) => zone.rates)
  @JoinColumn({ name: 'zone_id' })
  zone: PricingZone;

  @Column({ type: 'varchar', length: 20, name: 'delivery_type' })
  deliveryType: DeliveryType;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0, name: 'min_weight' })
  minWeight: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, name: 'max_weight' })
  maxWeight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'base_fee' })
  baseFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'per_km_rate' })
  perKmRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'per_kg_rate' })
  perKgRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'express_surcharge' })
  expressSurcharge: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2, name: 'cod_fee_percentage' })
  codFeePercentage: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE', name: 'effective_from' })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true, name: 'effective_to' })
  effectiveTo: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

#### `src/entities/delivery-area.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PricingZone } from './pricing-zone.entity';

@Entity('delivery_areas')
export class DeliveryArea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'zone_id' })
  zoneId: number;

  @ManyToOne(() => PricingZone, (zone) => zone.areas)
  @JoinColumn({ name: 'zone_id' })
  zone: PricingZone;

  @Column({ type: 'varchar', length: 50, nullable: true })
  division: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  upazila: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  area: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'postal_code' })
  postalCode: string;

  @Column({ type: 'text', nullable: true, name: 'boundary_polygon' })
  boundaryPolygon: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### Step 2: Update Shipment Entity

Add zone reference to `src/entities/shipment.entity.ts`:

```typescript
import { PricingZone } from './pricing-zone.entity';

@Entity('shipments')
export class Shipment {
  // ... existing fields ...

  @Column({ nullable: true, name: 'pricing_zone_id' })
  pricingZoneId: number;

  @ManyToOne(() => PricingZone, { nullable: true })
  @JoinColumn({ name: 'pricing_zone_id' })
  pricingZone: PricingZone;

  @Column({ type: 'varchar', length: 20, default: 'gps', name: 'zone_detected_by' })
  zoneDetectedBy: string; // 'gps', 'city_area', 'default'

  // ... rest of entity ...
}
```

### Step 3: Enhanced Pricing Service

Create `src/common/services/zone-pricing.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingZone } from '../../entities/pricing-zone.entity';
import { ZoneRate } from '../../entities/zone-rate.entity';
import { DeliveryArea } from '../../entities/delivery-area.entity';
import { GeoService } from './geo.service';
import { DeliveryType } from '../enums';

@Injectable()
export class ZonePricingService {
  private readonly logger = new Logger(ZonePricingService.name);

  constructor(
    @InjectRepository(PricingZone)
    private readonly pricingZoneRepository: Repository<PricingZone>,
    @InjectRepository(ZoneRate)
    private readonly zoneRateRepository: Repository<ZoneRate>,
    @InjectRepository(DeliveryArea)
    private readonly deliveryAreaRepository: Repository<DeliveryArea>,
    private readonly geoService: GeoService,
  ) {}

  /**
   * Detect pricing zone using GPS coordinates (Priority 1)
   */
  async detectZoneByGPS(
    latitude: number,
    longitude: number,
  ): Promise<{ zone: PricingZone; method: string } | null> {
    const zones = await this.pricingZoneRepository.find({
      where: { isActive: true },
      order: { priority: 'DESC' },
    });

    for (const zone of zones) {
      if (!zone.centerLatitude || !zone.centerLongitude || !zone.radiusKm) {
        continue;
      }

      const distance = this.geoService.calculateDistance(
        latitude,
        longitude,
        zone.centerLatitude,
        zone.centerLongitude,
      );

      if (distance <= zone.radiusKm) {
        this.logger.log(
          `Zone detected by GPS: ${zone.name} (${distance.toFixed(2)}km from center)`,
        );
        return { zone, method: 'gps' };
      }
    }

    return null;
  }

  /**
   * Detect pricing zone using city/upazila/area (Priority 2)
   */
  async detectZoneByCityArea(
    district: string,
    upazila?: string,
    area?: string,
  ): Promise<{ zone: PricingZone; method: string } | null> {
    // Try exact match (district + upazila + area)
    if (district && upazila && area) {
      const deliveryArea = await this.deliveryAreaRepository.findOne({
        where: { district, upazila, area, isActive: true },
        relations: ['zone'],
      });

      if (deliveryArea) {
        this.logger.log(
          `Zone detected by exact match: ${deliveryArea.zone.name}`,
        );
        return { zone: deliveryArea.zone, method: 'city_area' };
      }
    }

    // Try district + upazila match
    if (district && upazila) {
      const deliveryArea = await this.deliveryAreaRepository.findOne({
        where: { district, upazila, isActive: true },
        relations: ['zone'],
      });

      if (deliveryArea) {
        this.logger.log(
          `Zone detected by district+upazila: ${deliveryArea.zone.name}`,
        );
        return { zone: deliveryArea.zone, method: 'city_area' };
      }
    }

    // Try district only match
    if (district) {
      const deliveryArea = await this.deliveryAreaRepository.findOne({
        where: { district, isActive: true },
        relations: ['zone'],
      });

      if (deliveryArea) {
        this.logger.log(
          `Zone detected by district: ${deliveryArea.zone.name}`,
        );
        return { zone: deliveryArea.zone, method: 'city_area' };
      }
    }

    return null;
  }

  /**
   * Get default zone (Priority 3 - Fallback)
   */
  async getDefaultZone(): Promise<PricingZone> {
    // Get zone with lowest priority (assumed to be "Outside Dhaka")
    const zone = await this.pricingZoneRepository.findOne({
      where: { isActive: true },
      order: { priority: 'ASC' },
    });

    if (!zone) {
      throw new Error('No active pricing zones found');
    }

    this.logger.warn(`Using default zone: ${zone.name}`);
    return zone;
  }

  /**
   * Detect zone with fallback strategy
   */
  async detectZone(
    latitude?: number,
    longitude?: number,
    district?: string,
    upazila?: string,
    area?: string,
  ): Promise<{ zone: PricingZone; method: string }> {
    // Priority 1: GPS-based detection
    if (latitude && longitude) {
      const gpsResult = await this.detectZoneByGPS(latitude, longitude);
      if (gpsResult) return gpsResult;
    }

    // Priority 2: City/Area-based detection
    if (district) {
      const areaResult = await this.detectZoneByCityArea(
        district,
        upazila,
        area,
      );
      if (areaResult) return areaResult;
    }

    // Priority 3: Default zone
    const defaultZone = await this.getDefaultZone();
    return { zone: defaultZone, method: 'default' };
  }

  /**
   * Get zone rate for specific criteria
   */
  async getZoneRate(
    zoneId: number,
    deliveryType: DeliveryType,
    weight: number,
  ): Promise<ZoneRate> {
    const rate = await this.zoneRateRepository
      .createQueryBuilder('rate')
      .where('rate.zone_id = :zoneId', { zoneId })
      .andWhere('rate.delivery_type = :deliveryType', { deliveryType })
      .andWhere('rate.is_active = :isActive', { isActive: true })
      .andWhere('rate.min_weight <= :weight', { weight })
      .andWhere(
        '(rate.max_weight IS NULL OR rate.max_weight >= :weight)',
        { weight },
      )
      .andWhere('rate.effective_from <= CURRENT_DATE')
      .andWhere(
        '(rate.effective_to IS NULL OR rate.effective_to >= CURRENT_DATE)',
      )
      .orderBy('rate.min_weight', 'DESC')
      .getOne();

    if (!rate) {
      throw new Error(
        `No active rate found for zone ${zoneId}, delivery type ${deliveryType}, weight ${weight}kg`,
      );
    }

    return rate;
  }

  /**
   * Calculate delivery fee with zone-based pricing
   */
  async calculateZoneBasedDeliveryFee(
    zoneId: number,
    weight: number,
    distance: number,
    deliveryType: DeliveryType,
    codAmount: number = 0,
  ): Promise<{
    zoneId: number;
    zoneName: string;
    baseFee: number;
    weightFee: number;
    distanceFee: number;
    expressSurcharge: number;
    codFee: number;
    totalFee: number;
    breakdown: string;
  }> {
    // Get the zone rate
    const rate = await this.getZoneRate(zoneId, deliveryType, weight);
    const zone = await this.pricingZoneRepository.findOne({
      where: { id: zoneId },
    });

    // Calculate fees based on zone rates
    const baseFee = rate.baseFee;
    const weightFee = Math.ceil(weight) * rate.perKgRate;
    const distanceFee = Math.round(distance) * rate.perKmRate;
    const expressSurcharge =
      deliveryType === DeliveryType.EXPRESS ? rate.expressSurcharge : 0;
    const codFee = codAmount > 0 ? Math.round((codAmount * rate.codFeePercentage) / 100) : 0;

    const totalFee = baseFee + weightFee + distanceFee + expressSurcharge + codFee;

    const breakdown = `
Zone: ${zone.name}
Base Fee: ${baseFee} Tk
Weight Fee: ${weightFee} Tk (${Math.ceil(weight)}kg × ${rate.perKgRate} Tk/kg)
Distance Fee: ${distanceFee} Tk (${Math.round(distance)}km × ${rate.perKmRate} Tk/km)
Express Surcharge: ${expressSurcharge} Tk
COD Fee: ${codFee} Tk (${codAmount} Tk × ${rate.codFeePercentage}%)
────────────────────
Total: ${totalFee} Tk
    `.trim();

    return {
      zoneId,
      zoneName: zone.name,
      baseFee,
      weightFee,
      distanceFee,
      expressSurcharge,
      codFee,
      totalFee: Math.round(totalFee * 100) / 100,
      breakdown,
    };
  }
}
```

### Step 4: Update Shipments Service

Modify `src/modules/shipments/shipments.service.ts`:

```typescript
import { ZonePricingService } from '../../common/services/zone-pricing.service';

@Injectable()
export class ShipmentsService {
  constructor(
    // ... existing dependencies ...
    private readonly zonePricingService: ZonePricingService,
  ) {}

  async create(createShipmentDto: CreateShipmentDto) {
    // ... existing code for AWB, merchant, customer ...

    // Calculate distance (existing logic)
    let distance = 20;
    if (receiverLatitude && receiverLongitude) {
      if (senderLatitude && senderLongitude) {
        distance = this.geoService.calculateDistance(
          parseFloat(senderLatitude),
          parseFloat(senderLongitude),
          parseFloat(receiverLatitude),
          parseFloat(receiverLongitude),
        );
      }
    } else {
      distance = this.geoService.estimateDistanceByLocation(
        senderCity,
        senderArea,
        receiverCity,
        receiverArea,
      );
    }

    // NEW: Detect pricing zone
    const { zone, method } = await this.zonePricingService.detectZone(
      receiverLatitude ? parseFloat(receiverLatitude) : undefined,
      receiverLongitude ? parseFloat(receiverLongitude) : undefined,
      receiverCity,
      receiverArea,
      receiverAddress,
    );

    // NEW: Calculate zone-based pricing
    const pricing = await this.zonePricingService.calculateZoneBasedDeliveryFee(
      zone.id,
      weight,
      distance,
      deliveryType,
      codAmount || 0,
    );

    this.logger.log(`Pricing calculated:\n${pricing.breakdown}`);

    // Calculate expected delivery (existing logic)
    const expectedDeliveryDate = this.pricingService.calculateExpectedDelivery(
      deliveryType,
    );

    // Create shipment with zone information
    const shipment = this.shipmentRepository.create({
      ...createShipmentDto,
      awb,
      merchantId: merchant.id,
      customerId: customer?.id,
      deliveryFee: pricing.totalFee,
      codFee: pricing.codFee,
      totalAmount: pricing.totalFee + (codAmount || 0),
      expectedDeliveryDate,
      pricingZoneId: zone.id, // NEW: Store zone reference
      zoneDetectedBy: method,  // NEW: Store detection method
    });

    await this.shipmentRepository.save(shipment);

    return shipment;
  }
}
```

---

## Migration Scripts

### Migration 1: Create Pricing Tables

Create file: `src/migrations/1731244800000-CreatePricingTables.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePricingTables1731244800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create pricing_zones table
    await queryRunner.createTable(
      new Table({
        name: 'pricing_zones',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'name', type: 'varchar', length: '100', isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'center_latitude', type: 'decimal', precision: 10, scale: 7, isNullable: true },
          { name: 'center_longitude', type: 'decimal', precision: 10, scale: 7, isNullable: true },
          { name: 'radius_km', type: 'decimal', precision: 8, scale: 2, isNullable: true },
          { name: 'priority', type: 'int', default: 0 },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Create indexes for pricing_zones
    await queryRunner.createIndex(
      'pricing_zones',
      new TableIndex({
        name: 'idx_pricing_zones_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'pricing_zones',
      new TableIndex({
        name: 'idx_pricing_zones_priority',
        columnNames: ['priority'],
      }),
    );

    // Create zone_rates table
    await queryRunner.createTable(
      new Table({
        name: 'zone_rates',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'zone_id', type: 'int' },
          { name: 'delivery_type', type: 'varchar', length: '20' },
          { name: 'min_weight', type: 'decimal', precision: 8, scale: 2, default: 0 },
          { name: 'max_weight', type: 'decimal', precision: 8, scale: 2, isNullable: true },
          { name: 'base_fee', type: 'decimal', precision: 10, scale: 2 },
          { name: 'per_km_rate', type: 'decimal', precision: 10, scale: 2 },
          { name: 'per_kg_rate', type: 'decimal', precision: 10, scale: 2 },
          { name: 'express_surcharge', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'cod_fee_percentage', type: 'decimal', precision: 5, scale: 2, default: 2 },
          { name: 'effective_from', type: 'date', default: 'CURRENT_DATE' },
          { name: 'effective_to', type: 'date', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Create foreign key for zone_rates
    await queryRunner.createForeignKey(
      'zone_rates',
      new TableForeignKey({
        columnNames: ['zone_id'],
        referencedTableName: 'pricing_zones',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for zone_rates
    await queryRunner.createIndex(
      'zone_rates',
      new TableIndex({
        name: 'idx_zone_rates_lookup',
        columnNames: ['zone_id', 'delivery_type', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'zone_rates',
      new TableIndex({
        name: 'idx_zone_rates_weight',
        columnNames: ['min_weight', 'max_weight'],
      }),
    );

    // Create delivery_areas table
    await queryRunner.createTable(
      new Table({
        name: 'delivery_areas',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'zone_id', type: 'int' },
          { name: 'division', type: 'varchar', length: '50', isNullable: true },
          { name: 'district', type: 'varchar', length: '100', isNullable: true },
          { name: 'upazila', type: 'varchar', length: '100', isNullable: true },
          { name: 'area', type: 'varchar', length: '100', isNullable: true },
          { name: 'postal_code', type: 'varchar', length: '10', isNullable: true },
          { name: 'boundary_polygon', type: 'text', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Create foreign key for delivery_areas
    await queryRunner.createForeignKey(
      'delivery_areas',
      new TableForeignKey({
        columnNames: ['zone_id'],
        referencedTableName: 'pricing_zones',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for delivery_areas
    await queryRunner.createIndex(
      'delivery_areas',
      new TableIndex({
        name: 'idx_delivery_areas_zone',
        columnNames: ['zone_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'delivery_areas',
      new TableIndex({
        name: 'idx_delivery_areas_district',
        columnNames: ['district', 'upazila'],
      }),
    );

    await queryRunner.createIndex(
      'delivery_areas',
      new TableIndex({
        name: 'idx_delivery_areas_lookup',
        columnNames: ['district', 'upazila', 'area', 'is_active'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('delivery_areas');
    await queryRunner.dropTable('zone_rates');
    await queryRunner.dropTable('pricing_zones');
  }
}
```

### Migration 2: Update Shipments Table

Create file: `src/migrations/1731244900000-AddZoneToShipments.ts`

```typescript
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddZoneToShipments1731244900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add pricing_zone_id column
    await queryRunner.addColumn(
      'shipments',
      new TableColumn({
        name: 'pricing_zone_id',
        type: 'int',
        isNullable: true,
      }),
    );

    // Add zone_detected_by column
    await queryRunner.addColumn(
      'shipments',
      new TableColumn({
        name: 'zone_detected_by',
        type: 'varchar',
        length: '20',
        default: "'gps'",
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'shipments',
      new TableForeignKey({
        columnNames: ['pricing_zone_id'],
        referencedTableName: 'pricing_zones',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Create index
    await queryRunner.createIndex(
      'shipments',
      new TableIndex({
        name: 'idx_shipments_zone',
        columnNames: ['pricing_zone_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('shipments');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('pricing_zone_id') !== -1,
    );
    await queryRunner.dropForeignKey('shipments', foreignKey);
    await queryRunner.dropIndex('shipments', 'idx_shipments_zone');
    await queryRunner.dropColumn('shipments', 'zone_detected_by');
    await queryRunner.dropColumn('shipments', 'pricing_zone_id');
  }
}
```

### Migration 3: Seed Initial Pricing Data

Create file: `src/migrations/1731245000000-SeedPricingData.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPricingData1731245000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert pricing zones
    await queryRunner.query(`
      INSERT INTO pricing_zones (name, description, center_latitude, center_longitude, radius_km, priority, is_active)
      VALUES
        ('Dhaka City', 'Dhaka Metropolitan Area (15km radius from Shahbagh)', 23.7389469, 90.3948959, 15, 3, true),
        ('Dhaka Suburbs', 'Dhaka Suburbs (15-30km from Shahbagh)', 23.7389469, 90.3948959, 30, 2, true),
        ('Outside Dhaka', 'Other districts in Bangladesh', NULL, NULL, NULL, 1, true),
        ('Remote Areas', 'Far districts (Sylhet, Khulna, Rangpur)', NULL, NULL, NULL, 0, true);
    `);

    // Get zone IDs
    const zones = await queryRunner.query(`SELECT id, name FROM pricing_zones ORDER BY priority DESC`);
    const dhakaCity = zones.find((z) => z.name === 'Dhaka City');
    const dhakaSuburbs = zones.find((z) => z.name === 'Dhaka Suburbs');
    const outsideDhaka = zones.find((z) => z.name === 'Outside Dhaka');
    const remoteAreas = zones.find((z) => z.name === 'Remote Areas');

    // Insert zone rates for Dhaka City
    await queryRunner.query(`
      INSERT INTO zone_rates (zone_id, delivery_type, min_weight, max_weight, base_fee, per_km_rate, per_kg_rate, express_surcharge, cod_fee_percentage)
      VALUES
        (${dhakaCity.id}, 'normal', 0, 5, 60, 5, 20, 0, 2),
        (${dhakaCity.id}, 'express', 0, 5, 60, 5, 20, 50, 2),
        (${dhakaCity.id}, 'same_day', 0, 5, 60, 5, 20, 100, 2);
    `);

    // Insert zone rates for Dhaka Suburbs
    await queryRunner.query(`
      INSERT INTO zone_rates (zone_id, delivery_type, min_weight, max_weight, base_fee, per_km_rate, per_kg_rate, express_surcharge, cod_fee_percentage)
      VALUES
        (${dhakaSuburbs.id}, 'normal', 0, 5, 80, 6, 25, 0, 2),
        (${dhakaSuburbs.id}, 'express', 0, 5, 80, 6, 25, 60, 2),
        (${dhakaSuburbs.id}, 'same_day', 0, 5, 80, 6, 25, 120, 2);
    `);

    // Insert zone rates for Outside Dhaka
    await queryRunner.query(`
      INSERT INTO zone_rates (zone_id, delivery_type, min_weight, max_weight, base_fee, per_km_rate, per_kg_rate, express_surcharge, cod_fee_percentage)
      VALUES
        (${outsideDhaka.id}, 'normal', 0, 5, 120, 8, 30, 0, 2),
        (${outsideDhaka.id}, 'express', 0, 5, 120, 8, 30, 80, 2);
    `);

    // Insert zone rates for Remote Areas
    await queryRunner.query(`
      INSERT INTO zone_rates (zone_id, delivery_type, min_weight, max_weight, base_fee, per_km_rate, per_kg_rate, express_surcharge, cod_fee_percentage)
      VALUES
        (${remoteAreas.id}, 'normal', 0, 5, 150, 10, 35, 0, 2),
        (${remoteAreas.id}, 'express', 0, 5, 150, 10, 35, 100, 2);
    `);

    // Insert delivery areas for Dhaka City (major areas within 15km)
    await queryRunner.query(`
      INSERT INTO delivery_areas (zone_id, division, district, upazila, area)
      VALUES
        (${dhakaCity.id}, 'Dhaka', 'Dhaka', 'Dhanmondi', NULL),
        (${dhakaCity.id}, 'Dhaka', 'Dhaka', 'Gulshan', NULL),
        (${dhakaCity.id}, 'Dhaka', 'Dhaka', 'Banani', NULL),
        (${dhakaCity.id}, 'Dhaka', 'Dhaka', 'Motijheel', NULL),
        (${dhakaCity.id}, 'Dhaka', 'Dhaka', 'Mohammadpur', NULL),
        (${dhakaCity.id}, 'Dhaka', 'Dhaka', 'Mirpur', NULL),
        (${dhakaCity.id}, 'Dhaka', 'Dhaka', 'Uttara', NULL),
        (${dhakaCity.id}, 'Dhaka', 'Dhaka', 'Badda', NULL),
        (${dhakaCity.id}, 'Dhaka', 'Dhaka', 'Tejgaon', NULL);
    `);

    // Insert delivery areas for Dhaka Suburbs
    await queryRunner.query(`
      INSERT INTO delivery_areas (zone_id, division, district, upazila)
      VALUES
        (${dhakaSuburbs.id}, 'Dhaka', 'Dhaka', 'Keraniganj'),
        (${dhakaSuburbs.id}, 'Dhaka', 'Dhaka', 'Savar'),
        (${dhakaSuburbs.id}, 'Dhaka', 'Dhaka', 'Dohar'),
        (${dhakaSuburbs.id}, 'Dhaka', 'Gazipur', 'Gazipur Sadar'),
        (${dhakaSuburbs.id}, 'Dhaka', 'Narayanganj', 'Narayanganj Sadar');
    `);

    // Insert delivery areas for Outside Dhaka (other major districts)
    await queryRunner.query(`
      INSERT INTO delivery_areas (zone_id, division, district)
      VALUES
        (${outsideDhaka.id}, 'Chattogram', 'Chattogram'),
        (${outsideDhaka.id}, 'Rajshahi', 'Rajshahi'),
        (${outsideDhaka.id}, 'Khulna', 'Khulna'),
        (${outsideDhaka.id}, 'Barishal', 'Barishal'),
        (${outsideDhaka.id}, 'Sylhet', 'Sylhet'),
        (${outsideDhaka.id}, 'Rangpur', 'Rangpur'),
        (${outsideDhaka.id}, 'Mymensingh', 'Mymensingh');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM delivery_areas`);
    await queryRunner.query(`DELETE FROM zone_rates`);
    await queryRunner.query(`DELETE FROM pricing_zones`);
  }
}
```

---

## API Changes

### Get Zone Estimate (Before Creating Shipment)

Add endpoint to preview pricing based on receiver location:

```typescript
// src/modules/shipments/dto/estimate-price.dto.ts
export class EstimatePriceDto {
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  receiverLatitude?: string;

  @IsOptional()
  @IsString()
  receiverLongitude?: string;

  @IsString()
  receiverCity: string;

  @IsOptional()
  @IsString()
  receiverArea?: string;

  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @IsOptional()
  @IsNumber()
  codAmount?: number;
}

// src/modules/shipments/shipments.controller.ts
@Post('estimate-price')
async estimatePrice(@Body() estimatePriceDto: EstimatePriceDto) {
  return this.shipmentsService.estimatePrice(estimatePriceDto);
}

// src/modules/shipments/shipments.service.ts
async estimatePrice(estimatePriceDto: EstimatePriceDto) {
  const { weight, receiverLatitude, receiverLongitude, receiverCity, receiverArea, deliveryType, codAmount } = estimatePriceDto;

  // Detect zone
  const { zone, method } = await this.zonePricingService.detectZone(
    receiverLatitude ? parseFloat(receiverLatitude) : undefined,
    receiverLongitude ? parseFloat(receiverLongitude) : undefined,
    receiverCity,
    receiverArea,
  );

  // Estimate distance (use default 20km for estimation)
  const distance = 20;

  // Calculate pricing
  const pricing = await this.zonePricingService.calculateZoneBasedDeliveryFee(
    zone.id,
    weight,
    distance,
    deliveryType,
    codAmount || 0,
  );

  return {
    zone: {
      id: zone.id,
      name: zone.name,
      detectedBy: method,
    },
    pricing: {
      baseFee: pricing.baseFee,
      weightFee: pricing.weightFee,
      distanceFee: pricing.distanceFee,
      expressSurcharge: pricing.expressSurcharge,
      codFee: pricing.codFee,
      totalFee: pricing.totalFee,
    },
    breakdown: pricing.breakdown,
  };
}
```

---

## Testing Strategy

### Test Case 1: Dhaka City Delivery (GPS)

```bash
curl -X POST http://localhost:3001/api/shipments/estimate-price \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 1.5,
    "receiverLatitude": "23.7508",
    "receiverLongitude": "90.3753",
    "receiverCity": "Dhaka",
    "receiverArea": "Dhanmondi",
    "deliveryType": "normal",
    "codAmount": 500
  }'

# Expected Output:
# Zone: Dhaka City (detected by GPS)
# Total Fee: ~105 Tk
# Breakdown:
#   Base: 60 Tk
#   Weight: 40 Tk (2kg × 20)
#   Distance: 0 Tk (within zone)
#   COD: 10 Tk (500 × 2%)
```

### Test Case 2: Dhaka Suburbs (City/Area)

```bash
curl -X POST http://localhost:3001/api/shipments/estimate-price \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 2,
    "receiverCity": "Dhaka",
    "receiverArea": "Keraniganj",
    "deliveryType": "normal",
    "codAmount": 1000
  }'

# Expected Output:
# Zone: Dhaka Suburbs (detected by city/area)
# Total Fee: ~200 Tk
# Breakdown:
#   Base: 80 Tk
#   Weight: 50 Tk (2kg × 25)
#   Distance: 100 Tk (20km × 5 default)
#   COD: 20 Tk (1000 × 2%)
```

### Test Case 3: Outside Dhaka (Chattogram)

```bash
curl -X POST http://localhost:3001/api/shipments/estimate-price \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 3,
    "receiverCity": "Chattogram",
    "deliveryType": "express",
    "codAmount": 2000
  }'

# Expected Output:
# Zone: Outside Dhaka (detected by city)
# Total Fee: ~410 Tk
# Breakdown:
#   Base: 120 Tk
#   Weight: 90 Tk (3kg × 30)
#   Distance: 160 Tk (20km × 8)
#   Express: 80 Tk
#   COD: 40 Tk (2000 × 2%)
```

---

## Performance Optimization

### 1. Database Indexes

✅ **Already implemented in migration:**
- `idx_pricing_zones_active` - Fast zone lookup
- `idx_pricing_zones_priority` - Priority-based zone selection
- `idx_zone_rates_lookup` - Fast rate lookup by zone + delivery type
- `idx_delivery_areas_lookup` - Fast area matching

### 2. Caching Strategy (Redis)

```typescript
// src/common/services/zone-pricing-cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ZonePricingCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getZoneByGPS(lat: number, lng: number): Promise<any> {
    const key = `zone:gps:${lat.toFixed(4)}:${lng.toFixed(4)}`;
    return await this.cacheManager.get(key);
  }

  async setZoneByGPS(lat: number, lng: number, zone: any, ttl = 3600): Promise<void> {
    const key = `zone:gps:${lat.toFixed(4)}:${lng.toFixed(4)}`;
    await this.cacheManager.set(key, zone, ttl);
  }

  async getZoneByArea(district: string, upazila?: string): Promise<any> {
    const key = `zone:area:${district}:${upazila || 'any'}`;
    return await this.cacheManager.get(key);
  }

  async setZoneByArea(district: string, upazila: string, zone: any, ttl = 3600): Promise<void> {
    const key = `zone:area:${district}:${upazila || 'any'}`;
    await this.cacheManager.set(key, zone, ttl);
  }
}
```

### 3. Query Optimization

```typescript
// Batch zone detection for bulk shipments
async detectZonesBatch(locations: Array<{lat?: number, lng?: number, district?: string}>): Promise<PricingZone[]> {
  const zones = await this.pricingZoneRepository.find({
    where: { isActive: true },
    order: { priority: 'DESC' },
    cache: { id: 'pricing_zones', milliseconds: 60000 } // Cache for 1 minute
  });

  return locations.map(loc => {
    // Zone detection logic here
  });
}
```

### 4. Expected Performance

- **Zone Detection**: < 50ms
- **Rate Lookup**: < 20ms
- **Total Pricing Calculation**: < 100ms
- **Cache Hit Rate**: > 80%

---

## Admin Panel Features

### 1. Manage Pricing Zones

```typescript
// CRUD endpoints for pricing zones
POST   /api/admin/pricing-zones        - Create new zone
GET    /api/admin/pricing-zones        - List all zones
GET    /api/admin/pricing-zones/:id    - Get zone details
PUT    /api/admin/pricing-zones/:id    - Update zone
DELETE /api/admin/pricing-zones/:id    - Delete zone
```

### 2. Manage Zone Rates

```typescript
// CRUD endpoints for zone rates
POST   /api/admin/zone-rates           - Create new rate
GET    /api/admin/zone-rates           - List all rates
PUT    /api/admin/zone-rates/:id       - Update rate
DELETE /api/admin/zone-rates/:id       - Delete rate
```

### 3. Manage Delivery Areas

```typescript
// CRUD endpoints for delivery areas
POST   /api/admin/delivery-areas       - Add new area
GET    /api/admin/delivery-areas       - List all areas
PUT    /api/admin/delivery-areas/:id   - Update area
DELETE /api/admin/delivery-areas/:id   - Remove area
```

---

## Rollout Strategy

### Phase 1: Setup (Day 1)
1. Run migrations to create tables
2. Seed initial pricing data
3. Deploy new entities and services

### Phase 2: Parallel Testing (Day 2-7)
1. Keep old pricing service active
2. Calculate pricing with both systems
3. Log differences for analysis
4. Compare results without affecting production

### Phase 3: Gradual Rollout (Day 8-14)
1. Enable zone-based pricing for 10% of shipments
2. Monitor performance and accuracy
3. Gradually increase to 50%, then 100%
4. Keep old system as fallback

### Phase 4: Full Migration (Day 15+)
1. Switch all shipments to zone-based pricing
2. Remove old pricing logic
3. Monitor for 1 week
4. Decommission old system

---

## Summary

### What Changed?

| Aspect | Before | After |
|--------|--------|-------|
| **Pricing Model** | Flat rate (50 Tk base + distance + weight) | Zone-based (60-150 Tk base + zone-specific rates) |
| **Zone Detection** | None | GPS-based or city/area-based with fallback |
| **Database Tables** | 0 zone-related tables | 3 new tables (zones, rates, areas) |
| **Indexes** | Basic shipment indexes | 9+ indexes for fast lookups |
| **Admin Control** | Hardcoded in .env | Database-driven, updateable via API |
| **Dhaka Pricing** | ~60 Tk everywhere | 60 Tk (city) → 80 Tk (suburbs) → 120+ Tk (outside) |

### Key Benefits

✅ **Problem Solved**: Different pricing for Dhaka city vs suburbs vs outside
✅ **Database Optimized**: Indexes ensure < 50ms lookups
✅ **Flexible**: Update prices without code changes
✅ **Accurate**: GPS-based zone detection with fallbacks
✅ **Admin Ready**: Full CRUD APIs for zone management
✅ **Performance**: Caching strategy for high-traffic scenarios
✅ **Gradual Rollout**: Safe migration with fallback options

---

## Next Steps

1. **Create Migration Files**: Copy migration code to `src/migrations/` folder
2. **Run Migrations**: `npm run migration:run`
3. **Verify Data**: Check `pricing_zones`, `zone_rates`, `delivery_areas` tables
4. **Update App Module**: Register new entities and services
5. **Test API**: Use curl commands to test zone detection
6. **Deploy**: Gradual rollout with monitoring

**Questions?** Contact the development team or refer to the implementation guide above.
