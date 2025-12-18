'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationData, RiderInfo } from '../types';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const riderIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iIzM0OThmZiIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjQiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iI2VmNDQ0NCIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjQiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Auto-center map component
function MapAutoCenter({ location }: { location: LocationData | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.setView([location.latitude, location.longitude], map.getZoom(), {
        animate: true,
      });
    }
  }, [location, map]);
  
  return null;
}

interface TrackingMapProps {
  currentLocation: LocationData | null;
  deliveryLocation: LocationData;
  route?: LocationData[];
  rider: RiderInfo | null;
  isLoading?: boolean;
}

export function TrackingMap({
  currentLocation,
  deliveryLocation,
  route = [],
  rider,
  isLoading,
}: TrackingMapProps) {
  const mapRef = useRef<L.Map>(null);

  // Calculate map center
  const center: [number, number] = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : [deliveryLocation.latitude, deliveryLocation.longitude];

  // Convert route to polyline format
  const routeCoordinates: [number, number][] = route.map((loc) => [
    loc.latitude,
    loc.longitude,
  ]);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse z-10 flex items-center justify-center">
          <p className="text-gray-600">Loading map...</p>
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-center on location updates */}
        <MapAutoCenter location={currentLocation} />

        {/* Rider current location */}
        {currentLocation && (
          <Marker
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={riderIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{rider?.name || 'Rider'}</p>
                {currentLocation.speed && (
                  <p className="text-gray-600">
                    Speed: {Math.round(currentLocation.speed)} km/h
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(currentLocation.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Delivery destination */}
        <Marker
          position={[deliveryLocation.latitude, deliveryLocation.longitude]}
          icon={destinationIcon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Delivery Location</p>
            </div>
          </Popup>
        </Marker>

        {/* Route polyline */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#3498ff',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 10',
            }}
          />
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Rider Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
}
