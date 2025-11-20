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
exports.HubController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hub_service_1 = require("./hub.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const enums_1 = require("../../common/enums");
const user_entity_1 = require("../../entities/user.entity");
let HubController = class HubController {
    hubService;
    constructor(hubService) {
        this.hubService = hubService;
    }
    inboundScan(inboundScanDto, user) {
        return this.hubService.inboundScan(inboundScanDto, user);
    }
    outboundScan(outboundScanDto, user) {
        return this.hubService.outboundScan(outboundScanDto, user);
    }
    sortShipments(sortingDto, user) {
        return this.hubService.sortShipments(sortingDto, user);
    }
    createManifest(createManifestDto, user) {
        return this.hubService.createManifest(createManifestDto, user);
    }
    async findAllManifests(filterDto, user) {
        return this.hubService.findAll(filterDto, user);
    }
    getStatistics(hubLocation) {
        return this.hubService.getStatistics(hubLocation);
    }
    findOneManifest(id) {
        return this.hubService.findOne(id);
    }
    receiveManifest(id, receiveManifestDto, user) {
        return this.hubService.receiveManifest(id, receiveManifestDto, user);
    }
    closeManifest(id, user) {
        return this.hubService.closeManifest(id, user);
    }
    getHubInventory(hubLocation) {
        return this.hubService.getHubInventory(hubLocation);
    }
};
exports.HubController = HubController;
__decorate([
    (0, common_1.Post)('inbound-scan'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({
        summary: 'Inbound scanning - Receive shipments at hub',
        description: 'Scan shipments arriving at hub from pickups or other hubs. Updates shipment status to AT_HUB.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Shipments scanned successfully',
        schema: {
            example: {
                success: true,
                scannedCount: 5,
                hubLocation: 'Dhaka Hub',
                scannedShipments: [
                    {
                        awb: 'FXC2025010001',
                        status: 'at_hub',
                        currentHub: 'Dhaka Hub',
                    },
                ],
                message: 'Successfully scanned 5 shipments at Dhaka Hub',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid shipment AWBs or status' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.InboundScanDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "inboundScan", null);
__decorate([
    (0, common_1.Post)('outbound-scan'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({
        summary: 'Outbound scanning - Dispatch shipments from hub',
        description: 'Scan shipments leaving hub for delivery or transfer. Can assign to rider or route to another hub.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Shipments dispatched successfully',
        schema: {
            example: {
                success: true,
                scannedCount: 5,
                originHub: 'Dhaka Hub',
                destinationHub: 'Chittagong Hub',
                scannedShipments: [
                    {
                        awb: 'FXC2025010001',
                        status: 'in_transit',
                        destination: 'Chittagong Hub',
                    },
                ],
                message: 'Successfully dispatched 5 shipments from Dhaka Hub',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Shipments not at origin hub' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.OutboundScanDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "outboundScan", null);
__decorate([
    (0, common_1.Post)('sorting'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({
        summary: 'Sort shipments by destination',
        description: 'Assign destination hub to shipments for routing. Used in hub sorting operations.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Shipments sorted successfully',
        schema: {
            example: {
                success: true,
                sortedCount: 10,
                hubLocation: 'Dhaka Hub',
                destinationHub: 'Chittagong Hub',
                sortedShipments: [
                    {
                        awb: 'FXC2025010001',
                        nextHub: 'Chittagong Hub',
                    },
                ],
                message: 'Sorted 10 shipments for Chittagong Hub',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SortingDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "sortShipments", null);
__decorate([
    (0, common_1.Post)('manifests'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({
        summary: 'Create manifest for hub-to-hub transfer',
        description: 'Create a manifest to group shipments for transfer to another hub. Auto-generates manifest number.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Manifest created successfully',
        schema: {
            example: {
                success: true,
                manifest: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    manifestNumber: 'MF-20250128-0001',
                    originHub: 'Dhaka Hub',
                    destinationHub: 'Chittagong Hub',
                    totalShipments: 25,
                    status: 'in_transit',
                    dispatchDate: '2025-01-28T10:30:00Z',
                },
                message: 'Manifest MF-20250128-0001 created with 25 shipments',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid shipments or hub' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateManifestDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "createManifest", null);
__decorate([
    (0, common_1.Get)('manifests'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF, enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all manifests with filters',
        description: 'List all manifests with pagination and filtering by status, hub, rider, date range.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of manifests',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FilterManifestDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "findAllManifests", null);
__decorate([
    (0, common_1.Get)('manifests/statistics'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({
        summary: 'Get manifest statistics',
        description: 'Get count of manifests by status, optionally filtered by hub.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hubLocation',
        required: false,
        description: 'Filter statistics by hub location',
        example: 'Dhaka Hub',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Manifest statistics',
        schema: {
            example: {
                total: 100,
                created: 5,
                inTransit: 20,
                received: 70,
                closed: 5,
                hubLocation: 'Dhaka Hub',
            },
        },
    }),
    __param(0, (0, common_1.Query)('hubLocation')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('manifests/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF, enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get manifest details by ID',
        description: 'Get full manifest details including all shipments and related data.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Manifest ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Manifest details',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Manifest not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "findOneManifest", null);
__decorate([
    (0, common_1.Post)('manifests/:id/receive'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({
        summary: 'Receive manifest at destination hub',
        description: 'Mark manifest as received and scan shipments. Handles discrepancies between expected and received shipments.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Manifest ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Manifest received successfully',
        schema: {
            example: {
                success: true,
                manifestNumber: 'MF-20250128-0001',
                receivedCount: 24,
                expectedCount: 25,
                discrepancies: {
                    notInManifest: [],
                    notReceived: ['FXC2025010025'],
                },
                message: 'Manifest MF-20250128-0001 received at Chittagong Hub',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Manifest not in transit or hub mismatch',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ReceiveManifestDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "receiveManifest", null);
__decorate([
    (0, common_1.Patch)('manifests/:id/close'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({
        summary: 'Close manifest',
        description: 'Mark received manifest as closed/completed.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Manifest ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Manifest closed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Can only close received manifests' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "closeManifest", null);
__decorate([
    (0, common_1.Get)('inventory/:hubLocation'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({
        summary: 'Get hub inventory',
        description: 'Get all shipments currently at the hub with statistics by destination, type, and COD.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'hubLocation',
        description: 'Hub location name',
        example: 'Dhaka Hub',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Hub inventory with statistics',
        schema: {
            example: {
                hubLocation: 'Dhaka Hub',
                statistics: {
                    totalShipments: 150,
                    byDestination: {
                        'Chittagong Hub': 50,
                        'Sylhet Hub': 30,
                        'Local Delivery': 70,
                    },
                    byType: {
                        express: 40,
                        normal: 110,
                    },
                    codShipments: 80,
                    totalCodAmount: 125000,
                },
                shipments: [
                    {
                        awb: 'FXC2025010001',
                        merchantName: 'ABC Store',
                        deliveryArea: 'Gulshan',
                        nextHub: 'Local Delivery',
                        weight: 2.5,
                        codAmount: 1500,
                        deliveryType: 'express',
                        createdAt: '2025-01-28T08:00:00Z',
                    },
                ],
            },
        },
    }),
    __param(0, (0, common_1.Param)('hubLocation')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getHubInventory", null);
exports.HubController = HubController = __decorate([
    (0, swagger_1.ApiTags)('Hub Operations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('hub'),
    __metadata("design:paramtypes", [hub_service_1.HubService])
], HubController);
//# sourceMappingURL=hub.controller.js.map