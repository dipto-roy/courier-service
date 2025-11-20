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
exports.TrackingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const tracking_service_1 = require("./tracking.service");
let TrackingGateway = class TrackingGateway {
    trackingService;
    server;
    logger = new common_1.Logger('TrackingGateway');
    activeConnections = new Map();
    constructor(trackingService) {
        this.trackingService = trackingService;
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.activeConnections.forEach((sockets, awb) => {
            sockets.delete(client.id);
            if (sockets.size === 0) {
                this.activeConnections.delete(awb);
            }
        });
    }
    async handleSubscribe(data, client) {
        const { awb } = data;
        if (!awb) {
            const errorResponse = { success: false, error: 'AWB number is required' };
            client.emit('error', errorResponse);
            return errorResponse;
        }
        try {
            if (!this.activeConnections.has(awb)) {
                this.activeConnections.set(awb, new Set());
            }
            this.activeConnections.get(awb).add(client.id);
            await client.join(`tracking-${awb}`);
            try {
                const trackingData = await this.trackingService.trackShipment(awb);
                client.emit('tracking-data', trackingData);
            }
            catch (trackingError) {
                this.logger.log(`Client ${client.id} subscribed to ${awb} (shipment not found yet)`);
            }
            this.logger.log(`Client ${client.id} subscribed to ${awb}`);
            return {
                success: true,
                awb,
                message: `Successfully subscribed to tracking updates for ${awb}`,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Subscription error for ${awb}:`, errorMessage);
            const errorResponse = { success: false, awb, error: errorMessage };
            client.emit('error', errorResponse);
            return errorResponse;
        }
    }
    async handleUnsubscribe(data, client) {
        const { awb } = data;
        if (!awb) {
            const errorResponse = { success: false, error: 'AWB number is required' };
            client.emit('error', errorResponse);
            return errorResponse;
        }
        await client.leave(`tracking-${awb}`);
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
    async handleGetTracking(data, client) {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Tracking fetch error for ${awb}:`, errorMessage);
            const errorResponse = { success: false, error: errorMessage };
            client.emit('error', errorResponse);
            return errorResponse;
        }
    }
    emitStatusUpdate(awb, statusUpdate) {
        this.server.to(`tracking-${awb}`).emit('status-update', {
            awb,
            ...statusUpdate,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Status update broadcasted for ${awb}: ${statusUpdate.status}`);
    }
    emitLocationUpdate(awb, location) {
        this.server.to(`tracking-${awb}`).emit('location-update', {
            awb,
            location,
            timestamp: new Date().toISOString(),
        });
        this.logger.debug(`Location update broadcasted for ${awb}`);
    }
    emitEtaUpdate(awb, eta) {
        this.server.to(`tracking-${awb}`).emit('eta-update', {
            awb,
            eta,
            timestamp: new Date().toISOString(),
        });
    }
    getActiveSubscriptions() {
        const result = [];
        this.activeConnections.forEach((sockets, awb) => {
            result.push({
                awb,
                connections: sockets.size,
            });
        });
        return result;
    }
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
    emitTestEvent(awb) {
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
    getActiveRooms() {
        const rooms = [];
        this.activeConnections.forEach((_, awb) => {
            rooms.push(`tracking-${awb}`);
        });
        return rooms;
    }
};
exports.TrackingGateway = TrackingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TrackingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe-tracking'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe-tracking'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-tracking'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleGetTracking", null);
exports.TrackingGateway = TrackingGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/tracking',
    }),
    __metadata("design:paramtypes", [tracking_service_1.TrackingService])
], TrackingGateway);
//# sourceMappingURL=tracking.gateway.js.map