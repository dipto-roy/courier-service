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
exports.KYCVerificationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class KYCVerificationDto {
    isKYCVerified;
    kycRemarks;
}
exports.KYCVerificationDto = KYCVerificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'KYC verification status' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Boolean)
], KYCVerificationDto.prototype, "isKYCVerified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'KYC documents verified successfully', description: 'Verification remarks' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], KYCVerificationDto.prototype, "kycRemarks", void 0);
//# sourceMappingURL=kyc-verification.dto.js.map