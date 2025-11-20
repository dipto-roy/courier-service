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
import { TrackingGateway } from './tracking.gateway';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums';
import { TrackingQueryDto } from './dto';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService,
    private readonly trackingGateway: TrackingGateway,
  ) {}

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

  /**
   * WebSocket Gateway Status (Public for testing)
   */
  @Public()
  @Get('gateway-status')
  @ApiOperation({
    summary: 'Get WebSocket gateway status',
    description: 'Check if WebSocket server is operational and get connection stats',
  })
  @ApiResponse({
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
  })
  getGatewayStatus() {
    return this.trackingGateway.getGatewayStatus();
  }

  /**
   * Get Active WebSocket Subscriptions
   */
  @Public()
  @Get('active-subscriptions')
  @ApiOperation({
    summary: 'Get all active WebSocket subscriptions',
    description: 'Returns list of AWBs being tracked in real-time',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns active subscriptions',
  })
  getActiveSubscriptions() {
    return {
      subscriptions: this.trackingGateway.getActiveSubscriptions(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send test event to WebSocket clients (Debug)
   */
  @Public()
  @Get('test-event/:awb')
  @ApiOperation({
    summary: 'Send test WebSocket event',
    description: 'Broadcasts a test event to all clients subscribed to this AWB (for debugging)',
  })
  @ApiParam({ name: 'awb', description: 'Shipment AWB number' })
  @ApiResponse({
    status: 200,
    description: 'Test event sent',
  })
  sendTestEvent(@Param('awb') awb: string) {
    return this.trackingGateway.emitTestEvent(awb);
  }

  /**
   * WebSocket Monitoring Dashboard
   */
  @Public()
  @Get('monitor')
  @ApiOperation({
    summary: 'Get WebSocket monitoring data',
    description: 'Returns comprehensive monitoring information for WebSocket gateway',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns monitoring data',
  })
  async getMonitoringData() {
    const gatewayStatus = this.trackingGateway.getGatewayStatus();
    const activeShipments = gatewayStatus.subscriptions;

    return {
      gateway: gatewayStatus,
      recentActivity: {
        activeTracking: activeShipments.length,
        totalSubscribers: activeShipments.reduce(
          (sum, s) => sum + s.connections,
          0,
        ),
      },
      health: {
        websocket: gatewayStatus.serverRunning ? 'healthy' : 'down',
        namespace: gatewayStatus.namespace,
        timestamp: new Date().toISOString(),
      },
      activeShipments,
    };
  }
}
