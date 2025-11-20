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
exports.Manifest = exports.ManifestStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const shipment_entity_1 = require("./shipment.entity");
var ManifestStatus;
(function (ManifestStatus) {
    ManifestStatus["CREATED"] = "created";
    ManifestStatus["IN_TRANSIT"] = "in_transit";
    ManifestStatus["RECEIVED"] = "received";
    ManifestStatus["CLOSED"] = "closed";
})(ManifestStatus || (exports.ManifestStatus = ManifestStatus = {}));
let Manifest = class Manifest {
    id;
    manifestNumber;
    originHub;
    destinationHub;
    riderId;
    status;
    totalShipments;
    dispatchDate;
    receivedDate;
    createdById;
    receivedById;
    notes;
    createdAt;
    updatedAt;
    createdBy;
    receivedBy;
    rider;
    shipments;
};
exports.Manifest = Manifest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Manifest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manifest_number', unique: true, length: 20 }),
    __metadata("design:type", String)
], Manifest.prototype, "manifestNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'origin_hub' }),
    __metadata("design:type", String)
], Manifest.prototype, "originHub", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destination_hub', nullable: true }),
    __metadata("design:type", String)
], Manifest.prototype, "destinationHub", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rider_id', nullable: true }),
    __metadata("design:type", String)
], Manifest.prototype, "riderId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ManifestStatus,
        default: ManifestStatus.CREATED,
    }),
    __metadata("design:type", String)
], Manifest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_shipments', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Manifest.prototype, "totalShipments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dispatch_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Manifest.prototype, "dispatchDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'received_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Manifest.prototype, "receivedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id' }),
    __metadata("design:type", String)
], Manifest.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'received_by_id', nullable: true }),
    __metadata("design:type", String)
], Manifest.prototype, "receivedById", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Manifest.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Manifest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Manifest.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Manifest.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'received_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Manifest.prototype, "receivedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'rider_id' }),
    __metadata("design:type", user_entity_1.User)
], Manifest.prototype, "rider", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => shipment_entity_1.Shipment, (shipment) => shipment.manifest),
    __metadata("design:type", Array)
], Manifest.prototype, "shipments", void 0);
exports.Manifest = Manifest = __decorate([
    (0, typeorm_1.Entity)('manifests'),
    (0, typeorm_1.Index)(['manifestNumber'], { unique: true }),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdById'])
], Manifest);
//# sourceMappingURL=manifest.entity.js.map