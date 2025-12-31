// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  /**
   * Subscribe to an event (one-time only)
   */
  once(event: string, callback: EventCallback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  /**
   * Emit an event
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event callback for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback?: EventCallback) {
    if (!callback) {
      // Remove all callbacks for this event
      this.events.delete(event);
      return;
    }

    const callbacks = this.events.get(event);
    if (callbacks) {
      this.events.set(
        event,
        callbacks.filter((cb) => cb !== callback),
      );
    }
  }

  /**
   * Clear all event subscriptions
   */
  clear() {
    this.events.clear();
  }

  /**
   * Get all registered events
   */
  getEvents(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Check if an event has subscribers
   */
  hasSubscribers(event: string): boolean {
    const callbacks = this.events.get(event);
    return callbacks ? callbacks.length > 0 : false;
  }
}

// Create singleton instance
export const eventBus = new EventBus();

// Define common events as constants
export const EVENT_NAMES = {
  AUTH: {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    TOKEN_REFRESH: 'auth:token_refresh',
    SESSION_EXPIRED: 'auth:session_expired',
  },
  NOTIFICATION: {
    NEW: 'notification:new',
    READ: 'notification:read',
    CLEAR_ALL: 'notification:clear_all',
  },
  SHIPMENT: {
    CREATED: 'shipment:created',
    UPDATED: 'shipment:updated',
    STATUS_CHANGED: 'shipment:status_changed',
  },
  TRACKING: {
    LOCATION_UPDATE: 'tracking:location_update',
    STATUS_UPDATE: 'tracking:status_update',
  },
} as const;
