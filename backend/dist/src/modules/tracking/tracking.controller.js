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
exports.TrackingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tracking_service_1 = require("./tracking.service");
const tracking_gateway_1 = require("./tracking.gateway");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const enums_1 = require("../../common/enums");
let TrackingController = class TrackingController {
    trackingService;
    trackingGateway;
    constructor(trackingService, trackingGateway) {
        this.trackingService = trackingService;
        this.trackingGateway = trackingGateway;
    }
    async trackPublic(awb, phone) {
        return this.trackingService.trackShipment(awb, phone);
    }
    async getDetailedTracking(awb) {
        return this.trackingService.getDetailedTracking(awb);
    }
    getSubscriptionInfo(awb) {
        return this.trackingService.getSubscriptionInfo(awb);
    }
    getGatewayStatus() {
        return this.trackingGateway.getGatewayStatus();
    }
    getActiveSubscriptions() {
        return {
            subscriptions: this.trackingGateway.getActiveSubscriptions(),
            timestamp: new Date().toISOString(),
        };
    }
    sendTestEvent(awb) {
        return this.trackingGateway.emitTestEvent(awb);
    }
    async getMonitoringData() {
        const gatewayStatus = this.trackingGateway.getGatewayStatus();
        const activeShipments = gatewayStatus.subscriptions;
        return {
            gateway: gatewayStatus,
            recentActivity: {
                activeTracking: activeShipments.length,
                totalSubscribers: activeShipments.reduce((sum, s) => sum + s.connections, 0),
            },
            health: {
                websocket: gatewayStatus.serverRunning ? 'healthy' : 'down',
                namespace: gatewayStatus.namespace,
                timestamp: new Date().toISOString(),
            },
            activeShipments,
        };
    }
};
exports.TrackingController = TrackingController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('public/:awb'),
    (0, swagger_1.ApiOperation)({
        summary: 'Public shipment tracking by AWB',
        description: 'Track shipment status without authentication. Returns safe subset of data.',
    }),
    (0, swagger_1.ApiParam)({ name: 'awb', description: 'Shipment AWB number', example: 'FX20250128000001' }),
    (0, swagger_1.ApiQuery)({
        name: 'phone',
        required: false,
        description: 'Last 4 digits of receiver phone for verification',
        example: '5678',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns shipment tracking information',
        schema: {
            example: {
                success: true,
                tracking: {
                    awb: 'FX20250128000001',
                    status: 'OUT_FOR_DELIVERY',
                    currentLocation: 'Gulshan Hub',
                    expectedDeliveryDate: '2025-01-28T18:00:00Z',
                    eta: '2-4 hours',
                    receiverName: 'John Doe',
                    receiverAddress: '123 Main St, Dhaka',
                    deliveryArea: 'Gulshan',
                    weight: 2.5,
                    deliveryType: 'EXPRESS',
                    deliveryAttempts: 0,
                    isRto: false,
                    timeline: [
                        {
                            status: 'PENDING',
                            timestamp: '2025-01-28T08:00:00Z',
                            description: 'Shipment created by merchant',
                        },
                        {
                            status: 'PICKED_UP',
                            timestamp: '2025-01-28T10:00:00Z',
                            location: 'Merchant Location',
                            description: 'Shipment picked up by agent',
                        },
                        {
                            status: 'IN_HUB',
                            timestamp: '2025-01-28T12:00:00Z',
                            location: 'Dhaka Hub',
                            description: 'Arrived at hub for sorting',
                        },
                        {
                            status: 'OUT_FOR_DELIVERY',
                            timestamp: '2025-01-28T14:00:00Z',
                            location: 'Gulshan',
                            description: 'Out for delivery',
                        },
                    ],
                    riderLocation: {
                        latitude: 23.8103,
                        longitude: 90.4125,
                        accuracy: 10,
                        timestamp: '2025-01-28T15:30:00Z',
                        isOnline: true,
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Phone verification failed' }),
    __param(0, (0, common_1.Param)('awb')),
    __param(1, (0, common_1.Query)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "trackPublic", null);
__decorate([
    (0, common_1.Get)('detailed/:awb'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MERCHANT, enums_1.UserRole.HUB_STAFF, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get detailed tracking information',
        description: 'Get comprehensive tracking data including all shipment details (requires authentication)',
    }),
    (0, swagger_1.ApiParam)({ name: 'awb', description: 'Shipment AWB number' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns detailed tracking information',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('awb')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "getDetailedTracking", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('subscription/:awb'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Pusher subscription info for real-time updates',
        description: 'Returns Pusher channel and event information for WebSocket connection',
    }),
    (0, swagger_1.ApiParam)({ name: 'awb', description: 'Shipment AWB number' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns subscription information',
        schema: {
            example: {
                success: true,
                subscription: {
                    channel: 'shipment-FX20250128000001',
                    events: ['status-changed', 'rider-location-updated'],
                    pusherKey: 'your_pusher_key',
                    pusherCluster: 'ap2',
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('awb')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getSubscriptionInfo", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('gateway-status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get WebSocket gateway status',
        description: 'Check if WebSocket server is operational and get connection stats',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns gateway status',
        schema: {
            example: {
                status: 'operational',
                namespace: '/tracking',
                activeConnections: 5,
                activeSubscriptions: 3,
                subscriptions: [
                    { awb: 'FX20251028376654', connections: 2 },
                    { awb: 'FX20251028001', connections: 1 },
                ],
                serverRunning: true,
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getGatewayStatus", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('active-subscriptions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all active WebSocket subscriptions',
        description: 'Returns list of AWBs being tracked in real-time',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns active subscriptions',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "getActiveSubscriptions", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('test-event/:awb'),
    (0, swagger_1.ApiOperation)({
        summary: 'Send test WebSocket event',
        description: 'Broadcasts a test event to all clients subscribed to this AWB (for debugging)',
    }),
    (0, swagger_1.ApiParam)({ name: 'awb', description: 'Shipment AWB number' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Test event sent',
    }),
    __param(0, (0, common_1.Param)('awb')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "sendTestEvent", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('monitor'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get WebSocket monitoring data',
        description: 'Returns comprehensive monitoring information for WebSocket gateway',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns monitoring data',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "getMonitoringData", null);
exports.TrackingController = TrackingController = __decorate([
    (0, swagger_1.ApiTags)('Tracking'),
    (0, common_1.Controller)('tracking'),
    __metadata("design:paramtypes", [tracking_service_1.TrackingService,
        tracking_gateway_1.TrackingGateway])
], TrackingController);
//# sourceMappingURL=tracking.controller.js.map