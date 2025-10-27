export enum ShipmentStatus {
  PENDING = 'pending',
  PICKUP_ASSIGNED = 'pickup_assigned',
  PICKED_UP = 'picked_up',
  IN_HUB = 'in_hub',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RTO_INITIATED = 'rto_initiated',
  RTO_IN_TRANSIT = 'rto_in_transit',
  RTO_DELIVERED = 'rto_delivered',
  CANCELLED = 'cancelled',
}
