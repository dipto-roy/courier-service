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
exports.HubService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manifest_entity_1 = require("../../entities/manifest.entity");
const shipment_entity_1 = require("../../entities/shipment.entity");
const user_entity_1 = require("../../entities/user.entity");
const enums_1 = require("../../common/enums");
let HubService = class HubService {
    manifestRepository;
    shipmentRepository;
    userRepository;
    constructor(manifestRepository, shipmentRepository, userRepository) {
        this.manifestRepository = manifestRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
    }
    async generateManifestNumber() {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const lastManifest = await this.manifestRepository
            .createQueryBuilder('manifest')
            .where('manifest.manifestNumber LIKE :pattern', {
            pattern: `MF-${dateStr}-%`,
        })
            .orderBy('manifest.manifestNumber', 'DESC')
            .getOne();
        let sequence = 1;
        if (lastManifest) {
            const lastSequence = parseInt(lastManifest.manifestNumber.split('-')[2], 10);
            sequence = lastSequence + 1;
        }
        return `MF-${dateStr}-${sequence.toString().padStart(4, '0')}`;
    }
    async inboundScan(inboundScanDto, user) {
        const { awbNumbers, hubLocation, manifestId, notes } = inboundScanDto;
        const shipments = await this.shipmentRepository.find({
            where: { awb: (0, typeorm_2.In)(awbNumbers) },
            relations: ['merchant'],
        });
        if (shipments.length !== awbNumbers.length) {
            const foundAwbs = shipments.map((s) => s.awb);
            const notFound = awbNumbers.filter((awb) => !foundAwbs.includes(awb));
            throw new common_1.BadRequestException(`Shipments not found: ${notFound.join(', ')}`);
        }
        const invalidShipments = shipments.filter((s) => ![
            enums_1.ShipmentStatus.PICKED_UP,
            enums_1.ShipmentStatus.IN_TRANSIT,
            enums_1.ShipmentStatus.IN_HUB,
        ].includes(s.status));
        if (invalidShipments.length > 0) {
            throw new common_1.BadRequestException(`Invalid status for inbound scan: ${invalidShipments.map((s) => s.awb).join(', ')}`);
        }
        const scannedShipments = [];
        for (const shipment of shipments) {
            shipment.status = enums_1.ShipmentStatus.IN_HUB;
            shipment.currentHub = hubLocation;
            if (manifestId) {
                shipment.manifestId = manifestId;
            }
            await this.shipmentRepository.save(shipment);
            scannedShipments.push({
                awb: shipment.awb,
                status: shipment.status,
                currentHub: shipment.currentHub,
            });
        }
        if (manifestId) {
            const manifest = await this.manifestRepository.findOne({
                where: { id: manifestId },
            });
            if (manifest && manifest.status === manifest_entity_1.ManifestStatus.IN_TRANSIT) {
                manifest.status = manifest_entity_1.ManifestStatus.RECEIVED;
                manifest.receivedDate = new Date();
                manifest.receivedById = user.id;
                if (notes) {
                    manifest.notes = notes;
                }
                await this.manifestRepository.save(manifest);
            }
        }
        return {
            success: true,
            scannedCount: scannedShipments.length,
            hubLocation,
            scannedShipments,
            message: `Successfully scanned ${scannedShipments.length} shipments at ${hubLocation}`,
        };
    }
    async outboundScan(outboundScanDto, user) {
        const { awbNumbers, originHub, destinationHub, riderId, notes } = outboundScanDto;
        const shipments = await this.shipmentRepository.find({
            where: { awb: (0, typeorm_2.In)(awbNumbers) },
        });
        if (shipments.length !== awbNumbers.length) {
            const foundAwbs = shipments.map((s) => s.awb);
            const notFound = awbNumbers.filter((awb) => !foundAwbs.includes(awb));
            throw new common_1.BadRequestException(`Shipments not found: ${notFound.join(', ')}`);
        }
        const invalidShipments = shipments.filter((s) => s.currentHub !== originHub || s.status !== enums_1.ShipmentStatus.IN_HUB);
        if (invalidShipments.length > 0) {
            throw new common_1.BadRequestException(`Shipments not at ${originHub} or invalid status: ${invalidShipments.map((s) => s.awb).join(', ')}`);
        }
        if (riderId) {
            const rider = await this.userRepository.findOne({
                where: { id: riderId },
            });
            if (!rider) {
                throw new common_1.NotFoundException('Rider not found');
            }
            if (rider.role !== enums_1.UserRole.RIDER) {
                throw new common_1.BadRequestException('User is not a rider');
            }
        }
        const scannedShipments = [];
        for (const shipment of shipments) {
            if (riderId) {
                shipment.status = enums_1.ShipmentStatus.OUT_FOR_DELIVERY;
                shipment.riderId = riderId;
            }
            else if (destinationHub) {
                shipment.status = enums_1.ShipmentStatus.IN_TRANSIT;
                shipment.nextHub = destinationHub;
            }
            else {
                shipment.status = enums_1.ShipmentStatus.IN_TRANSIT;
            }
            await this.shipmentRepository.save(shipment);
            scannedShipments.push({
                awb: shipment.awb,
                status: shipment.status,
                destination: destinationHub || 'Out for delivery',
            });
        }
        return {
            success: true,
            scannedCount: scannedShipments.length,
            originHub,
            destinationHub: destinationHub || (riderId ? 'Rider delivery' : null),
            scannedShipments,
            message: `Successfully dispatched ${scannedShipments.length} shipments from ${originHub}`,
        };
    }
    async createManifest(createManifestDto, user) {
        const { originHub, destinationHub, awbNumbers, riderId, notes } = createManifestDto;
        const shipments = await this.shipmentRepository.find({
            where: { awb: (0, typeorm_2.In)(awbNumbers) },
        });
        if (shipments.length !== awbNumbers.length) {
            const foundAwbs = shipments.map((s) => s.awb);
            const notFound = awbNumbers.filter((awb) => !foundAwbs.includes(awb));
            throw new common_1.BadRequestException(`Shipments not found: ${notFound.join(', ')}`);
        }
        const invalidShipments = shipments.filter((s) => s.currentHub !== originHub || s.status !== enums_1.ShipmentStatus.IN_HUB);
        if (invalidShipments.length > 0) {
            throw new common_1.BadRequestException(`Some shipments are not at ${originHub}: ${invalidShipments.map((s) => s.awb).join(', ')}`);
        }
        if (riderId) {
            const rider = await this.userRepository.findOne({
                where: { id: riderId, role: enums_1.UserRole.RIDER },
            });
            if (!rider) {
                throw new common_1.NotFoundException('Rider not found or invalid role');
            }
        }
        const manifestNumber = await this.generateManifestNumber();
        const manifest = new manifest_entity_1.Manifest();
        manifest.manifestNumber = manifestNumber;
        manifest.originHub = originHub;
        manifest.destinationHub = destinationHub;
        if (riderId) {
            manifest.riderId = riderId;
        }
        manifest.status = manifest_entity_1.ManifestStatus.CREATED;
        manifest.totalShipments = shipments.length;
        manifest.createdById = user.id;
        if (notes) {
            manifest.notes = notes;
        }
        await this.manifestRepository.save(manifest);
        for (const shipment of shipments) {
            shipment.manifestId = manifest.id;
            shipment.status = enums_1.ShipmentStatus.IN_TRANSIT;
            shipment.nextHub = destinationHub;
            await this.shipmentRepository.save(shipment);
        }
        manifest.status = manifest_entity_1.ManifestStatus.IN_TRANSIT;
        manifest.dispatchDate = new Date();
        await this.manifestRepository.save(manifest);
        return {
            success: true,
            manifest: {
                id: manifest.id,
                manifestNumber: manifest.manifestNumber,
                originHub: manifest.originHub,
                destinationHub: manifest.destinationHub,
                totalShipments: manifest.totalShipments,
                status: manifest.status,
                dispatchDate: manifest.dispatchDate,
            },
            message: `Manifest ${manifestNumber} created with ${shipments.length} shipments`,
        };
    }
    async receiveManifest(manifestId, receiveManifestDto, user) {
        const { receivedAwbNumbers, hubLocation, notes } = receiveManifestDto;
        const manifest = await this.manifestRepository.findOne({
            where: { id: manifestId },
            relations: ['shipments'],
        });
        if (!manifest) {
            throw new common_1.NotFoundException('Manifest not found');
        }
        if (manifest.status !== manifest_entity_1.ManifestStatus.IN_TRANSIT) {
            throw new common_1.BadRequestException('Manifest is not in transit, cannot receive');
        }
        if (manifest.destinationHub !== hubLocation) {
            throw new common_1.BadRequestException(`This manifest is for ${manifest.destinationHub}, not ${hubLocation}`);
        }
        const manifestShipmentAwbs = manifest.shipments.map((s) => s.awb);
        const notInManifest = receivedAwbNumbers.filter((awb) => !manifestShipmentAwbs.includes(awb));
        const notReceived = manifestShipmentAwbs.filter((awb) => !receivedAwbNumbers.includes(awb));
        const receivedShipments = await this.shipmentRepository.find({
            where: { awb: (0, typeorm_2.In)(receivedAwbNumbers) },
        });
        for (const shipment of receivedShipments) {
            shipment.status = enums_1.ShipmentStatus.IN_HUB;
            shipment.currentHub = hubLocation;
            await this.shipmentRepository.save(shipment);
        }
        manifest.status = manifest_entity_1.ManifestStatus.RECEIVED;
        manifest.receivedDate = new Date();
        manifest.receivedById = user.id;
        if (notes || notInManifest.length > 0 || notReceived.length > 0) {
            const discrepancyNotes = [];
            if (notInManifest.length > 0) {
                discrepancyNotes.push(`Extra shipments: ${notInManifest.join(', ')}`);
            }
            if (notReceived.length > 0) {
                discrepancyNotes.push(`Missing shipments: ${notReceived.join(', ')}`);
            }
            if (notes) {
                discrepancyNotes.push(notes);
            }
            manifest.notes = discrepancyNotes.join(' | ');
        }
        await this.manifestRepository.save(manifest);
        return {
            success: true,
            manifestNumber: manifest.manifestNumber,
            receivedCount: receivedShipments.length,
            expectedCount: manifest.totalShipments,
            discrepancies: {
                notInManifest,
                notReceived,
            },
            message: `Manifest ${manifest.manifestNumber} received at ${hubLocation}`,
        };
    }
    async closeManifest(manifestId, user) {
        const manifest = await this.manifestRepository.findOne({
            where: { id: manifestId },
        });
        if (!manifest) {
            throw new common_1.NotFoundException('Manifest not found');
        }
        if (manifest.status !== manifest_entity_1.ManifestStatus.RECEIVED) {
            throw new common_1.BadRequestException('Can only close received manifests');
        }
        manifest.status = manifest_entity_1.ManifestStatus.CLOSED;
        await this.manifestRepository.save(manifest);
        return {
            success: true,
            manifestNumber: manifest.manifestNumber,
            message: 'Manifest closed successfully',
        };
    }
    async sortShipments(sortingDto, user) {
        const { awbNumbers, hubLocation, destinationHub } = sortingDto;
        const shipments = await this.shipmentRepository.find({
            where: { awb: (0, typeorm_2.In)(awbNumbers) },
        });
        if (shipments.length !== awbNumbers.length) {
            const foundAwbs = shipments.map((s) => s.awb);
            const notFound = awbNumbers.filter((awb) => !foundAwbs.includes(awb));
            throw new common_1.BadRequestException(`Shipments not found: ${notFound.join(', ')}`);
        }
        const invalidShipments = shipments.filter((s) => s.currentHub !== hubLocation || s.status !== enums_1.ShipmentStatus.IN_HUB);
        if (invalidShipments.length > 0) {
            throw new common_1.BadRequestException(`Some shipments are not at ${hubLocation}: ${invalidShipments.map((s) => s.awb).join(', ')}`);
        }
        for (const shipment of shipments) {
            shipment.nextHub = destinationHub;
            await this.shipmentRepository.save(shipment);
        }
        return {
            success: true,
            sortedCount: shipments.length,
            hubLocation,
            destinationHub,
            sortedShipments: shipments.map((s) => ({
                awb: s.awb,
                nextHub: s.nextHub,
            })),
            message: `Sorted ${shipments.length} shipments for ${destinationHub}`,
        };
    }
    async findAll(filterDto, user) {
        const { page = 1, limit = 10, status, originHub, destinationHub, riderId, fromDate, toDate, search, } = filterDto;
        const queryBuilder = this.manifestRepository
            .createQueryBuilder('manifest')
            .leftJoinAndSelect('manifest.createdBy', 'createdBy')
            .leftJoinAndSelect('manifest.receivedBy', 'receivedBy')
            .leftJoinAndSelect('manifest.rider', 'rider')
            .leftJoinAndSelect('manifest.shipments', 'shipments');
        if (status) {
            queryBuilder.andWhere('manifest.status = :status', { status });
        }
        if (originHub) {
            queryBuilder.andWhere('manifest.originHub = :originHub', { originHub });
        }
        if (destinationHub) {
            queryBuilder.andWhere('manifest.destinationHub = :destinationHub', {
                destinationHub,
            });
        }
        if (riderId) {
            queryBuilder.andWhere('manifest.riderId = :riderId', { riderId });
        }
        if (fromDate && toDate) {
            queryBuilder.andWhere('manifest.dispatchDate BETWEEN :fromDate AND :toDate', {
                fromDate: new Date(fromDate),
                toDate: new Date(toDate),
            });
        }
        if (search) {
            queryBuilder.andWhere('manifest.manifestNumber ILIKE :search', {
                search: `%${search}%`,
            });
        }
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        queryBuilder.orderBy('manifest.createdAt', 'DESC');
        const [data, totalItems] = await queryBuilder.getManyAndCount();
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
    async findOne(manifestId) {
        const manifest = await this.manifestRepository.findOne({
            where: { id: manifestId },
            relations: ['createdBy', 'receivedBy', 'rider', 'shipments', 'shipments.merchant'],
        });
        if (!manifest) {
            throw new common_1.NotFoundException('Manifest not found');
        }
        return manifest;
    }
    async getHubInventory(hubLocation) {
        const shipments = await this.shipmentRepository.find({
            where: {
                currentHub: hubLocation,
                status: enums_1.ShipmentStatus.IN_HUB,
            },
            relations: ['merchant'],
            order: { createdAt: 'DESC' },
        });
        const statistics = {
            totalShipments: shipments.length,
            byDestination: {},
            byType: {
                express: 0,
                normal: 0,
            },
            codShipments: 0,
            totalCodAmount: 0,
        };
        shipments.forEach((shipment) => {
            const destination = shipment.nextHub || shipment.deliveryArea || 'Unknown';
            statistics.byDestination[destination] =
                (statistics.byDestination[destination] || 0) + 1;
            if (shipment.deliveryType === 'express') {
                statistics.byType.express++;
            }
            else {
                statistics.byType.normal++;
            }
            if (shipment.codAmount > 0) {
                statistics.codShipments++;
                statistics.totalCodAmount += parseFloat(shipment.codAmount.toString());
            }
        });
        return {
            hubLocation,
            statistics,
            shipments: shipments.map((s) => ({
                awb: s.awb,
                merchantName: s.merchant?.name,
                deliveryArea: s.deliveryArea,
                nextHub: s.nextHub,
                weight: s.weight,
                codAmount: s.codAmount,
                deliveryType: s.deliveryType,
                createdAt: s.createdAt,
            })),
        };
    }
    async getStatistics(hubLocation) {
        const queryBuilder = this.manifestRepository.createQueryBuilder('manifest');
        if (hubLocation) {
            queryBuilder.where('manifest.originHub = :hubLocation OR manifest.destinationHub = :hubLocation', { hubLocation });
        }
        const [total, created, inTransit, received, closed] = await Promise.all([
            queryBuilder.getCount(),
            queryBuilder.clone().andWhere('manifest.status = :status', { status: manifest_entity_1.ManifestStatus.CREATED }).getCount(),
            queryBuilder.clone().andWhere('manifest.status = :status', { status: manifest_entity_1.ManifestStatus.IN_TRANSIT }).getCount(),
            queryBuilder.clone().andWhere('manifest.status = :status', { status: manifest_entity_1.ManifestStatus.RECEIVED }).getCount(),
            queryBuilder.clone().andWhere('manifest.status = :status', { status: manifest_entity_1.ManifestStatus.CLOSED }).getCount(),
        ]);
        return {
            total,
            created,
            inTransit,
            received,
            closed,
            hubLocation: hubLocation || 'All Hubs',
        };
    }
};
exports.HubService = HubService;
exports.HubService = HubService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(manifest_entity_1.Manifest)),
    __param(1, (0, typeorm_1.InjectRepository)(shipment_entity_1.Shipment)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], HubService);
//# sourceMappingURL=hub.service.js.map