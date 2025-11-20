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
exports.Shipment = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const user_entity_1 = require("./user.entity");
const pickup_entity_1 = require("./pickup.entity");
const manifest_entity_1 = require("./manifest.entity");
let Shipment = class Shipment {
    id;
    awb;
    merchantId;
    customerId;
    pickupId;
    manifestId;
    riderId;
    senderName;
    senderPhone;
    senderAddress;
    senderCity;
    senderArea;
    senderPostalCode;
    receiverName;
    receiverPhone;
    receiverAddress;
    receiverCity;
    receiverArea;
    receiverPostalCode;
    receiverLatitude;
    receiverLongitude;
    productDescription;
    weight;
    quantity;
    declaredValue;
    deliveryType;
    status;
    paymentMethod;
    paymentStatus;
    codAmount;
    deliveryFee;
    codFee;
    totalAmount;
    expectedDeliveryDate;
    actualDeliveryDate;
    slaBreached;
    deliveryAttempts;
    failedReason;
    deliveryNote;
    otpCode;
    signatureUrl;
    podPhotoUrl;
    pickupPhotoUrl;
    isRto;
    rtoReason;
    currentHub;
    nextHub;
    deliveryArea;
    specialInstructions;
    invoiceNumber;
    referenceNumber;
    createdAt;
    updatedAt;
    deletedAt;
    merchant;
    customer;
    rider;
    pickup;
    manifest;
};
exports.Shipment = Shipment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Shipment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 20 }),
    __metadata("design:type", String)
], Shipment.prototype, "awb", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_id' }),
    __metadata("design:type", String)
], Shipment.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pickup_id', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "pickupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manifest_id', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "manifestId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rider_id', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "riderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_name' }),
    __metadata("design:type", String)
], Shipment.prototype, "senderName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_phone' }),
    __metadata("design:type", String)
], Shipment.prototype, "senderPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_address', type: 'text' }),
    __metadata("design:type", String)
], Shipment.prototype, "senderAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_city' }),
    __metadata("design:type", String)
], Shipment.prototype, "senderCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_area' }),
    __metadata("design:type", String)
], Shipment.prototype, "senderArea", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_postal_code', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "senderPostalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_name' }),
    __metadata("design:type", String)
], Shipment.prototype, "receiverName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_phone' }),
    __metadata("design:type", String)
], Shipment.prototype, "receiverPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_address', type: 'text' }),
    __metadata("design:type", String)
], Shipment.prototype, "receiverAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_city' }),
    __metadata("design:type", String)
], Shipment.prototype, "receiverCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_area' }),
    __metadata("design:type", String)
], Shipment.prototype, "receiverArea", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_postal_code', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "receiverPostalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_latitude', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "receiverLatitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receiver_longitude', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "receiverLongitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_description', type: 'text' }),
    __metadata("design:type", String)
], Shipment.prototype, "productDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weight', type: 'decimal', precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], Shipment.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Shipment.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'declared_value',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Shipment.prototype, "declaredValue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.DeliveryType,
        default: enums_1.DeliveryType.NORMAL,
    }),
    __metadata("design:type", String)
], Shipment.prototype, "deliveryType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.ShipmentStatus,
        default: enums_1.ShipmentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Shipment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.PaymentMethod,
        default: enums_1.PaymentMethod.COD,
    }),
    __metadata("design:type", String)
], Shipment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.PaymentStatus,
        default: enums_1.PaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Shipment.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'cod_amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], Shipment.prototype, "codAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Shipment.prototype, "deliveryFee", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'cod_fee',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], Shipment.prototype, "codFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Shipment.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_delivery_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Shipment.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_delivery_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Shipment.prototype, "actualDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sla_breached', default: false }),
    __metadata("design:type", Boolean)
], Shipment.prototype, "slaBreached", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_attempts', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Shipment.prototype, "deliveryAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "failedReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_note', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "deliveryNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'otp_code', nullable: true, length: 6 }),
    __metadata("design:type", String)
], Shipment.prototype, "otpCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signature_url', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "signatureUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pod_photo_url', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "podPhotoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pickup_photo_url', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "pickupPhotoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_rto', default: false }),
    __metadata("design:type", Boolean)
], Shipment.prototype, "isRto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rto_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "rtoReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_hub', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "currentHub", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_hub', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "nextHub", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivery_area', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "deliveryArea", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'special_instructions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "specialInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_number', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Shipment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Shipment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], Shipment.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.shipments),
    (0, typeorm_1.JoinColumn)({ name: 'merchant_id' }),
    __metadata("design:type", user_entity_1.User)
], Shipment.prototype, "merchant", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", user_entity_1.User)
], Shipment.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'rider_id' }),
    __metadata("design:type", user_entity_1.User)
], Shipment.prototype, "rider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pickup_entity_1.Pickup, (pickup) => pickup.shipments),
    (0, typeorm_1.JoinColumn)({ name: 'pickup_id' }),
    __metadata("design:type", pickup_entity_1.Pickup)
], Shipment.prototype, "pickup", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => manifest_entity_1.Manifest, (manifest) => manifest.shipments),
    (0, typeorm_1.JoinColumn)({ name: 'manifest_id' }),
    __metadata("design:type", manifest_entity_1.Manifest)
], Shipment.prototype, "manifest", void 0);
exports.Shipment = Shipment = __decorate([
    (0, typeorm_1.Entity)('shipments'),
    (0, typeorm_1.Index)(['awb'], { unique: true }),
    (0, typeorm_1.Index)(['merchantId']),
    (0, typeorm_1.Index)(['customerId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdAt'])
], Shipment);
//# sourceMappingURL=shipment.entity.js.map