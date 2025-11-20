"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentStatus = void 0;
var ShipmentStatus;
(function (ShipmentStatus) {
    ShipmentStatus["PENDING"] = "pending";
    ShipmentStatus["PICKUP_ASSIGNED"] = "pickup_assigned";
    ShipmentStatus["PICKED_UP"] = "picked_up";
    ShipmentStatus["IN_HUB"] = "in_hub";
    ShipmentStatus["IN_TRANSIT"] = "in_transit";
    ShipmentStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    ShipmentStatus["DELIVERED"] = "delivered";
    ShipmentStatus["FAILED_DELIVERY"] = "failed_delivery";
    ShipmentStatus["RTO_INITIATED"] = "rto_initiated";
    ShipmentStatus["RTO_IN_TRANSIT"] = "rto_in_transit";
    ShipmentStatus["RTO_DELIVERED"] = "rto_delivered";
    ShipmentStatus["CANCELLED"] = "cancelled";
})(ShipmentStatus || (exports.ShipmentStatus = ShipmentStatus = {}));
//# sourceMappingURL=shipment-status.enum.js.map