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
exports.CreatePickupDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePickupDto {
    pickupAddress;
    pickupCity;
    pickupArea;
    scheduledDate;
    contactPerson;
    contactPhone;
    totalShipments;
    notes;
}
exports.CreatePickupDto = CreatePickupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pickup address',
        example: '123 Main Street, Apartment 4B',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePickupDto.prototype, "pickupAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pickup city',
        example: 'Dhaka',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePickupDto.prototype, "pickupCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pickup area',
        example: 'Gulshan',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePickupDto.prototype, "pickupArea", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Scheduled pickup date (ISO 8601 format)',
        example: '2025-10-28T10:00:00Z',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePickupDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contact person name',
        example: 'John Doe',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePickupDto.prototype, "contactPerson", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contact phone number',
        example: '+8801712345678',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePickupDto.prototype, "contactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of shipments to pickup',
        example: 5,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreatePickupDto.prototype, "totalShipments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional notes or instructions',
        example: 'Please call before arrival',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePickupDto.prototype, "notes", void 0);
//# sourceMappingURL=create-pickup.dto.js.map