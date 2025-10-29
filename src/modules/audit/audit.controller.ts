import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditFilterDto, CreateAuditLogDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import type { Request } from 'express';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // ==================== Manual Audit Logging ====================

  @Post('log')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create audit log manually',
    description: 'Manually create an audit log entry. Used for system events or custom logging.',
  })
  @ApiResponse({
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
  })
  async createAuditLog(
    @Body() createAuditLogDto: CreateAuditLogDto,
    @Req() req: Request,
  ) {
    // Extract IP and user agent if not provided
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

  // ==================== Query Endpoints ====================

  @Get('logs')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Get audit logs with filtering',
    description: 'Retrieve audit logs with optional filtering by user, entity, action, date range, and IP address. Supports pagination.',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type (e.g., shipment, user, pickup)' })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action (e.g., create, update, delete, status_change)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for date range filter (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for date range filter (ISO 8601)' })
  @ApiQuery({ name: 'ipAddress', required: false, description: 'Filter by IP address' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20, max: 100)' })
  @ApiResponse({
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
  })
  async getAuditLogs(@Query() filterDto: AuditFilterDto) {
    const result = await this.auditService.getAuditLogs(filterDto);

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('logs/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Get audit log by ID',
    description: 'Retrieve a specific audit log entry by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Audit log not found',
  })
  async getAuditLogById(@Param('id') id: string) {
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

  @Get('entity/:entityType/:entityId')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Get entity audit trail',
    description: 'Retrieve the complete audit trail for a specific entity, showing all changes in chronological order.',
  })
  @ApiResponse({
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
  })
  async getEntityAuditTrail(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const auditTrail = await this.auditService.getEntityAuditTrail(entityType, entityId);

    return {
      success: true,
      entityType,
      entityId,
      totalChanges: auditTrail.length,
      data: auditTrail,
    };
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Get user activity logs',
    description: 'Retrieve all actions performed by a specific user, ordered by most recent first.',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of logs to return (default: 50)' })
  @ApiResponse({
    status: 200,
    description: 'User activity logs retrieved successfully',
  })
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    const logs = await this.auditService.getUserActivityLogs(
      userId,
      limit ? parseInt(limit.toString()) : 50,
    );

    return {
      success: true,
      userId,
      totalActivities: logs.length,
      data: logs,
    };
  }

  @Get('recent')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get recent audit logs',
    description: 'Retrieve the most recent audit logs across the entire system for admin dashboard.',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of logs to return (default: 100)' })
  @ApiResponse({
    status: 200,
    description: 'Recent audit logs retrieved successfully',
  })
  async getRecentLogs(@Query('limit') limit?: number) {
    const logs = await this.auditService.getRecentLogs(
      limit ? parseInt(limit.toString()) : 100,
    );

    return {
      success: true,
      data: logs,
    };
  }

  // ==================== Statistics Endpoints ====================

  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get audit statistics',
    description: 'Get comprehensive audit statistics including total logs, breakdown by entity type and action, top users, and activity trends.',
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for statistics (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for statistics (ISO 8601)' })
  @ApiResponse({
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
  })
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const statistics = await this.auditService.getAuditStatistics(startDate, endDate);

    return {
      success: true,
      data: statistics,
    };
  }

  @Get('statistics/user/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Get user audit statistics',
    description: 'Get detailed audit statistics for a specific user, including activity breakdown and recent actions.',
  })
  @ApiResponse({
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
  })
  async getUserStatistics(@Param('userId') userId: string) {
    const statistics = await this.auditService.getUserStatistics(userId);

    return {
      success: true,
      userId,
      data: statistics,
    };
  }

  // ==================== Helper Methods ====================

  private getIpAddress(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0];
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
