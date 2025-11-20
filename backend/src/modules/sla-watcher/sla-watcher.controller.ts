import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SlaWatcherService } from './sla-watcher.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('SLA Monitoring')
@Controller('sla')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SlaWatcherController {
  constructor(private readonly slaWatcherService: SlaWatcherService) {}

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.HUB_STAFF)
  @ApiOperation({
    summary: 'Get SLA violation statistics',
    description: 'Get overall SLA violation statistics including pickup and delivery violations.',
  })
  @ApiResponse({
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
  })
  async getSLAStatistics() {
    const statistics = await this.slaWatcherService.getSLAStatistics();

    return {
      success: true,
      data: statistics,
    };
  }

  @Get('shipment/:shipmentId')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.MERCHANT)
  @ApiOperation({
    summary: 'Check SLA status for specific shipment',
    description: 'Check if a specific shipment has any SLA violations and get detailed information.',
  })
  @ApiResponse({
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
  })
  async checkShipmentSLA(@Param('shipmentId') shipmentId: string) {
    const slaStatus = await this.slaWatcherService.checkShipmentSLA(shipmentId);

    return {
      success: true,
      data: slaStatus,
    };
  }

  @Get('queue/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get SLA queue status',
    description: 'Get the current status of the SLA watcher queue including waiting, active, and completed jobs.',
  })
  @ApiResponse({
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
  })
  async getQueueStatus() {
    const queueStatus = await this.slaWatcherService.getQueueStatus();

    return {
      success: true,
      data: queueStatus,
    };
  }
}
