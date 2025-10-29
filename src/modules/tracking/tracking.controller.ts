import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TrackingService, TimelineEvent } from './tracking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums';
import { TrackingQueryDto } from './dto';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Public()
  @Get('public/:awb')
  @ApiOperation({
    summary: 'Public shipment tracking by AWB',
    description: 'Track shipment status without authentication. Returns safe subset of data.',
  })
  @ApiParam({ name: 'awb', description: 'Shipment AWB number', example: 'FX20250128000001' })
  @ApiQuery({
    name: 'phone',
    required: false,
    description: 'Last 4 digits of receiver phone for verification',
    example: '5678',
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 401, description: 'Phone verification failed' })
  async trackPublic(@Param('awb') awb: string, @Query('phone') phone?: string) {
    return this.trackingService.trackShipment(awb, phone);
  }

  @Get('detailed/:awb')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MERCHANT, UserRole.HUB_STAFF, UserRole.SUPPORT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get detailed tracking information',
    description: 'Get comprehensive tracking data including all shipment details (requires authentication)',
  })
  @ApiParam({ name: 'awb', description: 'Shipment AWB number' })
  @ApiResponse({
    status: 200,
    description: 'Returns detailed tracking information',
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getDetailedTracking(@Param('awb') awb: string) {
    return this.trackingService.getDetailedTracking(awb);
  }

  @Public()
  @Get('subscription/:awb')
  @ApiOperation({
    summary: 'Get Pusher subscription info for real-time updates',
    description: 'Returns Pusher channel and event information for WebSocket connection',
  })
  @ApiParam({ name: 'awb', description: 'Shipment AWB number' })
  @ApiResponse({
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
  })
  getSubscriptionInfo(@Param('awb') awb: string) {
    return this.trackingService.getSubscriptionInfo(awb);
  }
}
