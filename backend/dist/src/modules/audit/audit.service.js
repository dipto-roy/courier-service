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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("../../entities/audit-log.entity");
let AuditService = AuditService_1 = class AuditService {
    auditLogRepository;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async log(createAuditLogDto) {
        try {
            const auditLog = this.auditLogRepository.create(createAuditLogDto);
            const savedLog = await this.auditLogRepository.save(auditLog);
            this.logger.log(`Audit log created: ${createAuditLogDto.action} on ${createAuditLogDto.entityType}:${createAuditLogDto.entityId} by user ${createAuditLogDto.userId}`);
            return savedLog;
        }
        catch (error) {
            this.logger.error('Failed to create audit log:', error.message);
            return null;
        }
    }
    async logAction(userId, entityType, entityId, action, description, oldValues, newValues, ipAddress, userAgent) {
        return this.log({
            userId,
            entityType,
            entityId,
            action,
            oldValues,
            newValues,
            ipAddress,
            userAgent,
            description,
        });
    }
    async logShipmentAction(userId, shipmentId, action, description, oldValues, newValues, ipAddress, userAgent) {
        return this.logAction(userId, 'shipment', shipmentId, action, description, oldValues, newValues, ipAddress, userAgent);
    }
    async logUserAction(userId, targetUserId, action, description, oldValues, newValues, ipAddress, userAgent) {
        return this.logAction(userId, 'user', targetUserId, action, description, oldValues, newValues, ipAddress, userAgent);
    }
    async logPickupAction(userId, pickupId, action, description, oldValues, newValues, ipAddress, userAgent) {
        return this.logAction(userId, 'pickup', pickupId, action, description, oldValues, newValues, ipAddress, userAgent);
    }
    async logManifestAction(userId, manifestId, action, description, oldValues, newValues, ipAddress, userAgent) {
        return this.logAction(userId, 'manifest', manifestId, action, description, oldValues, newValues, ipAddress, userAgent);
    }
    async logTransactionAction(userId, transactionId, action, description, oldValues, newValues, ipAddress, userAgent) {
        return this.logAction(userId, 'transaction', transactionId, action, description, oldValues, newValues, ipAddress, userAgent);
    }
    async logAuthAction(userId, action, description, ipAddress, userAgent) {
        return this.logAction(userId, 'auth', userId, action, description, null, null, ipAddress, userAgent);
    }
    async getAuditLogs(filterDto) {
        const { page = 1, limit = 20, startDate, endDate, ...filters } = filterDto;
        const queryBuilder = this.auditLogRepository
            .createQueryBuilder('audit')
            .leftJoinAndSelect('audit.user', 'user');
        if (filters.userId) {
            queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
        }
        if (filters.entityType) {
            queryBuilder.andWhere('audit.entityType = :entityType', {
                entityType: filters.entityType,
            });
        }
        if (filters.entityId) {
            queryBuilder.andWhere('audit.entityId = :entityId', {
                entityId: filters.entityId,
            });
        }
        if (filters.action) {
            queryBuilder.andWhere('audit.action = :action', { action: filters.action });
        }
        if (filters.ipAddress) {
            queryBuilder.andWhere('audit.ipAddress = :ipAddress', {
                ipAddress: filters.ipAddress,
            });
        }
        if (startDate && endDate) {
            queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        else if (startDate) {
            queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate });
        }
        else if (endDate) {
            queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate });
        }
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        queryBuilder.orderBy('audit.createdAt', 'DESC');
        const [data, total] = await queryBuilder.getManyAndCount();
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getAuditLogById(id) {
        return this.auditLogRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    }
    async getEntityAuditTrail(entityType, entityId) {
        return this.auditLogRepository.find({
            where: { entityType, entityId },
            relations: ['user'],
            order: { createdAt: 'ASC' },
        });
    }
    async getUserActivityLogs(userId, limit = 50) {
        return this.auditLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getRecentLogs(limit = 100) {
        return this.auditLogRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getAuditStatistics(startDate, endDate) {
        const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
        if (startDate && endDate) {
            queryBuilder.where('audit.createdAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        else if (startDate) {
            queryBuilder.where('audit.createdAt >= :startDate', { startDate });
        }
        else if (endDate) {
            queryBuilder.where('audit.createdAt <= :endDate', { endDate });
        }
        const total = await queryBuilder.getCount();
        const byEntityType = await this.auditLogRepository
            .createQueryBuilder('audit')
            .select('audit.entityType', 'entityType')
            .addSelect('COUNT(*)', 'count')
            .groupBy('audit.entityType')
            .getRawMany();
        const byAction = await this.auditLogRepository
            .createQueryBuilder('audit')
            .select('audit.action', 'action')
            .addSelect('COUNT(*)', 'count')
            .groupBy('audit.action')
            .getRawMany();
        const topUsers = await this.auditLogRepository
            .createQueryBuilder('audit')
            .leftJoin('audit.user', 'user')
            .select('audit.userId', 'userId')
            .addSelect('user.fullName', 'userName')
            .addSelect('user.email', 'userEmail')
            .addSelect('COUNT(*)', 'count')
            .groupBy('audit.userId')
            .addGroupBy('user.fullName')
            .addGroupBy('user.email')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const activityByDate = await this.auditLogRepository
            .createQueryBuilder('audit')
            .select('DATE(audit.createdAt)', 'date')
            .addSelect('COUNT(*)', 'count')
            .where('audit.createdAt >= :last7Days', { last7Days })
            .groupBy('DATE(audit.createdAt)')
            .orderBy('date', 'ASC')
            .getRawMany();
        return {
            total,
            byEntityType: byEntityType.reduce((acc, item) => {
                acc[item.entityType] = parseInt(item.count);
                return acc;
            }, {}),
            byAction: byAction.reduce((acc, item) => {
                acc[item.action] = parseInt(item.count);
                return acc;
            }, {}),
            topUsers: topUsers.map(user => ({
                userId: user.userId,
                userName: user.userName,
                userEmail: user.userEmail,
                activityCount: parseInt(user.count),
            })),
            activityByDate: activityByDate.map(item => ({
                date: item.date,
                count: parseInt(item.count),
            })),
        };
    }
    async getUserStatistics(userId) {
        const total = await this.auditLogRepository.count({
            where: { userId },
        });
        const byEntityType = await this.auditLogRepository
            .createQueryBuilder('audit')
            .select('audit.entityType', 'entityType')
            .addSelect('COUNT(*)', 'count')
            .where('audit.userId = :userId', { userId })
            .groupBy('audit.entityType')
            .getRawMany();
        const byAction = await this.auditLogRepository
            .createQueryBuilder('audit')
            .select('audit.action', 'action')
            .addSelect('COUNT(*)', 'count')
            .where('audit.userId = :userId', { userId })
            .groupBy('audit.action')
            .getRawMany();
        const recentActivity = await this.auditLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 10,
        });
        return {
            total,
            byEntityType: byEntityType.reduce((acc, item) => {
                acc[item.entityType] = parseInt(item.count);
                return acc;
            }, {}),
            byAction: byAction.reduce((acc, item) => {
                acc[item.action] = parseInt(item.count);
                return acc;
            }, {}),
            recentActivity,
        };
    }
    async deleteOldLogs(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await this.auditLogRepository
            .createQueryBuilder()
            .delete()
            .where('createdAt < :cutoffDate', { cutoffDate })
            .execute();
        this.logger.log(`Deleted ${result.affected} audit logs older than ${daysToKeep} days`);
        return result.affected || 0;
    }
    async compareAndLog(userId, entityType, entityId, action, oldEntity, newEntity, ipAddress, userAgent) {
        const changes = this.extractChanges(oldEntity, newEntity);
        const description = this.generateChangeDescription(entityType, action, changes);
        return this.log({
            userId,
            entityType,
            entityId,
            action,
            oldValues: oldEntity,
            newValues: newEntity,
            description,
            ipAddress,
            userAgent,
        });
    }
    extractChanges(oldEntity, newEntity) {
        const changes = {};
        if (!oldEntity || !newEntity) {
            return changes;
        }
        for (const key in newEntity) {
            if (oldEntity[key] !== newEntity[key]) {
                changes[key] = {
                    old: oldEntity[key],
                    new: newEntity[key],
                };
            }
        }
        return changes;
    }
    generateChangeDescription(entityType, action, changes) {
        const changedFields = Object.keys(changes);
        if (changedFields.length === 0) {
            return `${action} on ${entityType}`;
        }
        const fieldList = changedFields.map(field => {
            const change = changes[field];
            return `${field}: ${change.old} → ${change.new}`;
        }).join(', ');
        return `${action} on ${entityType}: ${fieldList}`;
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map