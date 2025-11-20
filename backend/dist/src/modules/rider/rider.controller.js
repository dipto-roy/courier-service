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
exports.RiderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rider_service_1 = require("./rider.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
const dto_1 = require("./dto");
let RiderController = class RiderController {
    riderService;
    constructor(riderService) {
        this.riderService = riderService;
    }
    async getAssignedManifests(req) {
        return this.riderService.getAssignedManifests(req.user.id);
    }
    async getMyShipments(req) {
        return this.riderService.getMyShipments(req.user.id);
    }
    async getShipmentDetails(awb, req) {
        return this.riderService.getShipmentDetails(awb, req.user);
    }
    async generateOTP(generateOTPDto, req) {
        return this.riderService.generateOTP(generateOTPDto, req.user);
    }
    async completeDelivery(deliveryAttemptDto, req) {
        return this.riderService.completeDelivery(deliveryAttemptDto, req.user);
    }
    async recordFailedDelivery(failedDeliveryDto, req) {
        return this.riderService.recordFailedDelivery(failedDeliveryDto, req.user);
    }
    async markRTO(rtoDto, req) {
        return this.riderService.markRTO(rtoDto, req.user);
    }
    async updateLocation(updateLocationDto, req) {
        return this.riderService.updateLocation(updateLocationDto, req.user);
    }
    async getLocationHistory(req, limit) {
        return this.riderService.getLocationHistory(req.user.id, limit || 50);
    }
    async getMyStatistics(req) {
        return this.riderService.getMyStatistics(req.user.id);
    }
};
exports.RiderController = RiderController;
__decorate([
    (0, common_1.Get)('manifests'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all manifests assigned to rider' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns list of assigned manifests with shipments',
        schema: {
            example: {
                success: true,
                total: 2,
                manifests: [
                    {
                        id: 'uuid',
                        manifestNumber: 'MF-20250128-0001',
                        status: 'IN_TRANSIT',
                        originHub: 'Dhaka Hub',
                        destinationHub: 'Chittagong Hub',
                        totalShipments: 15,
                        dispatchDate: '2025-01-28T10:00:00Z',
                        shipments: [
                            {
                                awb: 'FX20250128000001',
                                status: 'OUT_FOR_DELIVERY',
                                receiverName: 'John Doe',
                                receiverPhone: '01712345678',
                                receiverAddress: '123 Main St, Chittagong',
                                deliveryArea: 'Agrabad',
                                codAmount: 1500,
                            },
                        ],
                    },
                ],
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RiderController.prototype, "getAssignedManifests", null);
__decorate([
    (0, common_1.Get)('shipments'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all shipments directly assigned to rider' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns list of shipments out for delivery',
        schema: {
            example: {
                success: true,
                total: 8,
                shipments: [
                    {
                        id: 'uuid',
                        awb: 'FX20250128000001',
                        status: 'OUT_FOR_DELIVERY',
                        merchantName: 'ABC Store',
                        receiverName: 'John Doe',
                        receiverPhone: '01712345678',
                        receiverAddress: '123 Main St',
                        deliveryArea: 'Gulshan',
                        codAmount: 1500,
                        deliveryType: 'EXPRESS',
                        weight: 2.5,
                        deliveryAttempts: 0,
                        expectedDeliveryDate: '2025-01-28T18:00:00Z',
                        specialInstructions: 'Call before delivery',
                        otpCode: '123456',
                    },
                ],
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RiderController.prototype, "getMyShipments", null);
__decorate([
    (0, common_1.Get)('shipments/:awb'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipment details by AWB' }),
    (0, swagger_1.ApiParam)({ name: 'awb', description: 'Shipment AWB number' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns shipment details',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Shipment not assigned to this rider' }),
    __param(0, (0, common_1.Param)('awb')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RiderController.prototype, "getShipmentDetails", null);
__decorate([
    (0, common_1.Post)('generate-otp'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate OTP for shipment delivery',
        description: 'Generates a 6-digit OTP and sends it to the customer for delivery verification',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP generated and sent to customer',
        schema: {
            example: {
                success: true,
                message: 'OTP generated and sent to customer',
                awb: 'FX20250128000001',
                otpGenerated: true,
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Shipment not assigned to this rider' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateOTPDto, Object]),
    __metadata("design:returntype", Promise)
], RiderController.prototype, "generateOTP", null);
__decorate([
    (0, common_1.Post)('complete-delivery'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete delivery with OTP verification',
        description: 'Marks shipment as delivered after verifying OTP, capturing POD, and collecting COD if applicable',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Delivery completed successfully',
        schema: {
            example: {
                success: true,
                message: 'Delivery completed successfully',
                awb: 'FX20250128000001',
                deliveredAt: '2025-01-28T14:30:00Z',
                codCollected: 1500,
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid OTP or COD amount mismatch' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Shipment not assigned to this rider' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DeliveryAttemptDto, Object]),
    __metadata("design:returntype", Promise)
], RiderController.prototype, "completeDelivery", null);
__decorate([
    (0, common_1.Post)('failed-delivery'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({
        summary: 'Record failed delivery attempt',
        description: 'Records a failed delivery with reason. Auto-initiates RTO after 3 failed attempts',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Failed delivery recorded',
        schema: {
            example: {
                success: true,
                message: 'Failed delivery recorded',
                awb: 'FX20250128000001',
                deliveryAttempts: 2,
                status: 'FAILED_DELIVERY',
                autoRTO: false,
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Shipment not assigned to this rider' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FailedDeliveryDto, Object]),
    __metadata("design:returntype", Promise)
], RiderController.prototype, "recordFailedDelivery", null);
__decorate([
    (0, common_1.Post)('mark-rto'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark shipment for RTO (Return to Origin)',
        description: 'Initiates RTO process for a shipment that cannot be delivered',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Shipment marked for RTO',
        schema: {
            example: {
                success: true,
                message: 'Shipment marked for RTO',
                awb: 'FX20250128000001',
                status: 'RTO_INITIATED',
                rtoReason: 'CUSTOMER_REFUSED: Customer refused to accept the package',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Shipment not assigned to this rider' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RTODto, Object]),
    __metadata("design:returntype", Promise)
], RiderController.prototype, "markRTO", null);
__decorate([
    (0, common_1.Post)('update-location'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update rider live location',
        description: 'Updates rider GPS location for real-time tracking',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Location updated successfully',
        schema: {
            example: {
                success: true,
                message: 'Location updated successfully',
                location: {
                    latitude: 23.8103,
                    longitude: 90.4125,
                    timestamp: '2025-01-28T14:30:00Z',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateLocationDto, Object]),
    __metadata("design:returntype", Promise)
], RiderController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Get)('location-history'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.RIDER, enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get rider location history' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of records to return', example: 50 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns location history',
        schema: {
            example: {
                success: true,
                total: 50,
                locations: [
                    {
                        latitude: 23.8103,
                        longitude: 90.4125,
                        accuracy: 10.5,
                        speed: 15.2,
                        heading: 270,
                        batteryLevel: 85,
                        isOnline: true,
                        timestamp: '2025-01-28T14:30:00Z',
                    },
                ],
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], RiderController.prototype, "getLocationHistory", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({ summary: 'Get rider statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns rider performance statistics',
        schema: {
            example: {
                success: true,
                statistics: {
                    totalAssigned: 150,
                    outForDelivery: 12,
                    delivered: 125,
                    failedDeliveries: 8,
                    rtoShipments: 5,
                    todayDeliveries: 18,
                    totalCodCollected: 125000,
                    deliveryRate: '83.33%',
                },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RiderController.prototype, "getMyStatistics", null);
exports.RiderController = RiderController = __decorate([
    (0, swagger_1.ApiTags)('Rider Operations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('rider'),
    __metadata("design:paramtypes", [rider_service_1.RiderService])
], RiderController);
//# sourceMappingURL=rider.controller.js.map