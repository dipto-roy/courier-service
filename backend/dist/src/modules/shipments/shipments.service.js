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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../entities");
const utils_1 = require("../../common/utils");
const services_1 = require("../../common/services");
const enums_1 = require("../../common/enums");
let ShipmentsService = class ShipmentsService {
    shipmentRepository;
    userRepository;
    pricingService;
    geoService;
    constructor(shipmentRepository, userRepository, pricingService, geoService) {
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.pricingService = pricingService;
        this.geoService = geoService;
    }
    async create(createShipmentDto, merchant) {
        const awb = (0, utils_1.generateAWB)();
        let distance = 20;
        if (createShipmentDto.sender.latitude &&
            createShipmentDto.sender.longitude &&
            createShipmentDto.receiver.latitude &&
            createShipmentDto.receiver.longitude) {
            distance = this.geoService.calculateDistance(createShipmentDto.sender.latitude, createShipmentDto.sender.longitude, createShipmentDto.receiver.latitude, createShipmentDto.receiver.longitude);
        }
        else {
            distance = this.geoService.estimateDistanceByLocation(createShipmentDto.sender.city, createShipmentDto.sender.area, createShipmentDto.receiver.city, createShipmentDto.receiver.area);
        }
        const pricing = this.pricingService.calculateDeliveryFee(createShipmentDto.weight, distance, createShipmentDto.deliveryType, createShipmentDto.codAmount || 0);
        const expectedDeliveryDate = this.pricingService.calculateExpectedDelivery(createShipmentDto.deliveryType);
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
            productDescription: createShipmentDto.productDescription || createShipmentDto.productCategory || 'General',
            declaredValue: createShipmentDto.declaredValue,
            paymentMethod: createShipmentDto.paymentMethod,
            codAmount: createShipmentDto.codAmount || 0,
            deliveryFee: pricing.totalFee,
            codFee: pricing.codFee,
            totalAmount: pricing.totalFee,
            expectedDeliveryDate,
            status: enums_1.ShipmentStatus.PENDING,
            paymentStatus: enums_1.PaymentStatus.PENDING,
            specialInstructions: createShipmentDto.specialInstructions,
            invoiceNumber: createShipmentDto.merchantInvoice,
        });
        return await this.shipmentRepository.save(shipment);
    }
    async findAll(filterDto, user) {
        const { page = 1, limit = 10, awb, merchantId, status, deliveryType, paymentMethod, paymentStatus, receiverCity, fromDate, toDate, search, } = filterDto;
        const skip = (page - 1) * limit;
        const where = {};
        if (user.role === enums_1.UserRole.MERCHANT) {
            where.merchant = { id: user.id };
        }
        else if (merchantId) {
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
        if (fromDate && toDate) {
            where.createdAt = (0, typeorm_2.Between)(new Date(fromDate), new Date(toDate));
        }
        else if (fromDate) {
            where.createdAt = (0, typeorm_2.Between)(new Date(fromDate), new Date());
        }
        const queryBuilder = this.shipmentRepository
            .createQueryBuilder('shipment')
            .leftJoinAndSelect('shipment.merchant', 'merchant')
            .leftJoinAndSelect('shipment.customer', 'customer')
            .leftJoinAndSelect('shipment.rider', 'rider')
            .leftJoinAndSelect('shipment.pickup', 'pickup');
        Object.keys(where).forEach((key) => {
            if (key === 'merchant') {
                queryBuilder.andWhere('shipment.merchantId = :merchantId', {
                    merchantId: where[key].id,
                });
            }
            else if (key === 'createdAt') {
            }
            else {
                queryBuilder.andWhere(`shipment.${key} = :${key}`, {
                    [key]: where[key],
                });
            }
        });
        if (search) {
            queryBuilder.andWhere('(shipment.receiverName ILIKE :search OR shipment.receiverPhone ILIKE :search OR shipment.awb ILIKE :search)', { search: `%${search}%` });
        }
        const totalItems = await queryBuilder.cache(`shipments_count_${JSON.stringify(filterDto)}`, 30000).getCount();
        const data = await queryBuilder
            .orderBy('shipment.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .cache(`shipments_${JSON.stringify(filterDto)}_page_${page}`, 60000)
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
    async findOne(id, user) {
        const shipment = await this.shipmentRepository
            .createQueryBuilder('shipment')
            .leftJoinAndSelect('shipment.merchant', 'merchant')
            .leftJoinAndSelect('shipment.customer', 'customer')
            .leftJoinAndSelect('shipment.rider', 'rider')
            .leftJoinAndSelect('shipment.pickup', 'pickup')
            .leftJoinAndSelect('shipment.manifest', 'manifest')
            .where('shipment.id = :id', { id })
            .cache(`shipment_${id}`, 120000)
            .getOne();
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment with ID ${id} not found`);
        }
        if (user.role === enums_1.UserRole.MERCHANT &&
            shipment.merchant.id !== user.id) {
            throw new common_1.ForbiddenException('You do not have access to this shipment');
        }
        return shipment;
    }
    async findByAWB(awb) {
        const shipment = await this.shipmentRepository
            .createQueryBuilder('shipment')
            .leftJoinAndSelect('shipment.merchant', 'merchant')
            .where('shipment.awb = :awb', { awb })
            .cache(`shipment_awb_${awb}`, 300000)
            .getOne();
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment with AWB ${awb} not found`);
        }
        return shipment;
    }
    async update(id, updateShipmentDto, user) {
        const shipment = await this.findOne(id, user);
        if (shipment.status !== enums_1.ShipmentStatus.PENDING) {
            throw new common_1.BadRequestException('Cannot update shipment after it has been picked up');
        }
        if (updateShipmentDto.sender) {
            if (updateShipmentDto.sender.name)
                shipment.senderName = updateShipmentDto.sender.name;
            if (updateShipmentDto.sender.phone)
                shipment.senderPhone = updateShipmentDto.sender.phone;
            if (updateShipmentDto.sender.city)
                shipment.senderCity = updateShipmentDto.sender.city;
            if (updateShipmentDto.sender.area)
                shipment.senderArea = updateShipmentDto.sender.area;
            if (updateShipmentDto.sender.address)
                shipment.senderAddress = updateShipmentDto.sender.address;
        }
        if (updateShipmentDto.receiver) {
            if (updateShipmentDto.receiver.name)
                shipment.receiverName = updateShipmentDto.receiver.name;
            if (updateShipmentDto.receiver.phone)
                shipment.receiverPhone = updateShipmentDto.receiver.phone;
            if (updateShipmentDto.receiver.city)
                shipment.receiverCity = updateShipmentDto.receiver.city;
            if (updateShipmentDto.receiver.area)
                shipment.receiverArea = updateShipmentDto.receiver.area;
            if (updateShipmentDto.receiver.address)
                shipment.receiverAddress = updateShipmentDto.receiver.address;
            if (updateShipmentDto.receiver.latitude)
                shipment.receiverLatitude = updateShipmentDto.receiver.latitude.toString();
            if (updateShipmentDto.receiver.longitude)
                shipment.receiverLongitude = updateShipmentDto.receiver.longitude.toString();
        }
        if (updateShipmentDto.weight)
            shipment.weight = updateShipmentDto.weight;
        if (updateShipmentDto.deliveryType)
            shipment.deliveryType = updateShipmentDto.deliveryType;
        if (updateShipmentDto.productCategory || updateShipmentDto.productDescription)
            shipment.productDescription = updateShipmentDto.productDescription || updateShipmentDto.productCategory || shipment.productDescription;
        if (updateShipmentDto.declaredValue)
            shipment.declaredValue = updateShipmentDto.declaredValue;
        if (updateShipmentDto.codAmount !== undefined)
            shipment.codAmount = updateShipmentDto.codAmount;
        if (updateShipmentDto.specialInstructions)
            shipment.specialInstructions = updateShipmentDto.specialInstructions;
        if (updateShipmentDto.weight || updateShipmentDto.deliveryType) {
            const distance = 20;
            const pricing = this.pricingService.calculateDeliveryFee(shipment.weight, distance, shipment.deliveryType, shipment.codAmount);
            shipment.deliveryFee = pricing.totalFee;
            shipment.codFee = pricing.codFee;
            shipment.totalAmount = pricing.totalFee;
        }
        return await this.shipmentRepository.save(shipment);
    }
    async updateStatus(id, updateStatusDto, user) {
        const shipment = await this.shipmentRepository.findOne({
            where: { id },
            relations: ['merchant'],
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment with ID ${id} not found`);
        }
        shipment.status = updateStatusDto.status;
        if (updateStatusDto.remarks) {
            shipment.deliveryNote = updateStatusDto.remarks;
        }
        if (updateStatusDto.status === enums_1.ShipmentStatus.DELIVERED) {
            shipment.actualDeliveryDate = new Date();
            shipment.paymentStatus = enums_1.PaymentStatus.COLLECTED;
        }
        return await this.shipmentRepository.save(shipment);
    }
    async remove(id, user) {
        const shipment = await this.findOne(id, user);
        if (shipment.status !== enums_1.ShipmentStatus.PENDING) {
            throw new common_1.BadRequestException('Cannot delete shipment after it has been picked up');
        }
        await this.shipmentRepository.softRemove(shipment);
    }
    async getStatistics(user) {
        const where = {};
        if (user.role === enums_1.UserRole.MERCHANT) {
            where.merchant = { id: user.id };
        }
        const totalShipments = await this.shipmentRepository.count({ where });
        const pendingShipments = await this.shipmentRepository.count({
            where: { ...where, status: enums_1.ShipmentStatus.PENDING },
        });
        const inTransitShipments = await this.shipmentRepository.count({
            where: { ...where, status: enums_1.ShipmentStatus.IN_TRANSIT },
        });
        const deliveredShipments = await this.shipmentRepository.count({
            where: { ...where, status: enums_1.ShipmentStatus.DELIVERED },
        });
        const statusStats = await this.shipmentRepository
            .createQueryBuilder('shipment')
            .select('shipment.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where(user.role === enums_1.UserRole.MERCHANT
            ? 'shipment.merchantId = :merchantId'
            : '1=1', { merchantId: user.id })
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
    async bulkUpload(csvData, merchant) {
        const result = {
            totalRows: 0,
            successCount: 0,
            failedCount: 0,
            errors: [],
            shipments: [],
        };
        if (!csvData || typeof csvData !== 'string') {
            throw new common_1.BadRequestException('CSV data is required and must be a valid string');
        }
        const rows = csvData.split('\n').filter((row) => row.trim());
        if (rows.length < 2) {
            throw new common_1.BadRequestException('CSV must contain at least a header row and one data row');
        }
        result.totalRows = rows.length - 1;
        for (let i = 1; i < rows.length; i++) {
            try {
                const columns = rows[i].split(',').map((col) => col.trim());
                if (columns.length < 7) {
                    throw new Error('Invalid CSV format - insufficient columns');
                }
                const createDto = {
                    sender: {
                        name: merchant.name || 'Merchant',
                        phone: merchant.phone || '01700000000',
                        email: merchant.email || undefined,
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
                    deliveryType: columns[7] || 'normal',
                    weight: parseFloat(columns[5]),
                    paymentMethod: 'cod',
                    codAmount: parseFloat(columns[6]),
                };
                const shipment = await this.create(createDto, merchant);
                result.successCount++;
                result.shipments.push({
                    awb: shipment.awb,
                    receiverName: shipment.receiverName,
                    receiverPhone: shipment.receiverPhone,
                });
            }
            catch (error) {
                result.failedCount++;
                result.errors.push({
                    row: i + 1,
                    error: error?.message || 'Unknown error',
                });
            }
        }
        return result;
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Shipment)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        services_1.PricingService,
        services_1.GeoService])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map