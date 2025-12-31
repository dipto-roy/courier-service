import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Shipment - FastX Courier',
  description: 'Real-time shipment tracking with GPS location',
};

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
