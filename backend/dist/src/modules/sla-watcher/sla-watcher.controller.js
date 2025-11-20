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
exports.SlaWatcherController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sla_watcher_service_1 = require("./sla-watcher.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let SlaWatcherController = class SlaWatcherController {
    slaWatcherService;
    constructor(slaWatcherService) {
        this.slaWatcherService = slaWatcherService;
    }
    async getSLAStatistics() {
        const statistics = await this.slaWatcherService.getSLAStatistics();
        return {
            success: true,
            data: statistics,
        };
    }
    async checkShipmentSLA(shipmentId) {
        const slaStatus = await this.slaWatcherService.checkShipmentSLA(shipmentId);
        return {
            success: true,
            data: slaStatus,
        };
    }
    async getQueueStatus() {
        const queueStatus = await this.slaWatcherService.getQueueStatus();
        return {
            success: true,
            data: queueStatus,
        };
    }
};
exports.SlaWatcherController = SlaWatcherController;
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SUPPORT, user_role_enum_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({
        summary: 'Get SLA violation statistics',
        description: 'Get overall SLA violation statistics including pickup and delivery violations.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'SLA statistics retrieved successfully',
        schema: {
            example: {
                success: true,
                data: {
                    pickupSLA: {
                        violations: 12,
                        threshold: 24,
                    },
                    deliverySLA: {
                        violations: 8,
                        threshold: 72,
                    },
                    totalViolations: 20,
                    lastChecked: '2025-10-28T10:00:00Z',
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlaWatcherController.prototype, "getSLAStatistics", null);
__decorate([
    (0, common_1.Get)('shipment/:shipmentId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SUPPORT, user_role_enum_1.UserRole.MERCHANT),
    (0, swagger_1.ApiOperation)({
        summary: 'Check SLA status for specific shipment',
        description: 'Check if a specific shipment has any SLA violations and get detailed information.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Shipment SLA status retrieved successfully',
        schema: {
            example: {
                success: true,
                data: {
                    isViolated: true,
                    violations: ['Delivery SLA exceeded'],
                    details: {
                        awb: 'SHP-001',
                        status: 'in_transit',
                        createdAt: '2025-10-25T10:00:00Z',
                        updatedAt: '2025-10-26T10:00:00Z',
                        pickupSLA: 24,
                        deliverySLA: 72,
                        inTransitSLA: 48,
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('shipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SlaWatcherController.prototype, "checkShipmentSLA", null);
__decorate([
    (0, common_1.Get)('queue/status'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get SLA queue status',
        description: 'Get the current status of the SLA watcher queue including waiting, active, and completed jobs.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Queue status retrieved successfully',
        schema: {
            example: {
                success: true,
                data: {
                    waiting: 5,
                    active: 2,
                    completed: 150,
                    failed: 3,
                    total: 160,
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlaWatcherController.prototype, "getQueueStatus", null);
exports.SlaWatcherController = SlaWatcherController = __decorate([
    (0, swagger_1.ApiTags)('SLA Monitoring'),
    (0, common_1.Controller)('sla'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [sla_watcher_service_1.SlaWatcherService])
], SlaWatcherController);
//# sourceMappingURL=sla-watcher.controller.js.map