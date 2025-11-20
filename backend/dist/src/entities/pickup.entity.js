"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pickup = exports.PickupStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const shipment_entity_1 = require("./shipment.entity");
var PickupStatus;
(function (PickupStatus) {
    PickupStatus["PENDING"] = "pending";
    PickupStatus["ASSIGNED"] = "assigned";
    PickupStatus["IN_PROGRESS"] = "in_progress";
    PickupStatus["COMPLETED"] = "completed";
    PickupStatus["CANCELLED"] = "cancelled";
})(PickupStatus || (exports.PickupStatus = PickupStatus = {}));
let Pickup = class Pickup {
    id;
    merchantId;
    agentId;
    status;
    pickupAddress;
    pickupCity;
    pickupArea;
    pickupDate;
    scheduledDate;
    contactPerson;
    contactPhone;
    totalShipments;
    notes;
    signatureUrl;
    photoUrl;
    latitude;
    longitude;
    createdAt;
    updatedAt;
    agent;
    merchant;
    shipments;
};
exports.Pickup = Pickup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Pickup.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_id' }),
    __metadata("design:type", String)
], Pickup.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agent_id', nullable: true }),
    __metadata("design:type", String)
], Pickup.prototype, "agentId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PickupStatus,
        default: PickupStatus.PENDING,
    }),
    __metadata("design:type", String)
], Pickup.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pickup_address', type: 'text' }),
    __metadata("design:type", String)
], Pickup.prototype, "pickupAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pickup_city' }),
    __metadata("design:type", String)
], Pickup.prototype, "pickupCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pickup_area' }),
    __metadata("design:type", String)
], Pickup.prototype, "pickupArea", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pickup_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Pickup.prototype, "pickupDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_date', type: 'timestamp' }),
    __metadata("design:type", Date)
], Pickup.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_person' }),
    __metadata("design:type", String)
], Pickup.prototype, "contactPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_phone' }),
    __metadata("design:type", String)
], Pickup.prototype, "contactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_shipments', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Pickup.prototype, "totalShipments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Pickup.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signature_url', nullable: true }),
    __metadata("design:type", String)
], Pickup.prototype, "signatureUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_url', nullable: true }),
    __metadata("design:type", String)
], Pickup.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'latitude', nullable: true }),
    __metadata("design:type", String)
], Pickup.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'longitude', nullable: true }),
    __metadata("design:type", String)
], Pickup.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Pickup.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Pickup.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.pickups),
    (0, typeorm_1.JoinColumn)({ name: 'agent_id' }),
    __metadata("design:type", user_entity_1.User)
], Pickup.prototype, "agent", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'merchant_id' }),
    __metadata("design:type", user_entity_1.User)
], Pickup.prototype, "merchant", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => shipment_entity_1.Shipment, (shipment) => shipment.pickup),
    __metadata("design:type", Array)
], Pickup.prototype, "shipments", void 0);
exports.Pickup = Pickup = __decorate([
    (0, typeorm_1.Entity)('pickups'),
    (0, typeorm_1.Index)(['agentId']),
    (0, typeorm_1.Index)(['merchantId']),
    (0, typeorm_1.Index)(['status'])
], Pickup);
//# sourceMappingURL=pickup.entity.js.map