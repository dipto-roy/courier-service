"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const shipment_entity_1 = require("../../entities/shipment.entity");
const rider_location_entity_1 = require("../../entities/rider-location.entity");
const pickup_entity_1 = require("../../entities/pickup.entity");
const manifest_entity_1 = require("../../entities/manifest.entity");
const enums_1 = require("../../common/enums");
const cache_service_1 = require("../cache/cache.service");
const pusher_1 = __importDefault(require("pusher"));
let TrackingService = class TrackingService {
    shipmentRepository;
    riderLocationRepository;
    pickupRepository;
    manifestRepository;
    configService;
    cacheService;
    pusher;
    constructor(shipmentRepository, riderLocationRepository, pickupRepository, manifestRepository, configService, cacheService) {
        this.shipmentRepository = shipmentRepository;
        this.riderLocationRepository = riderLocationRepository;
        this.pickupRepository = pickupRepository;
        this.manifestRepository = manifestRepository;
        this.configService = configService;
        this.cacheService = cacheService;
        const pusherAppId = this.configService.get('PUSHER_APP_ID');
        const pusherKey = this.configService.get('PUSHER_KEY');
        const pusherSecret = this.configService.get('PUSHER_SECRET');
        const pusherCluster = this.configService.get('PUSHER_CLUSTER');
        if (pusherAppId && pusherKey && pusherSecret && pusherCluster) {
            this.pusher = new pusher_1.default({
                appId: pusherAppId,
                key: pusherKey,
                secret: pusherSecret,
                cluster: pusherCluster,
                useTLS: true,
            });
        }
    }
    async trackShipment(awbNumber, phoneVerification) {
        const cacheKey = `tracking:public:${awbNumber}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached && !phoneVerification) {
            return cached;
        }
        const shipment = await this.shipmentRepository.findOne({
            where: { awb: awbNumber },
            relations: ['merchant', 'rider'],
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment with AWB ${awbNumber} not found`);
        }
        if (phoneVerification) {
            const lastFourDigits = shipment.receiverPhone.slice(-4);
            if (phoneVerification !== lastFourDigits) {
                throw new common_1.UnauthorizedException('Phone verification failed');
            }
        }
        const timeline = await this.generateTimeline(shipment);
        let currentLocation = null;
        if (shipment.riderId && shipment.status === enums_1.ShipmentStatus.OUT_FOR_DELIVERY) {
            currentLocation = await this.getRiderCurrentLocation(shipment.riderId);
        }
        const eta = this.calculateETA(shipment);
        const result = {
            success: true,
            tracking: {
                awb: shipment.awb,
                status: shipment.status,
                currentLocation: shipment.currentHub || shipment.currentHub || 'In Transit',
                expectedDeliveryDate: shipment.expectedDeliveryDate,
                actualDeliveryDate: shipment.actualDeliveryDate,
                eta,
                receiverName: shipment.receiverName,
                receiverAddress: shipment.receiverAddress,
                deliveryArea: shipment.deliveryArea,
                weight: shipment.weight,
                deliveryType: shipment.deliveryType,
                deliveryAttempts: shipment.deliveryAttempts,
                isRto: shipment.isRto,
                timeline,
                riderLocation: currentLocation,
            },
        };
        await this.cacheService.set(cacheKey, result, 120);
        return result;
    }
    async getDetailedTracking(awbNumber) {
        const shipment = await this.shipmentRepository.findOne({
            where: { awb: awbNumber },
            relations: ['merchant', 'rider', 'pickup', 'manifest'],
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment with AWB ${awbNumber} not found`);
        }
        const timeline = await this.generateTimeline(shipment);
        let riderLocation = null;
        if (shipment.riderId) {
            riderLocation = await this.getRiderLocationHistory(shipment.riderId, 10);
        }
        const eta = this.calculateETA(shipment);
        return {
            success: true,
            tracking: {
                id: shipment.id,
                awb: shipment.awb,
                status: shipment.status,
                merchantId: shipment.merchantId,
                merchantName: shipment.merchant?.name,
                receiverName: shipment.receiverName,
                receiverPhone: shipment.receiverPhone,
                receiverAddress: shipment.receiverAddress,
                deliveryArea: shipment.deliveryArea,
                weight: shipment.weight,
                deliveryType: shipment.deliveryType,
                paymentMethod: shipment.paymentMethod,
                codAmount: shipment.codAmount,
                currentHub: shipment.currentHub,
                nextHub: shipment.nextHub,
                pickupId: shipment.pickupId,
                manifestId: shipment.manifestId,
                riderId: shipment.riderId,
                riderName: shipment.rider?.name,
                expectedDeliveryDate: shipment.expectedDeliveryDate,
                actualDeliveryDate: shipment.actualDeliveryDate,
                createdAt: shipment.createdAt,
                deliveryAttempts: shipment.deliveryAttempts,
                failedReason: shipment.failedReason,
                deliveryNote: shipment.deliveryNote,
                isRto: shipment.isRto,
                rtoReason: shipment.rtoReason,
                signatureUrl: shipment.signatureUrl,
                podPhotoUrl: shipment.podPhotoUrl,
                pickupPhotoUrl: shipment.pickupPhotoUrl,
                eta,
                timeline,
                riderLocation,
            },
        };
    }
    async generateTimeline(shipment) {
        const timeline = [];
        timeline.push({
            status: 'PENDING',
            timestamp: shipment.createdAt,
            description: 'Shipment created by merchant',
            actor: shipment.merchant?.name,
        });
        if (shipment.pickupId) {
            const pickup = await this.pickupRepository.findOne({
                where: { id: shipment.pickupId },
                relations: ['agent'],
            });
            if (pickup) {
                if (pickup.status === 'assigned' || pickup.status === 'in_progress' || pickup.status === 'completed') {
                    timeline.push({
                        status: 'PICKUP_ASSIGNED',
                        timestamp: pickup.updatedAt,
                        location: pickup.pickupAddress,
                        description: 'Pickup assigned to agent',
                        actor: pickup.agent?.name,
                    });
                }
                if (pickup.status === 'completed' && pickup.pickupDate) {
                    timeline.push({
                        status: 'PICKED_UP',
                        timestamp: pickup.pickupDate,
                        location: pickup.pickupAddress,
                        description: 'Shipment picked up by agent',
                        actor: pickup.agent?.name,
                    });
                }
            }
        }
        if (shipment.status === enums_1.ShipmentStatus.IN_HUB ||
            shipment.status === enums_1.ShipmentStatus.IN_TRANSIT ||
            shipment.status === enums_1.ShipmentStatus.OUT_FOR_DELIVERY ||
            shipment.status === enums_1.ShipmentStatus.DELIVERED ||
            shipment.status === enums_1.ShipmentStatus.FAILED_DELIVERY) {
            if (shipment.pickupId) {
                const pickup = await this.pickupRepository.findOne({
                    where: { id: shipment.pickupId },
                    select: ['pickupDate', 'status'],
                });
                if (pickup?.pickupDate) {
                    const hubArrival = new Date(pickup.pickupDate);
                    hubArrival.setHours(hubArrival.getHours() + 2);
                    timeline.push({
                        status: 'IN_HUB',
                        timestamp: hubArrival,
                        location: shipment.currentHub || 'Origin Hub',
                        description: 'Arrived at hub for sorting',
                    });
                }
            }
        }
        if (shipment.manifestId) {
            const manifest = await this.manifestRepository.findOne({
                where: { id: shipment.manifestId },
                relations: ['rider'],
            });
            if (manifest) {
                if (manifest.dispatchDate) {
                    timeline.push({
                        status: 'IN_TRANSIT',
                        timestamp: manifest.dispatchDate,
                        location: `${manifest.originHub} → ${manifest.destinationHub}`,
                        description: `Dispatched to ${manifest.destinationHub}`,
                        actor: manifest.rider?.name,
                    });
                }
                if (manifest.receivedDate) {
                    timeline.push({
                        status: 'IN_HUB',
                        timestamp: manifest.receivedDate,
                        location: manifest.destinationHub,
                        description: `Received at ${manifest.destinationHub}`,
                    });
                }
            }
        }
        if (shipment.status === enums_1.ShipmentStatus.OUT_FOR_DELIVERY ||
            shipment.status === enums_1.ShipmentStatus.DELIVERED ||
            shipment.status === enums_1.ShipmentStatus.FAILED_DELIVERY) {
            if (shipment.riderId) {
                const firstLocation = await this.riderLocationRepository.findOne({
                    where: { riderId: shipment.riderId, shipmentId: shipment.id },
                    order: { createdAt: 'ASC' },
                });
                if (firstLocation) {
                    timeline.push({
                        status: 'OUT_FOR_DELIVERY',
                        timestamp: firstLocation.createdAt,
                        location: shipment.deliveryArea,
                        description: 'Out for delivery',
                        actor: shipment.rider?.name,
                    });
                }
            }
        }
        if (shipment.deliveryAttempts > 0 && shipment.failedReason) {
            const attemptTime = new Date();
            attemptTime.setHours(attemptTime.getHours() - (shipment.deliveryAttempts * 2));
            timeline.push({
                status: 'FAILED_DELIVERY',
                timestamp: attemptTime,
                location: shipment.deliveryArea,
                description: `Delivery attempt failed: ${shipment.failedReason}`,
                actor: shipment.rider?.name,
            });
        }
        if (shipment.actualDeliveryDate) {
            timeline.push({
                status: 'DELIVERED',
                timestamp: shipment.actualDeliveryDate,
                location: shipment.receiverAddress,
                description: 'Shipment delivered successfully',
                actor: shipment.rider?.name,
            });
        }
        if (shipment.isRto) {
            timeline.push({
                status: 'RTO_INITIATED',
                timestamp: new Date(),
                location: shipment.currentHub,
                description: `Return to origin: ${shipment.rtoReason}`,
            });
        }
        timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        return timeline;
    }
    async getRiderCurrentLocation(riderId) {
        const location = await this.riderLocationRepository.findOne({
            where: { riderId },
            order: { createdAt: 'DESC' },
        });
        if (!location) {
            return null;
        }
        return {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: location.createdAt,
            isOnline: location.isOnline,
        };
    }
    async getRiderLocationHistory(riderId, limit = 10) {
        const locations = await this.riderLocationRepository.find({
            where: { riderId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
        return locations.map((loc) => ({
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy,
            speed: loc.speed,
            heading: loc.heading,
            timestamp: loc.createdAt,
        }));
    }
    calculateETA(shipment) {
        if (shipment.actualDeliveryDate) {
            return null;
        }
        if (shipment.isRto) {
            return null;
        }
        if (shipment.expectedDeliveryDate) {
            const now = new Date();
            if (shipment.expectedDeliveryDate > now) {
                const hoursRemaining = Math.ceil((shipment.expectedDeliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
                if (hoursRemaining <= 24) {
                    return `${hoursRemaining} hours`;
                }
                else {
                    const daysRemaining = Math.ceil(hoursRemaining / 24);
                    return `${daysRemaining} days`;
                }
            }
        }
        switch (shipment.status) {
            case enums_1.ShipmentStatus.PENDING:
            case enums_1.ShipmentStatus.PICKUP_ASSIGNED:
                return '2-3 days';
            case enums_1.ShipmentStatus.PICKED_UP:
            case enums_1.ShipmentStatus.IN_HUB:
                return '1-2 days';
            case enums_1.ShipmentStatus.IN_TRANSIT:
                return '12-24 hours';
            case enums_1.ShipmentStatus.OUT_FOR_DELIVERY:
                return '2-4 hours';
            default:
                return null;
        }
    }
    async emitStatusChange(shipment, oldStatus, newStatus) {
        const trackingData = {
            awb: shipment.awb,
            oldStatus,
            newStatus,
            currentLocation: shipment.currentHub || 'In Transit',
            timestamp: new Date().toISOString(),
        };
        await this.cacheService.publish(`tracking:${shipment.awb}`, trackingData);
        await this.cacheService.publish('tracking:all', trackingData);
        await this.cacheService.del(`tracking:public:${shipment.awb}`);
        await this.cacheService.del(`tracking:detailed:${shipment.awb}`);
        try {
            await this.pusher.trigger(`shipment-${shipment.awb}`, 'status-changed', trackingData);
            if (shipment.merchantId) {
                await this.pusher.trigger(`merchant-${shipment.merchantId}`, 'shipment-updated', trackingData);
            }
        }
        catch (error) {
            console.error('Pusher emit error:', error);
        }
        return trackingData;
    }
    async emitLocationUpdate(riderId, location, shipmentAwb) {
        const locationData = {
            riderId,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: new Date().toISOString(),
        };
        await this.cacheService.publish(`rider:location:${riderId}`, locationData);
        if (shipmentAwb) {
            await this.cacheService.publish(`tracking:${shipmentAwb}:location`, locationData);
        }
        await this.cacheService.set(`rider:location:latest:${riderId}`, locationData, 300);
        try {
            await this.pusher.trigger(`rider-${riderId}`, 'location-updated', locationData);
            if (shipmentAwb) {
                await this.pusher.trigger(`shipment-${shipmentAwb}`, 'rider-location-updated', locationData);
            }
        }
        catch (error) {
            console.error('Pusher location emit error:', error);
        }
        return locationData;
    }
    getSubscriptionInfo(awbNumber) {
        return {
            success: true,
            subscription: {
                channel: `shipment-${awbNumber}`,
                events: ['status-changed', 'rider-location-updated'],
                pusherKey: this.configService.get('PUSHER_KEY'),
                pusherCluster: this.configService.get('PUSHER_CLUSTER'),
            },
        };
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shipment_entity_1.Shipment)),
    __param(1, (0, typeorm_1.InjectRepository)(rider_location_entity_1.RiderLocation)),
    __param(2, (0, typeorm_1.InjectRepository)(pickup_entity_1.Pickup)),
    __param(3, (0, typeorm_1.InjectRepository)(manifest_entity_1.Manifest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        cache_service_1.CacheService])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map