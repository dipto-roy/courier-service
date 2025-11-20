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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../common/enums");
const shipment_entity_1 = require("./shipment.entity");
const pickup_entity_1 = require("./pickup.entity");
const rider_location_entity_1 = require("./rider-location.entity");
const transaction_entity_1 = require("./transaction.entity");
let User = class User {
    id;
    email;
    name;
    phone;
    password;
    role;
    isActive;
    isVerified;
    isKycVerified;
    twoFaEnabled;
    twoFaSecret;
    otpCode;
    otpExpiry;
    refreshToken;
    walletBalance;
    address;
    city;
    area;
    postalCode;
    latitude;
    longitude;
    hubId;
    merchantBusinessName;
    merchantTradeLicense;
    profileImage;
    lastLogin;
    createdAt;
    updatedAt;
    deletedAt;
    shipments;
    pickups;
    riderLocations;
    transactions;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.UserRole,
        default: enums_1.UserRole.CUSTOMER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_verified', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_kyc_verified', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isKycVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'two_fa_enabled', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "twoFaEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'two_fa_secret', nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "twoFaSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'otp_code', type: 'varchar', nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Object)
], User.prototype, "otpCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'otp_expiry', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "otpExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresh_token', type: 'text', nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Object)
], User.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'wallet_balance',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], User.prototype, "walletBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'postal_code', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hub_id', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "hubId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_business_name', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "merchantBusinessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_trade_license', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "merchantTradeLicense", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profile_image', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_login', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLogin", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => shipment_entity_1.Shipment, (shipment) => shipment.merchant),
    __metadata("design:type", Array)
], User.prototype, "shipments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pickup_entity_1.Pickup, (pickup) => pickup.agent),
    __metadata("design:type", Array)
], User.prototype, "pickups", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => rider_location_entity_1.RiderLocation, (location) => location.rider),
    __metadata("design:type", Array)
], User.prototype, "riderLocations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, (transaction) => transaction.user),
    __metadata("design:type", Array)
], User.prototype, "transactions", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users'),
    (0, typeorm_1.Index)(['email']),
    (0, typeorm_1.Index)(['phone']),
    (0, typeorm_1.Index)(['role'])
], User);
//# sourceMappingURL=user.entity.js.map