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
exports.CompletePickupDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CompletePickupDto {
    shipmentAwbs;
    signatureUrl;
    photoUrl;
    latitude;
    longitude;
    notes;
}
exports.CompletePickupDto = CompletePickupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of shipment AWB numbers picked up',
        example: ['FX202510280001', 'FX202510280002'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CompletePickupDto.prototype, "shipmentAwbs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Signature URL (uploaded to cloud storage)',
        example: 'https://storage.example.com/signatures/pickup-12345.jpg',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CompletePickupDto.prototype, "signatureUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Photo URL (uploaded to cloud storage)',
        example: 'https://storage.example.com/photos/pickup-12345.jpg',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CompletePickupDto.prototype, "photoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'GPS Latitude',
        example: 23.8103,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CompletePickupDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'GPS Longitude',
        example: 90.4125,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CompletePickupDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional notes',
        example: 'All shipments collected successfully',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CompletePickupDto.prototype, "notes", void 0);
//# sourceMappingURL=complete-pickup.dto.js.map