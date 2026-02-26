'use client';

import { formatDistanceToNow } from 'date-fns';

interface ETADisplayProps {
  eta: string;
  distance?: number;
  remainingStops?: number;
}

export function ETADisplay({ eta, distance, remainingStops }: ETADisplayProps) {
  // Safely parse the date
  const etaDate = new Date(eta);
  const isValidDate = !isNaN(etaDate.getTime());
  
  // Only calculate timeRemaining if date is valid
  const timeRemaining = isValidDate 
    ? formatDistanceToNow(etaDate, { addSuffix: true })
    : 'Calculating...';

  // If ETA is not a valid date, show a simplified display
  if (!isValidDate) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Estimated Arrival</h3>
            <p className="text-sm text-muted-foreground">Expected delivery time</p>
          </div>
        </div>
        <div className="bg-card dark:bg-card/50 rounded-lg p-4">
          <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
            {eta || 'ETA will be updated soon'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back for updates
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Estimated Arrival</h3>
          <p className="text-sm text-muted-foreground">Expected delivery time</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* ETA Time */}
        <div className="bg-card dark:bg-card/50 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {etaDate.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {etaDate.toLocaleDateString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-xs text-muted-foreground mt-2">{timeRemaining}</p>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-3">
          {distance !== undefined && (
            <div className="bg-card dark:bg-card/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Distance</p>
              <p className="text-lg font-semibold text-foreground">
                {distance > 1
                  ? `${distance.toFixed(1)} km`
                  : `${(distance * 1000).toFixed(0)} m`}
              </p>
            </div>
          )}
          {remainingStops !== undefined && (
            <div className="bg-card dark:bg-card/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Stops Left</p>
              <p className="text-lg font-semibold text-foreground">
                {remainingStops}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
