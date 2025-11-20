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
exports.ReceiveManifestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ReceiveManifestDto {
    receivedAwbNumbers;
    hubLocation;
    notes;
}
exports.ReceiveManifestDto = ReceiveManifestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of shipment AWB numbers actually received (may differ from manifest)',
        example: ['FXC2025010001', 'FXC2025010002'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ReceiveManifestDto.prototype, "receivedAwbNumbers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hub location where manifest is being received',
        example: 'Chittagong Hub',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveManifestDto.prototype, "hubLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notes about condition or discrepancies',
        example: 'All shipments received in good condition',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveManifestDto.prototype, "notes", void 0);
//# sourceMappingURL=receive-manifest.dto.js.map