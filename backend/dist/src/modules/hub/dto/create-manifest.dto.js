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
exports.CreateManifestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateManifestDto {
    originHub;
    destinationHub;
    awbNumbers;
    riderId;
    notes;
}
exports.CreateManifestDto = CreateManifestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Origin hub location',
        example: 'Dhaka Hub',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateManifestDto.prototype, "originHub", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Destination hub location',
        example: 'Chittagong Hub',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateManifestDto.prototype, "destinationHub", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of shipment AWB numbers to include in manifest',
        example: ['FXC2025010001', 'FXC2025010002', 'FXC2025010003'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateManifestDto.prototype, "awbNumbers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider ID if assigning to rider for transport',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateManifestDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional notes for the manifest',
        example: 'Express delivery batch',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateManifestDto.prototype, "notes", void 0);
//# sourceMappingURL=create-manifest.dto.js.map