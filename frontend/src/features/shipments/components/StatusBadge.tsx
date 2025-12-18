import { cn } from '@/lib/utils';
import type { ShipmentStatus } from '@/src/common/types';
import { STATUS_COLORS } from '@/src/common/constants';

interface StatusBadgeProps {
  status: ShipmentStatus;
  className?: string;
}

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: 'Pending',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
        STATUS_COLORS[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
