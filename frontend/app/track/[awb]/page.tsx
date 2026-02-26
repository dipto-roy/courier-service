'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrackingMap } from '@/src/features/tracking/components/TrackingMap';
import { StatusTimeline } from '@/src/features/tracking/components/StatusTimeline';
import { ETADisplay } from '@/src/features/tracking/components/ETADisplay';
import { RiderInfoCard } from '@/src/features/tracking/components/RiderInfoCard';
import { useTracking } from '@/src/features/tracking/hooks/useTracking';
import { useTrackingHistory } from '@/src/features/tracking/hooks/useTracking';
import { useLocationUpdates } from '@/src/features/tracking/hooks/useTracking';
import { useETA } from '@/src/features/tracking/hooks/useTracking';
import { useTrackingSocket } from '@/src/features/tracking/hooks/useTrackingSocket';
import { StatusBadge } from '@/src/features/shipments/components/StatusBadge';
import { formatDateTime } from '@/src/common/lib/utils';

export default function TrackingPage({
  params,
}: {
  params: Promise<{ awb: string }>;
}) {
  const { awb } = use(params);
  const router = useRouter();
  // Future: Share dialog functionality
  // const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Fetch tracking data
  const { data: tracking, isLoading, error } = useTracking(awb);
  const { data: history } = useTrackingHistory(awb);
  const { data: locations } = useLocationUpdates(awb);
  const { data: etaData } = useETA(awb);

  // Real-time updates via WebSocket
  const { location: liveLocation, rider, isConnected } = useTrackingSocket(awb);

  // Handle share functionality
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Track Shipment ${awb}`,
        text: `Track your shipment ${awb}`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Tracking link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto" />
          <p className="text-muted-foreground">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Shipment Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find a shipment with AWB number: <strong className="text-foreground">{awb}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Please check the AWB number and try again.
          </p>
        </Card>
      </div>
    );
  }

  // Use live location if available, otherwise use latest from locations
  const currentLocation = liveLocation || (locations && locations[0]) || null;
  const deliveryLocation = tracking.deliveryLocation;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => router.back()}
                className="shrink-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Track Shipment
                </h1>
                <p className="text-muted-foreground mt-1">AWB: {awb}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleShare}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </Button>
          </div>

          {/* Live Status Badge */}
          {isConnected && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-medium">Live Tracking Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Map and Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Shipment Info Card */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Shipment Details
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={tracking.status} />
                    <span className="text-sm text-muted-foreground">
                      Created {formatDateTime(tracking.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">From</p>
                  <p className="font-medium text-foreground">{tracking.senderName}</p>
                  <p className="text-muted-foreground">{tracking.senderCity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">To</p>
                  <p className="font-medium text-foreground">{tracking.receiverName}</p>
                  <p className="text-muted-foreground">{tracking.receiverCity}</p>
                </div>
              </div>
            </Card>

            {/* Map */}
            {deliveryLocation && (
              <TrackingMap
                currentLocation={currentLocation}
                deliveryLocation={deliveryLocation}
                route={locations || []}
                rider={rider}
              />
            )}

            {/* Timeline */}
            {history && history.events && (
              <Card className="p-4 sm:p-6">
                <StatusTimeline
                  events={history.events}
                  currentStatus={tracking.status}
                />
              </Card>
            )}
          </div>

          {/* Right Column - ETA and Rider Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* ETA */}
            {etaData && (
              <ETADisplay
                eta={etaData.eta}
                distance={etaData.distance}
              />
            )}

            {/* Rider Info */}
            {rider && <RiderInfoCard rider={rider} />}

            {/* Additional Info Card */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Shipment Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium text-foreground">
                    {tracking.weight} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Type</span>
                  <span className="font-medium text-foreground">
                    {tracking.serviceType}
                  </span>
                </div>
                {tracking.codAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">COD Amount</span>
                    <span className="font-medium text-foreground">
                      ৳{tracking.codAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Help Card */}
            <Card className="p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                Contact our customer support for any queries about your shipment.
              </p>
              <Button variant="outline" className="w-full" size="sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Get Support
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
