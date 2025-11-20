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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pickup_entity_1 = require("../../entities/pickup.entity");
const shipment_entity_1 = require("../../entities/shipment.entity");
const user_entity_1 = require("../../entities/user.entity");
const enums_1 = require("../../common/enums");
const dto_1 = require("../../common/dto");
let PickupService = class PickupService {
    pickupRepository;
    shipmentRepository;
    userRepository;
    constructor(pickupRepository, shipmentRepository, userRepository) {
        this.pickupRepository = pickupRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
    }
    async create(createPickupDto, merchant) {
        const pickup = this.pickupRepository.create({
            ...createPickupDto,
            merchantId: merchant.id,
            scheduledDate: new Date(createPickupDto.scheduledDate),
            status: pickup_entity_1.PickupStatus.PENDING,
        });
        return await this.pickupRepository.save(pickup);
    }
    async findAll(filterDto, user) {
        const { page = 1, limit = 10, merchantId, agentId, status, pickupCity, fromDate, toDate, search } = filterDto;
        const queryBuilder = this.pickupRepository
            .createQueryBuilder('pickup')
            .leftJoinAndSelect('pickup.merchant', 'merchant')
            .leftJoinAndSelect('pickup.agent', 'agent');
        if (user.role === enums_1.UserRole.MERCHANT) {
            queryBuilder.andWhere('pickup.merchantId = :merchantId', { merchantId: user.id });
        }
        else if (user.role === enums_1.UserRole.AGENT) {
            queryBuilder.andWhere('pickup.agentId = :agentId', { agentId: user.id });
        }
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
        }
        else if (fromDate) {
            queryBuilder.andWhere('pickup.scheduledDate >= :fromDate', {
                fromDate: new Date(fromDate),
            });
        }
        else if (toDate) {
            queryBuilder.andWhere('pickup.scheduledDate <= :toDate', {
                toDate: new Date(toDate),
            });
        }
        if (search) {
            queryBuilder.andWhere('(pickup.contactPerson ILIKE :search OR pickup.contactPhone ILIKE :search)', { search: `%${search}%` });
        }
        const totalItems = await queryBuilder.getCount();
        const pickups = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('pickup.scheduledDate', 'DESC')
            .getMany();
        return new dto_1.PaginatedResponseDto(pickups, page, limit, totalItems);
    }
    async findOne(id, user) {
        const pickup = await this.pickupRepository.findOne({
            where: { id },
            relations: ['merchant', 'agent', 'shipments'],
        });
        if (!pickup) {
            throw new common_1.NotFoundException(`Pickup with ID ${id} not found`);
        }
        if (user.role === enums_1.UserRole.MERCHANT && pickup.merchantId !== user.id) {
            throw new common_1.ForbiddenException('You can only view your own pickups');
        }
        if (user.role === enums_1.UserRole.AGENT && pickup.agentId !== user.id) {
            throw new common_1.ForbiddenException('You can only view pickups assigned to you');
        }
        return pickup;
    }
    async update(id, updatePickupDto, user) {
        const pickup = await this.findOne(id, user);
        if (pickup.status !== pickup_entity_1.PickupStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending pickups can be updated');
        }
        if (user.role === enums_1.UserRole.MERCHANT && pickup.merchantId !== user.id) {
            throw new common_1.ForbiddenException('You can only update your own pickups');
        }
        Object.assign(pickup, updatePickupDto);
        if (updatePickupDto.scheduledDate) {
            pickup.scheduledDate = new Date(updatePickupDto.scheduledDate);
        }
        return await this.pickupRepository.save(pickup);
    }
    async assignPickup(id, assignPickupDto) {
        const pickup = await this.pickupRepository.findOne({ where: { id } });
        if (!pickup) {
            throw new common_1.NotFoundException(`Pickup with ID ${id} not found`);
        }
        if (pickup.status === pickup_entity_1.PickupStatus.COMPLETED || pickup.status === pickup_entity_1.PickupStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot assign a completed or cancelled pickup');
        }
        const agent = await this.userRepository.findOne({
            where: { id: assignPickupDto.agentId },
        });
        if (!agent || agent.role !== enums_1.UserRole.AGENT) {
            throw new common_1.BadRequestException('Invalid agent ID or user is not an agent');
        }
        pickup.agentId = assignPickupDto.agentId;
        pickup.status = pickup_entity_1.PickupStatus.ASSIGNED;
        return await this.pickupRepository.save(pickup);
    }
    async startPickup(id, user) {
        const pickup = await this.pickupRepository.findOne({ where: { id } });
        if (!pickup) {
            throw new common_1.NotFoundException(`Pickup with ID ${id} not found`);
        }
        if (pickup.agentId !== user.id) {
            throw new common_1.ForbiddenException('You can only start pickups assigned to you');
        }
        if (pickup.status !== pickup_entity_1.PickupStatus.ASSIGNED) {
            throw new common_1.BadRequestException('Only assigned pickups can be started');
        }
        pickup.status = pickup_entity_1.PickupStatus.IN_PROGRESS;
        return await this.pickupRepository.save(pickup);
    }
    async completePickup(id, completePickupDto, user) {
        const pickup = await this.pickupRepository.findOne({
            where: { id },
            relations: ['merchant'],
        });
        if (!pickup) {
            throw new common_1.NotFoundException(`Pickup with ID ${id} not found`);
        }
        if (pickup.agentId !== user.id) {
            throw new common_1.ForbiddenException('You can only complete pickups assigned to you');
        }
        if (pickup.status !== pickup_entity_1.PickupStatus.IN_PROGRESS && pickup.status !== pickup_entity_1.PickupStatus.ASSIGNED) {
            throw new common_1.BadRequestException('Only in-progress or assigned pickups can be completed');
        }
        const { shipmentAwbs } = completePickupDto;
        const shipments = await this.shipmentRepository.find({
            where: shipmentAwbs.map((awb) => ({ awb })),
        });
        if (shipments.length !== shipmentAwbs.length) {
            throw new common_1.BadRequestException('Some shipment AWBs are invalid');
        }
        const invalidShipments = shipments.filter((s) => s.merchantId !== pickup.merchantId);
        if (invalidShipments.length > 0) {
            throw new common_1.BadRequestException('Some shipments do not belong to this merchant');
        }
        for (const shipment of shipments) {
            shipment.pickupId = pickup.id;
            shipment.status = enums_1.ShipmentStatus.PICKED_UP;
        }
        await this.shipmentRepository.save(shipments);
        pickup.status = pickup_entity_1.PickupStatus.COMPLETED;
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
    async cancelPickup(id, user) {
        const pickup = await this.findOne(id, user);
        if (pickup.status === pickup_entity_1.PickupStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel a completed pickup');
        }
        if (user.role === enums_1.UserRole.MERCHANT && pickup.merchantId !== user.id) {
            throw new common_1.ForbiddenException('You can only cancel your own pickups');
        }
        pickup.status = pickup_entity_1.PickupStatus.CANCELLED;
        return await this.pickupRepository.save(pickup);
    }
    async getStatistics(user) {
        const queryBuilder = this.pickupRepository.createQueryBuilder('pickup');
        if (user.role === enums_1.UserRole.MERCHANT) {
            queryBuilder.where('pickup.merchantId = :merchantId', { merchantId: user.id });
        }
        else if (user.role === enums_1.UserRole.AGENT) {
            queryBuilder.where('pickup.agentId = :agentId', { agentId: user.id });
        }
        const total = await queryBuilder.getCount();
        const pending = await queryBuilder
            .clone()
            .andWhere('pickup.status = :status', { status: pickup_entity_1.PickupStatus.PENDING })
            .getCount();
        const assigned = await queryBuilder
            .clone()
            .andWhere('pickup.status = :status', { status: pickup_entity_1.PickupStatus.ASSIGNED })
            .getCount();
        const inProgress = await queryBuilder
            .clone()
            .andWhere('pickup.status = :status', { status: pickup_entity_1.PickupStatus.IN_PROGRESS })
            .getCount();
        const completed = await queryBuilder
            .clone()
            .andWhere('pickup.status = :status', { status: pickup_entity_1.PickupStatus.COMPLETED })
            .getCount();
        const cancelled = await queryBuilder
            .clone()
            .andWhere('pickup.status = :status', { status: pickup_entity_1.PickupStatus.CANCELLED })
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
    async getAgentTodayPickups(user) {
        if (user.role !== enums_1.UserRole.AGENT) {
            throw new common_1.ForbiddenException('Only agents can view their assigned pickups');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return await this.pickupRepository.find({
            where: {
                agentId: user.id,
                scheduledDate: (0, typeorm_2.Between)(today, tomorrow),
            },
            relations: ['merchant'],
            order: { scheduledDate: 'ASC' },
        });
    }
};
exports.PickupService = PickupService;
exports.PickupService = PickupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pickup_entity_1.Pickup)),
    __param(1, (0, typeorm_1.InjectRepository)(shipment_entity_1.Shipment)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PickupService);
//# sourceMappingURL=pickup.service.js.map