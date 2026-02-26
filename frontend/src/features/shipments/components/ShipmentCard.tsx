'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { formatDateTime, formatCurrency } from '@/src/common/lib/utils';
import type { Shipment } from '@/src/common/types';

interface ShipmentCardProps {
  shipment: Shipment;
}

export function ShipmentCard({ shipment }: ShipmentCardProps) {
  return (
    <Link href={`/dashboard/shipments/${shipment.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-card">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">AWB Number</p>
            <p className="text-lg font-semibold text-foreground">{shipment.awbNumber}</p>
          </div>
          <StatusBadge status={shipment.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Receiver</p>
            <p className="text-sm font-medium text-foreground">{shipment.receiverName}</p>
            <p className="text-xs text-muted-foreground">{shipment.receiverPhone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Delivery Address</p>
            <p className="text-sm text-foreground">{shipment.receiverCity}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm text-foreground">{formatDateTime(shipment.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Delivery Fee</p>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(shipment.deliveryFee)}
            </p>
          </div>
        </div>

        {shipment.codAmount && shipment.codAmount > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
              COD: {formatCurrency(shipment.codAmount)}
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
}
