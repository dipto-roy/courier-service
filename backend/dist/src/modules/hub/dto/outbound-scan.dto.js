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
exports.OutboundScanDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class OutboundScanDto {
    awbNumbers;
    originHub;
    destinationHub;
    riderId;
    notes;
}
exports.OutboundScanDto = OutboundScanDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of shipment AWB numbers to scan for dispatch',
        example: ['FXC2025010001', 'FXC2025010002'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], OutboundScanDto.prototype, "awbNumbers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Origin hub location',
        example: 'Dhaka Hub',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OutboundScanDto.prototype, "originHub", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Destination hub location (for hub-to-hub transfer)',
        example: 'Chittagong Hub',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OutboundScanDto.prototype, "destinationHub", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rider ID if assigning to rider for delivery',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], OutboundScanDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional notes',
        example: 'Dispatched via regular route',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OutboundScanDto.prototype, "notes", void 0);
//# sourceMappingURL=outbound-scan.dto.js.map