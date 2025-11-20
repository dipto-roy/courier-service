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
exports.Transaction = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const user_entity_1 = require("./user.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["DELIVERY_FEE"] = "delivery_fee";
    TransactionType["COD_COLLECTION"] = "cod_collection";
    TransactionType["COD_PAYOUT"] = "cod_payout";
    TransactionType["WALLET_CREDIT"] = "wallet_credit";
    TransactionType["WALLET_DEBIT"] = "wallet_debit";
    TransactionType["REFUND"] = "refund";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
let Transaction = class Transaction {
    id;
    transactionId;
    userId;
    shipmentId;
    type;
    paymentMethod;
    status;
    amount;
    fee;
    netAmount;
    previousBalance;
    newBalance;
    description;
    referenceNumber;
    gatewayResponse;
    processedAt;
    processedById;
    createdAt;
    updatedAt;
    user;
    processedBy;
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_id', unique: true, length: 30 }),
    __metadata("design:type", String)
], Transaction.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shipment_id', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "shipmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionType,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.PaymentMethod,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.PaymentStatus,
        default: enums_1.PaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "netAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'previous_balance',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Transaction.prototype, "previousBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'new_balance',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Transaction.prototype, "newBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_number', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "referenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gateway_response', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "gatewayResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_by_id', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "processedById", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Transaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'processed_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Transaction.prototype, "processedBy", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['shipmentId']),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdAt'])
], Transaction);
//# sourceMappingURL=transaction.entity.js.map