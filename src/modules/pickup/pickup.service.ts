import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Pickup, PickupStatus } from '../../entities/pickup.entity';
import { Shipment } from '../../entities/shipment.entity';
import { User } from '../../entities/user.entity';
import { ShipmentStatus, UserRole } from '../../common/enums';
import { PaginatedResponseDto } from '../../common/dto';
import {
  CreatePickupDto,
  AssignPickupDto,
  CompletePickupDto,
  UpdatePickupDto,
  FilterPickupDto,
} from './dto';

@Injectable()
export class PickupService {
  constructor(
    @InjectRepository(Pickup)
    private readonly pickupRepository: Repository<Pickup>,
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new pickup request (Merchant)
   */
  async create(createPickupDto: CreatePickupDto, merchant: User): Promise<Pickup> {
    const pickup = this.pickupRepository.create({
      ...createPickupDto,
      merchantId: merchant.id,
      scheduledDate: new Date(createPickupDto.scheduledDate),
      status: PickupStatus.PENDING,
    });

    return await this.pickupRepository.save(pickup);
  }

  /**
   * Get all pickups with filters and pagination
   */
  async findAll(
    filterDto: FilterPickupDto,
    user: User,
  ): Promise<PaginatedResponseDto<Pickup>> {
    const { page = 1, limit = 10, merchantId, agentId, status, pickupCity, fromDate, toDate, search } = filterDto;

    const queryBuilder = this.pickupRepository
      .createQueryBuilder('pickup')
      .leftJoinAndSelect('pickup.merchant', 'merchant')
      .leftJoinAndSelect('pickup.agent', 'agent');

    // Role-based filtering
    if (user.role === UserRole.MERCHANT) {
      queryBuilder.andWhere('pickup.merchantId = :merchantId', { merchantId: user.id });
    } else if (user.role === UserRole.AGENT) {
      queryBuilder.andWhere('pickup.agentId = :agentId', { agentId: user.id });
    }

    // Apply filters
    if (merchantId) {
      queryBuilder.andWhere('pickup.merchantId = :merchantId', { merchantId });
    }

    if (agentId) {
      queryBuilder.andWhere('pickup.agentId = :agentId', { agentId });
    }

    if (status) {
      queryBuilder.andWhere('pickup.status = :status', { status });
    }

    if (pickupCity) {
      queryBuilder.andWhere('pickup.pickupCity = :pickupCity', { pickupCity });
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere('pickup.scheduledDate BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
      });
    } else if (fromDate) {
      queryBuilder.andWhere('pickup.scheduledDate >= :fromDate', {
        fromDate: new Date(fromDate),
      });
    } else if (toDate) {
      queryBuilder.andWhere('pickup.scheduledDate <= :toDate', {
        toDate: new Date(toDate),
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(pickup.contactPerson ILIKE :search OR pickup.contactPhone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Pagination
    const totalItems = await queryBuilder.getCount();
    const pickups = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('pickup.scheduledDate', 'DESC')
      .getMany();

    return new PaginatedResponseDto(pickups, page, limit, totalItems);
  }

  /**
   * Get pickup by ID
   */
  async findOne(id: string, user: User): Promise<Pickup> {
    const pickup = await this.pickupRepository.findOne({
      where: { id },
      relations: ['merchant', 'agent', 'shipments'],
    });

    if (!pickup) {
      throw new NotFoundException(`Pickup with ID ${id} not found`);
    }

    // Check access permissions
    if (user.role === UserRole.MERCHANT && pickup.merchantId !== user.id) {
      throw new ForbiddenException('You can only view your own pickups');
    }

    if (user.role === UserRole.AGENT && pickup.agentId !== user.id) {
      throw new ForbiddenException('You can only view pickups assigned to you');
    }

    return pickup;
  }

  /**
   * Update pickup (Merchant/Admin)
   */
  async update(id: string, updatePickupDto: UpdatePickupDto, user: User): Promise<Pickup> {
    const pickup = await this.findOne(id, user);

    // Only pending pickups can be updated
    if (pickup.status !== PickupStatus.PENDING) {
      throw new BadRequestException('Only pending pickups can be updated');
    }

    // Merchants can only update their own pickups
    if (user.role === UserRole.MERCHANT && pickup.merchantId !== user.id) {
      throw new ForbiddenException('You can only update your own pickups');
    }

    Object.assign(pickup, updatePickupDto);

    if (updatePickupDto.scheduledDate) {
      pickup.scheduledDate = new Date(updatePickupDto.scheduledDate);
    }

    return await this.pickupRepository.save(pickup);
  }

  /**
   * Assign pickup to agent (Admin/Hub Staff)
   */
  async assignPickup(id: string, assignPickupDto: AssignPickupDto): Promise<Pickup> {
    const pickup = await this.pickupRepository.findOne({ where: { id } });

    if (!pickup) {
      throw new NotFoundException(`Pickup with ID ${id} not found`);
    }

    if (pickup.status === PickupStatus.COMPLETED || pickup.status === PickupStatus.CANCELLED) {
      throw new BadRequestException('Cannot assign a completed or cancelled pickup');
    }

    // Verify agent exists and has AGENT role
    const agent = await this.userRepository.findOne({
      where: { id: assignPickupDto.agentId },
    });

    if (!agent || agent.role !== UserRole.AGENT) {
      throw new BadRequestException('Invalid agent ID or user is not an agent');
    }

    pickup.agentId = assignPickupDto.agentId;
    pickup.status = PickupStatus.ASSIGNED;

    return await this.pickupRepository.save(pickup);
  }

  /**
   * Start pickup (Agent)
   */
  async startPickup(id: string, user: User): Promise<Pickup> {
    const pickup = await this.pickupRepository.findOne({ where: { id } });

    if (!pickup) {
      throw new NotFoundException(`Pickup with ID ${id} not found`);
    }

    // Only assigned agent can start pickup
    if (pickup.agentId !== user.id) {
      throw new ForbiddenException('You can only start pickups assigned to you');
    }

    if (pickup.status !== PickupStatus.ASSIGNED) {
      throw new BadRequestException('Only assigned pickups can be started');
    }

    pickup.status = PickupStatus.IN_PROGRESS;

    return await this.pickupRepository.save(pickup);
  }

  /**
   * Complete pickup with shipment scanning (Agent)
   */
  async completePickup(
    id: string,
    completePickupDto: CompletePickupDto,
    user: User,
  ): Promise<Pickup> {
    const pickup = await this.pickupRepository.findOne({
      where: { id },
      relations: ['merchant'],
    });

    if (!pickup) {
      throw new NotFoundException(`Pickup with ID ${id} not found`);
    }

    // Only assigned agent can complete pickup
    if (pickup.agentId !== user.id) {
      throw new ForbiddenException('You can only complete pickups assigned to you');
    }

    if (pickup.status !== PickupStatus.IN_PROGRESS && pickup.status !== PickupStatus.ASSIGNED) {
      throw new BadRequestException('Only in-progress or assigned pickups can be completed');
    }

    // Validate and update shipments
    const { shipmentAwbs } = completePickupDto;
    const shipments = await this.shipmentRepository.find({
      where: shipmentAwbs.map((awb) => ({ awb })),
    });

    if (shipments.length !== shipmentAwbs.length) {
      throw new BadRequestException('Some shipment AWBs are invalid');
    }

    // Verify all shipments belong to the pickup merchant
    const invalidShipments = shipments.filter((s) => s.merchantId !== pickup.merchantId);
    if (invalidShipments.length > 0) {
      throw new BadRequestException('Some shipments do not belong to this merchant');
    }

    // Update shipment status and link to pickup
    for (const shipment of shipments) {
      shipment.pickupId = pickup.id;
      shipment.status = ShipmentStatus.PICKED_UP;
    }
    await this.shipmentRepository.save(shipments);

    // Update pickup
    pickup.status = PickupStatus.COMPLETED;
    pickup.pickupDate = new Date();
    
    if (completePickupDto.signatureUrl) {
      pickup.signatureUrl = completePickupDto.signatureUrl;
    }
    if (completePickupDto.photoUrl) {
      pickup.photoUrl = completePickupDto.photoUrl;
    }
    if (completePickupDto.latitude) {
      pickup.latitude = completePickupDto.latitude.toString();
    }
    if (completePickupDto.longitude) {
      pickup.longitude = completePickupDto.longitude.toString();
    }
    if (completePickupDto.notes) {
      pickup.notes = completePickupDto.notes;
    }
    
    pickup.totalShipments = shipments.length;

    return await this.pickupRepository.save(pickup);
  }

  /**
   * Cancel pickup (Merchant/Admin)
   */
  async cancelPickup(id: string, user: User): Promise<Pickup> {
    const pickup = await this.findOne(id, user);

    if (pickup.status === PickupStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed pickup');
    }

    // Merchants can only cancel their own pickups
    if (user.role === UserRole.MERCHANT && pickup.merchantId !== user.id) {
      throw new ForbiddenException('You can only cancel your own pickups');
    }

    pickup.status = PickupStatus.CANCELLED;

    return await this.pickupRepository.save(pickup);
  }

  /**
   * Get pickup statistics
   */
  async getStatistics(user: User): Promise<any> {
    const queryBuilder = this.pickupRepository.createQueryBuilder('pickup');

    // Role-based filtering
    if (user.role === UserRole.MERCHANT) {
      queryBuilder.where('pickup.merchantId = :merchantId', { merchantId: user.id });
    } else if (user.role === UserRole.AGENT) {
      queryBuilder.where('pickup.agentId = :agentId', { agentId: user.id });
    }

    const total = await queryBuilder.getCount();
    const pending = await queryBuilder
      .clone()
      .andWhere('pickup.status = :status', { status: PickupStatus.PENDING })
      .getCount();
    const assigned = await queryBuilder
      .clone()
      .andWhere('pickup.status = :status', { status: PickupStatus.ASSIGNED })
      .getCount();
    const inProgress = await queryBuilder
      .clone()
      .andWhere('pickup.status = :status', { status: PickupStatus.IN_PROGRESS })
      .getCount();
    const completed = await queryBuilder
      .clone()
      .andWhere('pickup.status = :status', { status: PickupStatus.COMPLETED })
      .getCount();
    const cancelled = await queryBuilder
      .clone()
      .andWhere('pickup.status = :status', { status: PickupStatus.CANCELLED })
      .getCount();

    return {
      total,
      pending,
      assigned,
      inProgress,
      completed,
      cancelled,
    };
  }

  /**
   * Get agent's assigned pickups for today
   */
  async getAgentTodayPickups(user: User): Promise<Pickup[]> {
    if (user.role !== UserRole.AGENT) {
      throw new ForbiddenException('Only agents can view their assigned pickups');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.pickupRepository.find({
      where: {
        agentId: user.id,
        scheduledDate: Between(today, tomorrow),
      },
      relations: ['merchant'],
      order: { scheduledDate: 'ASC' },
    });
  }
}
