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
exports.FilterManifestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const manifest_entity_1 = require("../../../entities/manifest.entity");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
class FilterManifestDto extends pagination_dto_1.PaginationDto {
    status;
    originHub;
    destinationHub;
    riderId;
    fromDate;
    toDate;
}
exports.FilterManifestDto = FilterManifestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by manifest status',
        enum: manifest_entity_1.ManifestStatus,
        example: manifest_entity_1.ManifestStatus.IN_TRANSIT,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(manifest_entity_1.ManifestStatus),
    __metadata("design:type", String)
], FilterManifestDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by origin hub',
        example: 'Dhaka Hub',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterManifestDto.prototype, "originHub", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by destination hub',
        example: 'Chittagong Hub',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterManifestDto.prototype, "destinationHub", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by rider ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterManifestDto.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter from dispatch date (ISO 8601)',
        example: '2025-01-01',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FilterManifestDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter to dispatch date (ISO 8601)',
        example: '2025-01-31',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FilterManifestDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search by manifest number',
        example: 'MF2025010001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterManifestDto.prototype, "search", void 0);
//# sourceMappingURL=filter-manifest.dto.js.map