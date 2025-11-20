import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this properly in production
  },
  namespace: '/tracking',
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('TrackingGateway');
  private activeConnections: Map<string, Set<string>> = new Map(); // AWB -> Set of socket IDs

  constructor(private readonly trackingService: TrackingService) {}

  /**
   * Handle client connection
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Clean up subscriptions
    this.activeConnections.forEach((sockets, awb) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.activeConnections.delete(awb);
      }
    });
  }

  /**
   * Subscribe to shipment tracking updates
   */
  @SubscribeMessage('subscribe-tracking')
  async handleSubscribe(
    @MessageBody() data: { awb: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { awb } = data;

    if (!awb) {
      const errorResponse = { success: false, error: 'AWB number is required' };
      client.emit('error', errorResponse);
      return errorResponse;
    }

    try {
      // Add to tracking map
      if (!this.activeConnections.has(awb)) {
        this.activeConnections.set(awb, new Set());
      }
      this.activeConnections.get(awb)!.add(client.id);

      // Join the room
      await client.join(`tracking-${awb}`);

      // Try to send initial tracking data, but don't fail subscription if not found
      try {
        const trackingData = await this.trackingService.trackShipment(awb);
        client.emit('tracking-data', trackingData);
      } catch (trackingError) {
        // Shipment might not exist yet, but subscription is still valid
        this.logger.log(`Client ${client.id} subscribed to ${awb} (shipment not found yet)`);
      }

      this.logger.log(`Client ${client.id} subscribed to ${awb}`);

      return {
        success: true,
        awb,
        message: `Successfully subscribed to tracking updates for ${awb}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Subscription error for ${awb}:`, errorMessage);
      const errorResponse = { success: false, awb, error: errorMessage };
      client.emit('error', errorResponse);
      return errorResponse;
    }
  }

  /**
   * Unsubscribe from shipment tracking
   */
  @SubscribeMessage('unsubscribe-tracking')
  async handleUnsubscribe(
    @MessageBody() data: { awb: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { awb } = data;

    if (!awb) {
      const errorResponse = { success: false, error: 'AWB number is required' };
      client.emit('error', errorResponse);
      return errorResponse;
    }

    await client.leave(`tracking-${awb}`);

    // Remove from tracking
    const connections = this.activeConnections.get(awb);
    if (connections) {
      connections.delete(client.id);
      if (connections.size === 0) {
        this.activeConnections.delete(awb);
      }
    }

    this.logger.log(`Client ${client.id} unsubscribed from ${awb}`);

    return { success: true, awb, message: `Successfully unsubscribed from ${awb}` };
  }

  /**
   * Get current tracking status (one-time request)
   */
  @SubscribeMessage('get-tracking')
  async handleGetTracking(
    @MessageBody() data: { awb: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { awb } = data;

    if (!awb) {
      const errorResponse = { success: false, error: 'AWB number is required' };
      client.emit('error', errorResponse);
      return errorResponse;
    }

    try {
      const trackingData = await this.trackingService.trackShipment(awb);
      client.emit('tracking-data', trackingData);
      return trackingData;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Tracking fetch error for ${awb}:`, errorMessage);
      const errorResponse = { success: false, error: errorMessage };
      client.emit('error', errorResponse);
      return errorResponse;
    }
  }

  /**
   * Broadcast status update to all subscribers of an AWB
   */
  emitStatusUpdate(
    awb: string,
    statusUpdate: { status: string; description?: string },
  ) {
    this.server.to(`tracking-${awb}`).emit('status-update', {
      awb,
      ...statusUpdate,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Status update broadcasted for ${awb}: ${statusUpdate.status}`,
    );
  }

  /**
   * Broadcast location update to all subscribers of an AWB
   */
  emitLocationUpdate(
    awb: string,
    location: { latitude: number; longitude: number },
  ) {
    this.server.to(`tracking-${awb}`).emit('location-update', {
      awb,
      location,
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(`Location update broadcasted for ${awb}`);
  }

  /**
   * Broadcast ETA update
   */
  emitEtaUpdate(awb: string, eta: string) {
    this.server.to(`tracking-${awb}`).emit('eta-update', {
      awb,
      eta,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get active tracking subscriptions count
   */
  getActiveSubscriptions(): { awb: string; connections: number }[] {
    const result: { awb: string; connections: number }[] = [];

    this.activeConnections.forEach((sockets, awb) => {
      result.push({
        awb,
        connections: sockets.size,
      });
    });

    return result;
  }

  /**
   * Get WebSocket gateway health status
   */
  getGatewayStatus() {
    const activeSubscriptions = this.getActiveSubscriptions();

    return {
      status: 'operational',
      namespace: '/tracking',
      activeConnections: this.server?.sockets?.sockets?.size || 0,
      activeSubscriptions: activeSubscriptions.length,
      subscriptions: activeSubscriptions,
      serverRunning: !!this.server,
    };
  }

  /**
   * Emit test event (for debugging)
   */
  emitTestEvent(awb: string) {
    const subscriberCount = this.activeConnections.get(awb)?.size || 0;

    if (subscriberCount > 0) {
      this.server.to(`tracking-${awb}`).emit('test-event', {
        awb,
        message: 'This is a test broadcast from backend',
        timestamp: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: `Test event sent to ${awb}`,
      subscriberCount,
      hasSubscribers: subscriberCount > 0,
    };
  }

  /**
   * Get all active rooms
   */
  getActiveRooms(): string[] {
    const rooms: string[] = [];
    this.activeConnections.forEach((_, awb) => {
      rooms.push(`tracking-${awb}`);
    });
    return rooms;
  }
}
