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
exports.RiderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shipment_entity_1 = require("../../entities/shipment.entity");
const manifest_entity_1 = require("../../entities/manifest.entity");
const rider_location_entity_1 = require("../../entities/rider-location.entity");
const user_entity_1 = require("../../entities/user.entity");
const enums_1 = require("../../common/enums");
let RiderService = class RiderService {
    shipmentRepository;
    manifestRepository;
    riderLocationRepository;
    userRepository;
    constructor(shipmentRepository, manifestRepository, riderLocationRepository, userRepository) {
        this.shipmentRepository = shipmentRepository;
        this.manifestRepository = manifestRepository;
        this.riderLocationRepository = riderLocationRepository;
        this.userRepository = userRepository;
    }
    async getAssignedManifests(riderId) {
        const manifests = await this.manifestRepository.find({
            where: { riderId },
            relations: ['shipments', 'originHub', 'destinationHub'],
            order: { createdAt: 'DESC' },
        });
        return {
            success: true,
            total: manifests.length,
            manifests: manifests.map((manifest) => ({
                id: manifest.id,
                manifestNumber: manifest.manifestNumber,
                status: manifest.status,
                originHub: manifest.originHub,
                destinationHub: manifest.destinationHub,
                totalShipments: manifest.totalShipments,
                dispatchDate: manifest.dispatchDate,
                shipments: manifest.shipments.map((s) => ({
                    awb: s.awb,
                    status: s.status,
                    receiverName: s.receiverName,
                    receiverPhone: s.receiverPhone,
                    receiverAddress: s.receiverAddress,
                    deliveryArea: s.deliveryArea,
                    codAmount: s.codAmount,
                })),
            })),
        };
    }
    async getMyShipments(riderId) {
        const shipments = await this.shipmentRepository.find({
            where: {
                riderId,
                status: enums_1.ShipmentStatus.OUT_FOR_DELIVERY,
            },
            relations: ['merchant'],
            order: { createdAt: 'DESC' },
        });
        return {
            success: true,
            total: shipments.length,
            shipments: shipments.map((s) => ({
                id: s.id,
                awb: s.awb,
                status: s.status,
                merchantName: s.merchant?.name,
                receiverName: s.receiverName,
                receiverPhone: s.receiverPhone,
                receiverAddress: s.receiverAddress,
                deliveryArea: s.deliveryArea,
                codAmount: s.codAmount,
                deliveryType: s.deliveryType,
                weight: s.weight,
                deliveryAttempts: s.deliveryAttempts,
                expectedDeliveryDate: s.expectedDeliveryDate,
                specialInstructions: s.specialInstructions,
                otpCode: s.otpCode,
            })),
        };
    }
    async generateOTP(generateOTPDto, rider) {
        const { awbNumber } = generateOTPDto;
        const shipment = await this.shipmentRepository.findOne({
            where: { awb: awbNumber },
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment with AWB ${awbNumber} not found`);
        }
        if (shipment.riderId !== rider.id) {
            throw new common_1.ForbiddenException('This shipment is not assigned to you');
        }
        if (shipment.status !== enums_1.ShipmentStatus.OUT_FOR_DELIVERY) {
            throw new common_1.BadRequestException(`Cannot generate OTP. Shipment status is ${shipment.status}`);
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        shipment.otpCode = otp;
        await this.shipmentRepository.save(shipment);
        return {
            success: true,
            message: 'OTP generated and sent to customer',
            awb: awbNumber,
            otpGenerated: true,
        };
    }
    async completeDelivery(deliveryAttemptDto, rider) {
        const { awbNumber, otpCode, signatureUrl, podPhotoUrl, codAmountCollected, deliveryNote, latitude, longitude, } = deliveryAttemptDto;
        const shipment = await this.shipmentRepository.findOne({
            where: { awb: awbNumber },
            relations: ['merchant'],
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment with AWB ${awbNumber} not found`);
        }
        if (shipment.riderId !== rider.id) {
            throw new common_1.ForbiddenException('This shipment is not assigned to you');
        }
        if (shipment.status !== enums_1.ShipmentStatus.OUT_FOR_DELIVERY) {
            throw new common_1.BadRequestException(`Cannot deliver. Shipment status is ${shipment.status}`);
        }
        if (!shipment.otpCode) {
            throw new common_1.BadRequestException('OTP not generated for this shipment');
        }
        if (shipment.otpCode !== otpCode) {
            throw new common_1.BadRequestException('Invalid OTP code');
        }
        if (shipment.paymentMethod === enums_1.PaymentMethod.COD && shipment.codAmount > 0) {
            if (!codAmountCollected) {
                throw new common_1.BadRequestException('COD amount must be collected');
            }
            if (codAmountCollected !== shipment.codAmount) {
                throw new common_1.BadRequestException(`COD amount mismatch. Expected: ${shipment.codAmount}, Collected: ${codAmountCollected}`);
            }
        }
        shipment.status = enums_1.ShipmentStatus.DELIVERED;
        shipment.actualDeliveryDate = new Date();
        shipment.paymentStatus = shipment.paymentMethod === enums_1.PaymentMethod.COD ? enums_1.PaymentStatus.COLLECTED : shipment.paymentStatus;
        if (signatureUrl) {
            shipment.signatureUrl = signatureUrl;
        }
        if (podPhotoUrl) {
            shipment.podPhotoUrl = podPhotoUrl;
        }
        if (deliveryNote) {
            shipment.deliveryNote = deliveryNote;
        }
        await this.shipmentRepository.save(shipment);
        if (latitude && longitude) {
            await this.updateLocation({
                latitude,
                longitude,
                shipmentAwb: awbNumber,
                isOnline: true,
            }, rider);
        }
        return {
            success: true,
            message: 'Delivery completed successfully',
            awb: awbNumber,
            deliveredAt: shipment.actualDeliveryDate,
            codCollected: codAmountCollected || 0,
        };
    }
    async recordFailedDelivery(failedDeliveryDto, rider) {
        const { awbNumber, reason, notes, photoUrl, latitude, longitude } = failedDeliveryDto;
        const shipment = await this.shipmentRepository.findOne({
            where: { awb: awbNumber },
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment with AWB ${awbNumber} not found`);
        }
        if (shipment.riderId !== rider.id) {
            throw new common_1.ForbiddenException('This shipment is not assigned to you');
        }
        if (shipment.status !== enums_1.ShipmentStatus.OUT_FOR_DELIVERY) {
            throw new common_1.BadRequestException(`Cannot record failed delivery. Shipment status is ${shipment.status}`);
        }
        shipment.deliveryAttempts += 1;
        shipment.status = enums_1.ShipmentStatus.FAILED_DELIVERY;
        shipment.failedReason = `${reason}${notes ? ': ' + notes : ''}`;
        const MAX_DELIVERY_ATTEMPTS = 3;
        if (shipment.deliveryAttempts >= MAX_DELIVERY_ATTEMPTS) {
            shipment.status = enums_1.ShipmentStatus.RTO_INITIATED;
            shipment.isRto = true;
            shipment.rtoReason = `Maximum delivery attempts (${MAX_DELIVERY_ATTEMPTS}) exceeded`;
        }
        await this.shipmentRepository.save(shipment);
        if (latitude && longitude) {
            await this.updateLocation({
                latitude,
                longitude,
                shipmentAwb: awbNumber,
                isOnline: true,
            }, rider);
        }
        return {
            success: true,
            message: 'Failed delivery recorded',
            awb: awbNumber,
            deliveryAttempts: shipment.deliveryAttempts,
            status: shipment.status,
            autoRTO: shipment.deliveryAttempts >= MAX_DELIVERY_ATTEMPTS,
        };
    }
    async markRTO(rtoDto, rider) {
        const { awbNumber, reason, notes } = rtoDto;
        const shipment = await this.shipmentRepository.findOne({
            where: { awb: awbNumber },
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment with AWB ${awbNumber} not found`);
        }
        if (shipment.riderId !== rider.id) {
            throw new common_1.ForbiddenException('This shipment is not assigned to you');
        }
        shipment.status = enums_1.ShipmentStatus.RTO_INITIATED;
        shipment.isRto = true;
        shipment.rtoReason = `${reason}${notes ? ': ' + notes : ''}`;
        await this.shipmentRepository.save(shipment);
        return {
            success: true,
            message: 'Shipment marked for RTO',
            awb: awbNumber,
            status: shipment.status,
            rtoReason: shipment.rtoReason,
        };
    }
    async updateLocation(updateLocationDto, rider) {
        const { latitude, longitude, accuracy, speed, heading, batteryLevel, shipmentAwb, isOnline, } = updateLocationDto;
        let shipmentId = null;
        if (shipmentAwb) {
            const shipment = await this.shipmentRepository.findOne({
                where: { awb: shipmentAwb },
                select: ['id'],
            });
            if (shipment) {
                shipmentId = shipment.id;
            }
        }
        const location = new rider_location_entity_1.RiderLocation();
        location.riderId = rider.id;
        location.latitude = latitude;
        location.longitude = longitude;
        if (accuracy !== undefined) {
            location.accuracy = accuracy;
        }
        if (speed !== undefined) {
            location.speed = speed;
        }
        if (heading !== undefined) {
            location.heading = heading;
        }
        if (batteryLevel !== undefined) {
            location.batteryLevel = batteryLevel;
        }
        if (shipmentId) {
            location.shipmentId = shipmentId;
        }
        if (isOnline !== undefined) {
            location.isOnline = isOnline;
        }
        await this.riderLocationRepository.save(location);
        return {
            success: true,
            message: 'Location updated successfully',
            location: {
                latitude,
                longitude,
                timestamp: location.createdAt,
            },
        };
    }
    async getLocationHistory(riderId, limit = 50) {
        const locations = await this.riderLocationRepository.find({
            where: { riderId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
        return {
            success: true,
            total: locations.length,
            locations: locations.map((loc) => ({
                latitude: loc.latitude,
                longitude: loc.longitude,
                accuracy: loc.accuracy,
                speed: loc.speed,
                heading: loc.heading,
                batteryLevel: loc.batteryLevel,
                isOnline: loc.isOnline,
                timestamp: loc.createdAt,
            })),
        };
    }
    async getMyStatistics(riderId) {
        const qb = this.shipmentRepository.createQueryBuilder('shipment');
        const [totalAssigned, outForDelivery, delivered, failedDeliveries, rtoShipments,] = await Promise.all([
            qb.clone().where('shipment.riderId = :riderId', { riderId }).getCount(),
            qb
                .clone()
                .where('shipment.riderId = :riderId', { riderId })
                .andWhere('shipment.status = :status', {
                status: enums_1.ShipmentStatus.OUT_FOR_DELIVERY,
            })
                .getCount(),
            qb
                .clone()
                .where('shipment.riderId = :riderId', { riderId })
                .andWhere('shipment.status = :status', {
                status: enums_1.ShipmentStatus.DELIVERED,
            })
                .getCount(),
            qb
                .clone()
                .where('shipment.riderId = :riderId', { riderId })
                .andWhere('shipment.status = :status', {
                status: enums_1.ShipmentStatus.FAILED_DELIVERY,
            })
                .getCount(),
            qb
                .clone()
                .where('shipment.riderId = :riderId', { riderId })
                .andWhere('shipment.isRto = :isRto', { isRto: true })
                .getCount(),
        ]);
        const codResult = await this.shipmentRepository
            .createQueryBuilder('shipment')
            .select('SUM(shipment.codAmount)', 'totalCod')
            .where('shipment.riderId = :riderId', { riderId })
            .andWhere('shipment.status = :status', {
            status: enums_1.ShipmentStatus.DELIVERED,
        })
            .andWhere('shipment.paymentMethod = :method', { method: enums_1.PaymentMethod.COD })
            .getRawOne();
        const totalCodCollected = parseFloat(codResult?.totalCod || '0');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayDeliveries = await qb
            .clone()
            .where('shipment.riderId = :riderId', { riderId })
            .andWhere('shipment.status = :status', {
            status: enums_1.ShipmentStatus.DELIVERED,
        })
            .andWhere('shipment.actualDeliveryDate >= :today', { today })
            .getCount();
        return {
            success: true,
            statistics: {
                totalAssigned,
                outForDelivery,
                delivered,
                failedDeliveries,
                rtoShipments,
                todayDeliveries,
                totalCodCollected,
                deliveryRate: totalAssigned > 0
                    ? ((delivered / totalAssigned) * 100).toFixed(2) + '%'
                    : '0%',
            },
        };
    }
    async getShipmentDetails(awbNumber, rider) {
        const shipment = await this.shipmentRepository.findOne({
            where: { awb: awbNumber },
            relations: ['merchant', 'rider'],
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment with AWB ${awbNumber} not found`);
        }
        if (shipment.riderId !== rider.id) {
            throw new common_1.ForbiddenException('This shipment is not assigned to you');
        }
        return {
            success: true,
            shipment: {
                id: shipment.id,
                awb: shipment.awb,
                status: shipment.status,
                merchantName: shipment.merchant?.name,
                merchantPhone: shipment.merchant?.phone,
                receiverName: shipment.receiverName,
                receiverPhone: shipment.receiverPhone,
                receiverAddress: shipment.receiverAddress,
                deliveryArea: shipment.deliveryArea,
                codAmount: shipment.codAmount,
                deliveryType: shipment.deliveryType,
                weight: shipment.weight,
                paymentMethod: shipment.paymentMethod,
                paymentStatus: shipment.paymentStatus,
                deliveryAttempts: shipment.deliveryAttempts,
                failedReason: shipment.failedReason,
                deliveryNote: shipment.deliveryNote,
                expectedDeliveryDate: shipment.expectedDeliveryDate,
                actualDeliveryDate: shipment.actualDeliveryDate,
                specialInstructions: shipment.specialInstructions,
                otpCode: shipment.otpCode,
                isRto: shipment.isRto,
                rtoReason: shipment.rtoReason,
            },
        };
    }
};
exports.RiderService = RiderService;
exports.RiderService = RiderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shipment_entity_1.Shipment)),
    __param(1, (0, typeorm_1.InjectRepository)(manifest_entity_1.Manifest)),
    __param(2, (0, typeorm_1.InjectRepository)(rider_location_entity_1.RiderLocation)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RiderService);
//# sourceMappingURL=rider.service.js.map