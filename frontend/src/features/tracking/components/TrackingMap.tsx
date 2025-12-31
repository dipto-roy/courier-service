'use client';

import dynamic from 'next/dynamic';
import type { TrackingMapProps } from './TrackingMapInner';

// Loading placeholder component
function MapLoadingPlaceholder() {
  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200">
      <div className="absolute inset-0 bg-gray-100 animate-pulse z-10 flex items-center justify-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  );
}

// Dynamically import the map component with SSR disabled
export const TrackingMap = dynamic<TrackingMapProps>(
  () => import('./TrackingMapInner').then((mod) => mod.TrackingMapInner),
  {
    ssr: false,
    loading: MapLoadingPlaceholder,
  }
);
