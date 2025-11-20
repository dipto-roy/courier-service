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
exports.DeliveryAttemptDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class DeliveryAttemptDto {
    awbNumber;
    otpCode;
    signatureUrl;
    podPhotoUrl;
    codAmountCollected;
    deliveryNote;
    latitude;
    longitude;
}
exports.DeliveryAttemptDto = DeliveryAttemptDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shipment AWB number', example: 'FX20250128000001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeliveryAttemptDto.prototype, "awbNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer OTP for verification', example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(6),
    __metadata("design:type", String)
], DeliveryAttemptDto.prototype, "otpCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Signature image URL', example: 'https://storage.example.com/signatures/abc123.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DeliveryAttemptDto.prototype, "signatureUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'POD (Proof of Delivery) photo URL', example: 'https://storage.example.com/pod/xyz789.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DeliveryAttemptDto.prototype, "podPhotoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'COD amount collected from customer', example: 1500 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DeliveryAttemptDto.prototype, "codAmountCollected", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Delivery notes from rider', example: 'Customer requested to leave at security desk' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], DeliveryAttemptDto.prototype, "deliveryNote", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current latitude', example: 23.8103 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], DeliveryAttemptDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current longitude', example: 90.4125 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], DeliveryAttemptDto.prototype, "longitude", void 0);
//# sourceMappingURL=delivery-attempt.dto.js.map