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
exports.WalletUpdateDto = exports.WalletOperationType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var WalletOperationType;
(function (WalletOperationType) {
    WalletOperationType["CREDIT"] = "credit";
    WalletOperationType["DEBIT"] = "debit";
})(WalletOperationType || (exports.WalletOperationType = WalletOperationType = {}));
class WalletUpdateDto {
    operation;
    amount;
    remarks;
}
exports.WalletUpdateDto = WalletUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: WalletOperationType, example: WalletOperationType.CREDIT, description: 'Operation type' }),
    (0, class_validator_1.IsEnum)(WalletOperationType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WalletUpdateDto.prototype, "operation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000, description: 'Amount to credit or debit' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], WalletUpdateDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Payment for delivery charges', description: 'Transaction remarks' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WalletUpdateDto.prototype, "remarks", void 0);
//# sourceMappingURL=wallet-update.dto.js.map