import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { Shipment, User } from '../../entities';
import {
  CreateShipmentDto,
  UpdateShipmentDto,
  UpdateStatusDto,
  FilterShipmentDto,
  BulkUploadResult,
} from './dto';
import { PaginatedResponseDto } from '../../common/dto';
import { generateAWB } from '../../common/utils';
import { PricingService, GeoService } from '../../common/services';
import { ShipmentStatus, PaymentStatus, UserRole } from '../../common/enums';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly pricingService: PricingService,
    private readonly geoService: GeoService,
  ) {}

  /**
   * Create a new shipment
   */
  async create(
    createShipmentDto: CreateShipmentDto,
    merchant: User,
  ): Promise<Shipment> {
    // Generate unique AWB
    const awb = generateAWB();

    // Calculate distance
    let distance = 20; // Default 20km
    if (
      createShipmentDto.sender.latitude &&
      createShipmentDto.sender.longitude &&
      createShipmentDto.receiver.latitude &&
      createShipmentDto.receiver.longitude
    ) {
      distance = this.geoService.calculateDistance(
        createShipmentDto.sender.latitude,
        createShipmentDto.sender.longitude,
        createShipmentDto.receiver.latitude,
        createShipmentDto.receiver.longitude,
      );
    } else {
      distance = this.geoService.estimateDistanceByLocation(
        createShipmentDto.sender.city,
        createShipmentDto.sender.area,
        createShipmentDto.receiver.city,
        createShipmentDto.receiver.area,
      );
    }

    // Calculate pricing
    const pricing = this.pricingService.calculateDeliveryFee(
      createShipmentDto.weight,
      distance,
      createShipmentDto.deliveryType,
      createShipmentDto.codAmount || 0,
    );

    // Calculate expected delivery
    const expectedDeliveryDate = this.pricingService.calculateExpectedDelivery(
      createShipmentDto.deliveryType,
    );

    // Create shipment
    const shipment = this.shipmentRepository.create({
      awb,
      merchant,
      senderName: createShipmentDto.sender.name,
      senderPhone: createShipmentDto.sender.phone,
      senderCity: createShipmentDto.sender.city,
      senderArea: createShipmentDto.sender.area,
      senderAddress: createShipmentDto.sender.address,
      receiverName: createShipmentDto.receiver.name,
      receiverPhone: createShipmentDto.receiver.phone,
      receiverCity: createShipmentDto.receiver.city,
      receiverArea: createShipmentDto.receiver.area,
      receiverAddress: createShipmentDto.receiver.address,
      receiverLatitude: createShipmentDto.receiver.latitude?.toString(),
      receiverLongitude: createShipmentDto.receiver.longitude?.toString(),
      weight: createShipmentDto.weight,
      deliveryType: createShipmentDto.deliveryType,
      productDescription:
        createShipmentDto.productDescription || createShipmentDto.productCategory || 'General',
      declaredValue: createShipmentDto.declaredValue,
      paymentMethod: createShipmentDto.paymentMethod,
      codAmount: createShipmentDto.codAmount || 0,
      deliveryFee: pricing.totalFee,
      codFee: pricing.codFee,
      totalAmount: pricing.totalFee,
      expectedDeliveryDate,
      status: ShipmentStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      specialInstructions: createShipmentDto.specialInstructions,
      invoiceNumber: createShipmentDto.merchantInvoice,
    });

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Get all shipments with pagination and filters
   */
  async findAll(
    filterDto: FilterShipmentDto,
    user: User,
  ): Promise<PaginatedResponseDto<Shipment>> {
    const {
      page = 1,
      limit = 10,
      awb,
      merchantId,
      status,
      deliveryType,
      paymentMethod,
      paymentStatus,
      receiverCity,
      fromDate,
      toDate,
      search,
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: FindOptionsWhere<Shipment> = {};

    // If user is merchant, only show their shipments
    if (user.role === UserRole.MERCHANT) {
      where.merchant = { id: user.id };
    } else if (merchantId) {
      where.merchant = { id: merchantId };
    }

    if (awb) {
      where.awb = awb;
    }

    if (status) {
      where.status = status;
    }

    if (deliveryType) {
      where.deliveryType = deliveryType;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (receiverCity) {
      where.receiverCity = receiverCity;
    }

    // Date range filter
    if (fromDate && toDate) {
      where.createdAt = Between(new Date(fromDate), new Date(toDate));
    } else if (fromDate) {
      where.createdAt = Between(new Date(fromDate), new Date());
    }

    // Create query builder for search
    const queryBuilder = this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.merchant', 'merchant')
      .leftJoinAndSelect('shipment.assignedAgent', 'assignedAgent')
      .leftJoinAndSelect('shipment.assignedRider', 'assignedRider');

    // Apply filters
    Object.keys(where).forEach((key) => {
      if (key === 'merchant') {
        queryBuilder.andWhere('shipment.merchantId = :merchantId', {
          merchantId: (where[key] as any).id,
        });
      } else if (key === 'createdAt') {
        // Date range already handled
      } else {
        queryBuilder.andWhere(`shipment.${key} = :${key}`, {
          [key]: where[key],
        });
      }
    });

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(shipment.receiverName ILIKE :search OR shipment.receiverPhone ILIKE :search OR shipment.awbNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get total count
    const totalItems = await queryBuilder.getCount();

    // Get paginated data
    const data = await queryBuilder
      .orderBy('shipment.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get shipment by ID
   */
  async findOne(id: string, user: User): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['merchant', 'assignedAgent', 'assignedRider'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    // Check if user has access to this shipment
    if (
      user.role === UserRole.MERCHANT &&
      shipment.merchant.id !== user.id
    ) {
      throw new ForbiddenException('You do not have access to this shipment');
    }

    return shipment;
  }

  /**
   * Get shipment by AWB (public tracking)
   */
  async findByAWB(awb: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { awb },
      relations: ['merchant'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awb} not found`);
    }

    return shipment;
  }

  /**
   * Update shipment
   */
  async update(
    id: string,
    updateShipmentDto: UpdateShipmentDto,
    user: User,
  ): Promise<Shipment> {
    const shipment = await this.findOne(id, user);

    // Only allow updates if shipment is in PENDING status
    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException(
        'Cannot update shipment after it has been picked up',
      );
    }

    // Update sender info
    if (updateShipmentDto.sender) {
      if (updateShipmentDto.sender.name) shipment.senderName = updateShipmentDto.sender.name;
      if (updateShipmentDto.sender.phone) shipment.senderPhone = updateShipmentDto.sender.phone;
      if (updateShipmentDto.sender.city) shipment.senderCity = updateShipmentDto.sender.city;
      if (updateShipmentDto.sender.area) shipment.senderArea = updateShipmentDto.sender.area;
      if (updateShipmentDto.sender.address) shipment.senderAddress = updateShipmentDto.sender.address;
    }

    // Update receiver info
    if (updateShipmentDto.receiver) {
      if (updateShipmentDto.receiver.name) shipment.receiverName = updateShipmentDto.receiver.name;
      if (updateShipmentDto.receiver.phone) shipment.receiverPhone = updateShipmentDto.receiver.phone;
      if (updateShipmentDto.receiver.city) shipment.receiverCity = updateShipmentDto.receiver.city;
      if (updateShipmentDto.receiver.area) shipment.receiverArea = updateShipmentDto.receiver.area;
      if (updateShipmentDto.receiver.address) shipment.receiverAddress = updateShipmentDto.receiver.address;
      if (updateShipmentDto.receiver.latitude)
        shipment.receiverLatitude = updateShipmentDto.receiver.latitude.toString();
      if (updateShipmentDto.receiver.longitude)
        shipment.receiverLongitude = updateShipmentDto.receiver.longitude.toString();
    }

    // Update other fields
    if (updateShipmentDto.weight) shipment.weight = updateShipmentDto.weight;
    if (updateShipmentDto.deliveryType) shipment.deliveryType = updateShipmentDto.deliveryType;
    if (updateShipmentDto.productCategory || updateShipmentDto.productDescription)
      shipment.productDescription = updateShipmentDto.productDescription || updateShipmentDto.productCategory || shipment.productDescription;
    if (updateShipmentDto.declaredValue) shipment.declaredValue = updateShipmentDto.declaredValue;
    if (updateShipmentDto.codAmount !== undefined) shipment.codAmount = updateShipmentDto.codAmount;
    if (updateShipmentDto.specialInstructions)
      shipment.specialInstructions = updateShipmentDto.specialInstructions;

    // Recalculate pricing if weight or delivery type changed
    if (updateShipmentDto.weight || updateShipmentDto.deliveryType) {
      // Estimate distance again
      const distance = 20; // Default
      const pricing = this.pricingService.calculateDeliveryFee(
        shipment.weight,
        distance,
        shipment.deliveryType,
        shipment.codAmount,
      );
      shipment.deliveryFee = pricing.totalFee;
      shipment.codFee = pricing.codFee;
      shipment.totalAmount = pricing.totalFee;
    }

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Update shipment status
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
    user: User,
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['merchant'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    // Update status
    shipment.status = updateStatusDto.status;

    // Add remarks to delivery note
    if (updateStatusDto.remarks) {
      shipment.deliveryNote = updateStatusDto.remarks;
    }

    // Update delivery date if delivered
    if (updateStatusDto.status === ShipmentStatus.DELIVERED) {
      shipment.actualDeliveryDate = new Date();
      shipment.paymentStatus = PaymentStatus.COLLECTED; // If COD
    }

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Soft delete shipment
   */
  async remove(id: string, user: User): Promise<void> {
    const shipment = await this.findOne(id, user);

    // Only allow deletion if shipment is in PENDING status
    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException(
        'Cannot delete shipment after it has been picked up',
      );
    }

    await this.shipmentRepository.softRemove(shipment);
  }

  /**
   * Get shipment statistics
   */
  async getStatistics(user: User) {
    const where: FindOptionsWhere<Shipment> = {};

    if (user.role === UserRole.MERCHANT) {
      where.merchant = { id: user.id };
    }

    const totalShipments = await this.shipmentRepository.count({ where });
    const pendingShipments = await this.shipmentRepository.count({
      where: { ...where, status: ShipmentStatus.PENDING },
    });
    const inTransitShipments = await this.shipmentRepository.count({
      where: { ...where, status: ShipmentStatus.IN_TRANSIT },
    });
    const deliveredShipments = await this.shipmentRepository.count({
      where: { ...where, status: ShipmentStatus.DELIVERED },
    });

    // Count by status
    const statusStats = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select('shipment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where(
        user.role === UserRole.MERCHANT
          ? 'shipment.merchantId = :merchantId'
          : '1=1',
        { merchantId: user.id },
      )
      .groupBy('shipment.status')
      .getRawMany();

    return {
      totalShipments,
      pendingShipments,
      inTransitShipments,
      deliveredShipments,
      statusStats,
    };
  }

  /**
   * Bulk upload shipments from CSV (simplified version)
   */
  async bulkUpload(csvData: string, merchant: User): Promise<BulkUploadResult> {
    const result: BulkUploadResult = {
      totalRows: 0,
      successCount: 0,
      failedCount: 0,
      errors: [],
      shipments: [],
    };

    // Parse CSV data (simplified - in production use a proper CSV parser like papaparse)
    const rows = csvData.split('\n').filter((row) => row.trim());
    result.totalRows = rows.length - 1; // Exclude header

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      try {
        const columns = rows[i].split(',').map((col) => col.trim());

        // Expected format: receiverName, receiverPhone, receiverCity, receiverArea, receiverAddress, weight, codAmount
        if (columns.length < 7) {
          throw new Error('Invalid CSV format - insufficient columns');
        }

        const createDto: CreateShipmentDto = {
          sender: {
            name: merchant.name || 'Merchant',
            phone: merchant.phone,
            email: merchant.email || '',
            city: merchant.city || 'Dhaka',
            area: merchant.area || 'Unknown',
            address: merchant.address || 'Unknown',
          },
          receiver: {
            name: columns[0],
            phone: columns[1],
            city: columns[2],
            area: columns[3],
            address: columns[4],
          },
          deliveryType: (columns[7] as any) || 'normal',
          weight: parseFloat(columns[5]),
          paymentMethod: 'cod' as any,
          codAmount: parseFloat(columns[6]),
        };

        const shipment = await this.create(createDto, merchant);
        result.successCount++;
        result.shipments.push({
          awb: shipment.awb,
          receiverName: shipment.receiverName,
          receiverPhone: shipment.receiverPhone,
        });
      } catch (error: any) {
        result.failedCount++;
        result.errors.push({
          row: i + 1,
          error: error?.message || 'Unknown error',
        });
      }
    }

    return result;
  }
}
