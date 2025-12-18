'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { riderService } from '../services';
import type { LocationUpdate, LocationPermissionState, BatteryState } from '../types';

/**
 * Hook to track and update rider's GPS location
 */
export function useLocationTracking(options: {
  enabled?: boolean;
  interval?: number; // milliseconds
  onLocationUpdate?: (location: LocationUpdate) => void;
  onError?: (error: GeolocationPositionError) => void;
}) {
  const {
    enabled = true,
    interval = 30000, // 30 seconds default
    onLocationUpdate,
    onError,
  } = options;

  const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(null);
  const [permission, setPermission] = useState<LocationPermissionState>({
    granted: false,
    denied: false,
    prompt: true,
  });
  const [battery, setBattery] = useState<BatteryState>({
    level: 100,
    charging: false,
  });
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: (data: LocationUpdate) => riderService.updateLocation(data),
  });

  // Get current position
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationUpdate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          batteryLevel: battery.level,
        };

        setCurrentLocation(location);
        onLocationUpdate?.(location);

        // Send to server
        updateLocationMutation.mutate(location);
      },
      (error) => {
        console.error('Error getting location:', error);
        onError?.(error);

        if (error.code === error.PERMISSION_DENIED) {
          setPermission({ granted: false, denied: true, prompt: false });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [battery.level, onLocationUpdate, onError, updateLocationMutation]);

  // Start tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation || isTracking) return;

    setIsTracking(true);

    // Get initial position
    getCurrentPosition();

    // Set up interval for periodic updates
    intervalIdRef.current = setInterval(() => {
      getCurrentPosition();
    }, interval);
  }, [isTracking, getCurrentPosition, interval]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Request location permission
  const requestPermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      
      if (result.state === 'granted') {
        setPermission({ granted: true, denied: false, prompt: false });
        return true;
      } else if (result.state === 'prompt') {
        setPermission({ granted: false, denied: false, prompt: true });
        // Will be determined when user responds to prompt
        return false;
      } else {
        setPermission({ granted: false, denied: true, prompt: false });
        return false;
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }, []);

  // Get battery status
  useEffect(() => {
    const getBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        try {
          const batteryManager = await (navigator as any).getBattery();
          
          const updateBattery = () => {
            setBattery({
              level: Math.round(batteryManager.level * 100),
              charging: batteryManager.charging,
              chargingTime: batteryManager.chargingTime,
              dischargingTime: batteryManager.dischargingTime,
            });
          };

          updateBattery();

          batteryManager.addEventListener('levelchange', updateBattery);
          batteryManager.addEventListener('chargingchange', updateBattery);

          return () => {
            batteryManager.removeEventListener('levelchange', updateBattery);
            batteryManager.removeEventListener('chargingchange', updateBattery);
          };
        } catch (error) {
          console.error('Error accessing battery API:', error);
        }
      }
    };

    getBatteryStatus();
  }, []);

  // Auto-start tracking when enabled
  useEffect(() => {
    if (enabled && permission.granted) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [enabled, permission.granted, startTracking, stopTracking]);

  return {
    currentLocation,
    permission,
    battery,
    isTracking,
    startTracking,
    stopTracking,
    requestPermission,
    isUpdating: updateLocationMutation.isPending,
  };
}
