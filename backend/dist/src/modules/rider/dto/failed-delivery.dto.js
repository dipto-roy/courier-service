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
exports.FailedDeliveryDto = exports.FailedDeliveryReason = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var FailedDeliveryReason;
(function (FailedDeliveryReason) {
    FailedDeliveryReason["CUSTOMER_NOT_AVAILABLE"] = "CUSTOMER_NOT_AVAILABLE";
    FailedDeliveryReason["CUSTOMER_REFUSED"] = "CUSTOMER_REFUSED";
    FailedDeliveryReason["INCORRECT_ADDRESS"] = "INCORRECT_ADDRESS";
    FailedDeliveryReason["CUSTOMER_REQUESTED_RESCHEDULE"] = "CUSTOMER_REQUESTED_RESCHEDULE";
    FailedDeliveryReason["PAYMENT_ISSUE"] = "PAYMENT_ISSUE";
    FailedDeliveryReason["UNREACHABLE_LOCATION"] = "UNREACHABLE_LOCATION";
    FailedDeliveryReason["BUSINESS_CLOSED"] = "BUSINESS_CLOSED";
    FailedDeliveryReason["OTHER"] = "OTHER";
})(FailedDeliveryReason || (exports.FailedDeliveryReason = FailedDeliveryReason = {}));
class FailedDeliveryDto {
    awbNumber;
    reason;
    notes;
    photoUrl;
    latitude;
    longitude;
}
exports.FailedDeliveryDto = FailedDeliveryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Shipment AWB number',
        example: 'FX20250128000001',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FailedDeliveryDto.prototype, "awbNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for failed delivery',
        enum: FailedDeliveryReason,
        example: FailedDeliveryReason.CUSTOMER_NOT_AVAILABLE,
    }),
    (0, class_validator_1.IsEnum)(FailedDeliveryReason),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FailedDeliveryDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional notes about the failed delivery',
        example: 'Called customer multiple times, no response',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], FailedDeliveryDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Photo evidence URL',
        example: 'https://storage.example.com/failed/abc123.jpg',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FailedDeliveryDto.prototype, "photoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current latitude', example: 23.8103 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FailedDeliveryDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current longitude', example: 90.4125 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FailedDeliveryDto.prototype, "longitude", void 0);
//# sourceMappingURL=failed-delivery.dto.js.map