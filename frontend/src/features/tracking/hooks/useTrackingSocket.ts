'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/src/common/lib/socket';
import { queryKeys } from '@/src/common/lib/queryClient';
import type { LocationData, TrackingEvent, RiderInfo } from '../types';

interface TrackingSocketData {
  location: LocationData | null;
  rider: RiderInfo | null;
  lastEvent: TrackingEvent | null;
  isConnected: boolean;
}

/**
 * Hook for real-time tracking updates via WebSocket
 */
export function useTrackingSocket(awb: string): TrackingSocketData {
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [rider, setRider] = useState<RiderInfo | null>(null);
  const [lastEvent, setLastEvent] = useState<TrackingEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleLocationUpdate = useCallback((data: LocationData) => {
    setLocation(data);
    // Invalidate location queries to update the UI
    queryClient.invalidateQueries({ queryKey: queryKeys.tracking.locations(awb) });
  }, [awb, queryClient]);

  const handleStatusUpdate = useCallback((event: TrackingEvent) => {
    setLastEvent(event);
    // Invalidate tracking queries to reflect new status
    queryClient.invalidateQueries({ queryKey: queryKeys.tracking.detail(awb) });
    queryClient.invalidateQueries({ queryKey: queryKeys.tracking.history(awb) });
  }, [awb, queryClient]);

  const handleRiderUpdate = useCallback((riderData: RiderInfo) => {
    setRider(riderData);
  }, []);

  useEffect(() => {
    if (!awb) return;

    // Connect to socket (will use auth token from localStorage if available)
    const socket = socketService.connect(''); // Token will be added by socket service

    // Subscribe to tracking channel
    socket.emit('tracking:subscribe', { awb });

    // Listen for connection status
    const handleConnect = () => {
      setIsConnected(true);
      // Resubscribe after reconnection
      socket.emit('tracking:subscribe', { awb });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Listen for tracking updates
    socket.on(`tracking:${awb}:location`, handleLocationUpdate);
    socket.on(`tracking:${awb}:status`, handleStatusUpdate);
    socket.on(`tracking:${awb}:rider`, handleRiderUpdate);

    // Set initial connection status
    setIsConnected(socketService.isConnected());

    // Cleanup
    return () => {
      socket.emit('tracking:unsubscribe', { awb });
      socket.off(`tracking:${awb}:location`, handleLocationUpdate);
      socket.off(`tracking:${awb}:status`, handleStatusUpdate);
      socket.off(`tracking:${awb}:rider`, handleRiderUpdate);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [awb, handleLocationUpdate, handleStatusUpdate, handleRiderUpdate]);

  return {
    location,
    rider,
    lastEvent,
    isConnected,
  };
}
