import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { AuditFilterDto, CreateAuditLogDto } from './dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  // ==================== Core Audit Logging Methods ====================

  async log(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog | null> {
    try {
      const auditLog = this.auditLogRepository.create(createAuditLogDto);
      const savedLog = await this.auditLogRepository.save(auditLog);
      
      this.logger.log(
        `Audit log created: ${createAuditLogDto.action} on ${createAuditLogDto.entityType}:${createAuditLogDto.entityId} by user ${createAuditLogDto.userId}`,
      );
      
      return savedLog;
    } catch (error) {
      this.logger.error('Failed to create audit log:', error.message);
      // Don't throw error to avoid breaking the main operation
      return null;
    }
  }

  async logAction(
    userId: string,
    entityType: string,
    entityId: string,
    action: string,
    description?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog | null> {
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

  // ==================== Entity-Specific Logging Methods ====================

  async logShipmentAction(
    userId: string,
    shipmentId: string,
    action: string,
    description: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog | null> {
    return this.logAction(
      userId,
      'shipment',
      shipmentId,
      action,
      description,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    );
  }

  async logUserAction(
    userId: string,
    targetUserId: string,
    action: string,
    description: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog | null> {
    return this.logAction(
      userId,
      'user',
      targetUserId,
      action,
      description,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    );
  }

  async logPickupAction(
    userId: string,
    pickupId: string,
    action: string,
    description: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog | null> {
    return this.logAction(
      userId,
      'pickup',
      pickupId,
      action,
      description,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    );
  }

  async logManifestAction(
    userId: string,
    manifestId: string,
    action: string,
    description: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog | null> {
    return this.logAction(
      userId,
      'manifest',
      manifestId,
      action,
      description,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    );
  }

  async logTransactionAction(
    userId: string,
    transactionId: string,
    action: string,
    description: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog | null> {
    return this.logAction(
      userId,
      'transaction',
      transactionId,
      action,
      description,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    );
  }

  async logAuthAction(
    userId: string,
    action: string,
    description: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog | null> {
    return this.logAction(
      userId,
      'auth',
      userId,
      action,
      description,
      null,
      null,
      ipAddress,
      userAgent,
    );
  }

  // ==================== Query Methods ====================

  async getAuditLogs(filterDto: AuditFilterDto): Promise<{
    data: AuditLog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { page = 1, limit = 20, startDate, endDate, ...filters } = filterDto;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user');

    // Apply filters
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

    // Date range filter
    if (startDate && endDate) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by most recent first
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

  async getAuditLogById(id: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async getEntityAuditTrail(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async getUserActivityLogs(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getRecentLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // ==================== Statistics ====================

  async getAuditStatistics(startDate?: string, endDate?: string): Promise<any> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (startDate && endDate) {
      queryBuilder.where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.where('audit.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.where('audit.createdAt <= :endDate', { endDate });
    }

    const total = await queryBuilder.getCount();

    // Count by entity type
    const byEntityType = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.entityType')
      .getRawMany();

    // Count by action
    const byAction = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    // Top users by activity
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

    // Activity by date (last 7 days)
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

  async getUserStatistics(userId: string): Promise<any> {
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

  // ==================== Cleanup Methods ====================

  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
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

  // ==================== Helper Methods ====================

  async compareAndLog(
    userId: string,
    entityType: string,
    entityId: string,
    action: string,
    oldEntity: any,
    newEntity: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog | null> {
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

  private extractChanges(oldEntity: any, newEntity: any): any {
    const changes: any = {};

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

  private generateChangeDescription(entityType: string, action: string, changes: any): string {
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
}
