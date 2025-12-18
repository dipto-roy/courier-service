'use client';

import { Card } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { formatDateTime, formatCurrency } from '@/src/common/lib/utils';
import type { Shipment } from '@/src/common/types';

interface ShipmentDetailsProps {
  shipment: Shipment;
}

export function ShipmentDetails({ shipment }: ShipmentDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{shipment.awbNumber}</h1>
            <p className="text-gray-600">Created on {formatDateTime(shipment.createdAt)}</p>
          </div>
          <StatusBadge status={shipment.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Payment Method</p>
            <p className="text-base font-medium">
              {shipment.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Delivery Fee</p>
            <p className="text-base font-semibold text-blue-600">
              {formatCurrency(shipment.deliveryFee)}
            </p>
          </div>
          {shipment.codAmount && shipment.codAmount > 0 && (
            <div>
              <p className="text-sm text-gray-500">COD Amount</p>
              <p className="text-base font-semibold text-orange-600">
                {formatCurrency(shipment.codAmount)}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Sender and Receiver */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Sender Details</h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{shipment.senderName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p>{shipment.senderPhone}</p>
            </div>
            {shipment.senderEmail && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{shipment.senderEmail}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p>
                {shipment.senderAddress}
                <br />
                {shipment.senderCity}, {shipment.senderState} {shipment.senderPostalCode}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Receiver Details</h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{shipment.receiverName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p>{shipment.receiverPhone}</p>
            </div>
            {shipment.receiverEmail && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{shipment.receiverEmail}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p>
                {shipment.receiverAddress}
                <br />
                {shipment.receiverCity}, {shipment.receiverState} {shipment.receiverPostalCode}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Package Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Package Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium">{shipment.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Weight</p>
            <p>{shipment.weight} kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quantity</p>
            <p>{shipment.quantity || 1} item(s)</p>
          </div>
          {shipment.invoiceValue && (
            <div>
              <p className="text-sm text-gray-500">Invoice Value</p>
              <p>{formatCurrency(shipment.invoiceValue)}</p>
            </div>
          )}
        </div>
        {shipment.specialInstructions && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">Special Instructions</p>
            <p className="mt-1">{shipment.specialInstructions}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
