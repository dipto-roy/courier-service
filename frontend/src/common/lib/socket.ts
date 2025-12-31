import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Tracking subscriptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToTracking(awb: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('tracking:subscribe', { awb });
    this.socket.on(`tracking:${awb}`, callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unsubscribeFromTracking(awb: string, callback?: (data: any) => void) {
    if (!this.socket) return;

    this.socket.emit('tracking:unsubscribe', { awb });
    if (callback) {
      this.socket.off(`tracking:${awb}`, callback);
    } else {
      this.socket.off(`tracking:${awb}`);
    }
  }

  // Notification subscriptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToNotifications(userId: number, callback: (data: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('notification', callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unsubscribeFromNotifications(callback?: (data: any) => void) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off('notification', callback);
    } else {
      this.socket.off('notification');
    }
  }

  // Generic emit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, data: any) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  // Generic listener
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.on(event, callback);
  }

  // Remove listener
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: string, callback?: (data: any) => void) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
