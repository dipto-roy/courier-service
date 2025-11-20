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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const audit_service_1 = require("./audit.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let AuditController = class AuditController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    async createAuditLog(createAuditLogDto, req) {
        const ipAddress = createAuditLogDto.ipAddress || this.getIpAddress(req);
        const userAgent = createAuditLogDto.userAgent || req.headers['user-agent'];
        const auditLog = await this.auditService.log({
            ...createAuditLogDto,
            ipAddress,
            userAgent,
        });
        return {
            success: true,
            message: 'Audit log created successfully',
            data: auditLog,
        };
    }
    async getAuditLogs(filterDto) {
        const result = await this.auditService.getAuditLogs(filterDto);
        return {
            success: true,
            data: result.data,
            pagination: result.pagination,
        };
    }
    async getAuditLogById(id) {
        const auditLog = await this.auditService.getAuditLogById(id);
        if (!auditLog) {
            return {
                success: false,
                message: 'Audit log not found',
            };
        }
        return {
            success: true,
            data: auditLog,
        };
    }
    async getEntityAuditTrail(entityType, entityId) {
        const auditTrail = await this.auditService.getEntityAuditTrail(entityType, entityId);
        return {
            success: true,
            entityType,
            entityId,
            totalChanges: auditTrail.length,
            data: auditTrail,
        };
    }
    async getUserActivity(userId, limit) {
        const logs = await this.auditService.getUserActivityLogs(userId, limit ? parseInt(limit.toString()) : 50);
        return {
            success: true,
            userId,
            totalActivities: logs.length,
            data: logs,
        };
    }
    async getRecentLogs(limit) {
        const logs = await this.auditService.getRecentLogs(limit ? parseInt(limit.toString()) : 100);
        return {
            success: true,
            data: logs,
        };
    }
    async getStatistics(startDate, endDate) {
        const statistics = await this.auditService.getAuditStatistics(startDate, endDate);
        return {
            success: true,
            data: statistics,
        };
    }
    async getUserStatistics(userId) {
        const statistics = await this.auditService.getUserStatistics(userId);
        return {
            success: true,
            userId,
            data: statistics,
        };
    }
    getIpAddress(req) {
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            return typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0];
        }
        return req.ip || req.socket.remoteAddress || 'unknown';
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Post)('log'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Create audit log manually',
        description: 'Manually create an audit log entry. Used for system events or custom logging.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Audit log created successfully',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                userId: '123e4567-e89b-12d3-a456-426614174001',
                entityType: 'system',
                entityId: 'config-update',
                action: 'config_update',
                oldValues: { maxShipmentWeight: 50 },
                newValues: { maxShipmentWeight: 100 },
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                description: 'Updated system configuration',
                createdAt: '2024-01-15T10:30:00Z',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAuditLogDto, Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "createAuditLog", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get audit logs with filtering',
        description: 'Retrieve audit logs with optional filtering by user, entity, action, date range, and IP address. Supports pagination.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, description: 'Filter by user ID' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', required: false, description: 'Filter by entity type (e.g., shipment, user, pickup)' }),
    (0, swagger_1.ApiQuery)({ name: 'entityId', required: false, description: 'Filter by entity ID' }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, description: 'Filter by action (e.g., create, update, delete, status_change)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date for date range filter (ISO 8601)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date for date range filter (ISO 8601)' }),
    (0, swagger_1.ApiQuery)({ name: 'ipAddress', required: false, description: 'Filter by IP address' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (default: 20, max: 100)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit logs retrieved successfully',
        schema: {
            example: {
                success: true,
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        userId: '123e4567-e89b-12d3-a456-426614174001',
                        user: {
                            id: '123e4567-e89b-12d3-a456-426614174001',
                            fullName: 'John Doe',
                            email: 'john@example.com',
                        },
                        entityType: 'shipment',
                        entityId: 'SHP-001',
                        action: 'status_change',
                        oldValues: { status: 'pending' },
                        newValues: { status: 'picked_up' },
                        ipAddress: '192.168.1.1',
                        userAgent: 'Mozilla/5.0...',
                        description: 'Status changed from pending to picked_up',
                        createdAt: '2024-01-15T10:30:00Z',
                    },
                ],
                pagination: {
                    total: 150,
                    page: 1,
                    limit: 20,
                    totalPages: 8,
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AuditFilterDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('logs/:id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get audit log by ID',
        description: 'Retrieve a specific audit log entry by its ID.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit log retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Audit log not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditLogById", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get entity audit trail',
        description: 'Retrieve the complete audit trail for a specific entity, showing all changes in chronological order.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Entity audit trail retrieved successfully',
        schema: {
            example: {
                success: true,
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        action: 'create',
                        oldValues: null,
                        newValues: { awb: 'SHP-001', status: 'pending' },
                        description: 'Shipment created',
                        createdAt: '2024-01-15T10:00:00Z',
                    },
                    {
                        id: '123e4567-e89b-12d3-a456-426614174001',
                        action: 'status_change',
                        oldValues: { status: 'pending' },
                        newValues: { status: 'picked_up' },
                        description: 'Status changed from pending to picked_up',
                        createdAt: '2024-01-15T11:00:00Z',
                    },
                ],
            },
        },
    }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getEntityAuditTrail", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user activity logs',
        description: 'Retrieve all actions performed by a specific user, ordered by most recent first.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Maximum number of logs to return (default: 50)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User activity logs retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getUserActivity", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get recent audit logs',
        description: 'Retrieve the most recent audit logs across the entire system for admin dashboard.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Maximum number of logs to return (default: 100)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recent audit logs retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getRecentLogs", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get audit statistics',
        description: 'Get comprehensive audit statistics including total logs, breakdown by entity type and action, top users, and activity trends.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date for statistics (ISO 8601)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date for statistics (ISO 8601)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit statistics retrieved successfully',
        schema: {
            example: {
                success: true,
                data: {
                    total: 5420,
                    byEntityType: {
                        shipment: 2100,
                        user: 850,
                        pickup: 720,
                        manifest: 550,
                        transaction: 1200,
                    },
                    byAction: {
                        create: 1500,
                        update: 2800,
                        delete: 120,
                        status_change: 1000,
                    },
                    topUsers: [
                        {
                            userId: '123e4567-e89b-12d3-a456-426614174001',
                            userName: 'John Doe',
                            userEmail: 'john@example.com',
                            activityCount: 450,
                        },
                    ],
                    activityByDate: [
                        { date: '2024-01-15', count: 120 },
                        { date: '2024-01-16', count: 145 },
                    ],
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/user/:userId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user audit statistics',
        description: 'Get detailed audit statistics for a specific user, including activity breakdown and recent actions.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User audit statistics retrieved successfully',
        schema: {
            example: {
                success: true,
                userId: '123e4567-e89b-12d3-a456-426614174001',
                data: {
                    total: 450,
                    byEntityType: {
                        shipment: 200,
                        pickup: 150,
                        user: 100,
                    },
                    byAction: {
                        create: 120,
                        update: 250,
                        delete: 10,
                        status_change: 70,
                    },
                    recentActivity: [
                        {
                            id: '123e4567-e89b-12d3-a456-426614174000',
                            entityType: 'shipment',
                            action: 'status_change',
                            createdAt: '2024-01-15T10:30:00Z',
                        },
                    ],
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getUserStatistics", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('Audit'),
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map