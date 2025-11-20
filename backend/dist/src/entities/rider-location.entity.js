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
exports.RiderLocation = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let RiderLocation = class RiderLocation {
    id;
    riderId;
    shipmentId;
    latitude;
    longitude;
    accuracy;
    speed;
    heading;
    batteryLevel;
    isOnline;
    createdAt;
    rider;
};
exports.RiderLocation = RiderLocation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RiderLocation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rider_id' }),
    __metadata("design:type", String)
], RiderLocation.prototype, "riderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shipment_id', nullable: true }),
    __metadata("design:type", String)
], RiderLocation.prototype, "shipmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], RiderLocation.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], RiderLocation.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RiderLocation.prototype, "accuracy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RiderLocation.prototype, "speed", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RiderLocation.prototype, "heading", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'battery_level', nullable: true }),
    __metadata("design:type", Number)
], RiderLocation.prototype, "batteryLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_online', default: true }),
    __metadata("design:type", Boolean)
], RiderLocation.prototype, "isOnline", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RiderLocation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.riderLocations),
    (0, typeorm_1.JoinColumn)({ name: 'rider_id' }),
    __metadata("design:type", user_entity_1.User)
], RiderLocation.prototype, "rider", void 0);
exports.RiderLocation = RiderLocation = __decorate([
    (0, typeorm_1.Entity)('rider_locations'),
    (0, typeorm_1.Index)(['riderId', 'createdAt']),
    (0, typeorm_1.Index)(['shipmentId'])
], RiderLocation);
//# sourceMappingURL=rider-location.entity.js.map