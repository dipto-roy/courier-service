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
exports.RTODto = exports.RTOReason = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var RTOReason;
(function (RTOReason) {
    RTOReason["CUSTOMER_NOT_AVAILABLE"] = "CUSTOMER_NOT_AVAILABLE";
    RTOReason["CUSTOMER_REFUSED"] = "CUSTOMER_REFUSED";
    RTOReason["INCORRECT_ADDRESS"] = "INCORRECT_ADDRESS";
    RTOReason["CUSTOMER_NOT_REACHABLE"] = "CUSTOMER_NOT_REACHABLE";
    RTOReason["MULTIPLE_FAILED_ATTEMPTS"] = "MULTIPLE_FAILED_ATTEMPTS";
    RTOReason["PAYMENT_ISSUE"] = "PAYMENT_ISSUE";
    RTOReason["DAMAGED_PRODUCT"] = "DAMAGED_PRODUCT";
    RTOReason["OTHER"] = "OTHER";
})(RTOReason || (exports.RTOReason = RTOReason = {}));
class RTODto {
    awbNumber;
    reason;
    notes;
}
exports.RTODto = RTODto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shipment AWB number', example: 'FX20250128000001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RTODto.prototype, "awbNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for RTO',
        enum: RTOReason,
        example: RTOReason.MULTIPLE_FAILED_ATTEMPTS
    }),
    (0, class_validator_1.IsEnum)(RTOReason),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RTODto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional notes about the RTO', example: 'Customer refused to accept after 3 delivery attempts' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RTODto.prototype, "notes", void 0);
//# sourceMappingURL=rto.dto.js.map