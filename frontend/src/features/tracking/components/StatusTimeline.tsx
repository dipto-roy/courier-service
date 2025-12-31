'use client';

import { formatDateTime } from '@/src/common/lib/utils';
import type { TrackingEvent } from '../types';

const STATUS_ICONS: Record<string, string> = {
  PENDING: '⏱️',
  PICKED_UP: '📦',
  IN_TRANSIT: '🚚',
  OUT_FOR_DELIVERY: '🏍️',
  DELIVERED: '✅',
  FAILED: '❌',
  RETURNED: '↩️',
  CANCELLED: '🚫',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 border-gray-300',
  PICKED_UP: 'bg-blue-100 border-blue-300',
  IN_TRANSIT: 'bg-yellow-100 border-yellow-300',
  OUT_FOR_DELIVERY: 'bg-purple-100 border-purple-300',
  DELIVERED: 'bg-green-100 border-green-300',
  FAILED: 'bg-red-100 border-red-300',
  RETURNED: 'bg-orange-100 border-orange-300',
  CANCELLED: 'bg-gray-100 border-gray-300',
};

interface StatusTimelineProps {
  events: TrackingEvent[];
  currentStatus: string;
}

export function StatusTimeline({ events, currentStatus }: StatusTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tracking events available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Tracking History</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const isCurrentStatus = event.status === currentStatus && index === 0;
            const colorClass = STATUS_COLORS[event.status] || STATUS_COLORS.PENDING;
            const icon = STATUS_ICONS[event.status] || '📍';

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center
                    w-12 h-12 rounded-full border-2 ${colorClass}
                    ${isCurrentStatus ? 'ring-4 ring-blue-100 scale-110' : ''}
                    transition-all duration-200
                  `}
                >
                  <span className="text-xl">{icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div
                    className={`
                      rounded-lg border p-4 bg-white
                      ${isCurrentStatus ? 'border-blue-300 shadow-md' : 'border-gray-200'}
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {event.status.replace(/_/g, ' ')}
                          </h4>
                          {isCurrentStatus && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {event.description}
                        </p>
                        {event.location && (
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {event.location}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          {event.hubName && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {event.hubName}
                            </span>
                          )}
                          {event.riderName && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {event.riderName}
                            </span>
                          )}
                        </div>
                      </div>
                      <time className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(event.timestamp)}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
