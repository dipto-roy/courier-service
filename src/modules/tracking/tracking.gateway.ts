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
      client.emit('error', { message: 'AWB number is required' });
      return;
    }

    try {
      // Add to tracking map
      if (!this.activeConnections.has(awb)) {
        this.activeConnections.set(awb, new Set());
      }
      this.activeConnections.get(awb)!.add(client.id);

      // Join the room
      await client.join(`tracking-${awb}`);

      // Send initial tracking data
      const trackingData = await this.trackingService.trackShipment(awb);

      client.emit('tracking-data', trackingData);
      this.logger.log(`Client ${client.id} subscribed to ${awb}`);

      return { success: true, message: `Subscribed to tracking updates for ${awb}` };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Subscription error for ${awb}:`, errorMessage);
      client.emit('error', { message: errorMessage });
      return { success: false, message: errorMessage };
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
      return { success: false, message: 'AWB number is required' };
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

    return { success: true, message: `Unsubscribed from ${awb}` };
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
      client.emit('error', { message: 'AWB number is required' });
      return { success: false, message: 'AWB number is required' };
    }

    try {
      const trackingData = await this.trackingService.trackShipment(awb);
      client.emit('tracking-data', trackingData);
      return trackingData;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Tracking fetch error for ${awb}:`, errorMessage);
      client.emit('error', { message: errorMessage });
      return { success: false, message: errorMessage };
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
}
