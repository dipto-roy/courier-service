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
exports.FilterPickupDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const dto_1 = require("../../../common/dto");
const pickup_entity_1 = require("../../../entities/pickup.entity");
class FilterPickupDto extends dto_1.PaginationDto {
    merchantId;
    agentId;
    status;
    pickupCity;
    fromDate;
    toDate;
}
exports.FilterPickupDto = FilterPickupDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by merchant ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterPickupDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by agent ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterPickupDto.prototype, "agentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: pickup_entity_1.PickupStatus,
        description: 'Filter by pickup status',
        example: pickup_entity_1.PickupStatus.PENDING,
    }),
    (0, class_validator_1.IsEnum)(pickup_entity_1.PickupStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterPickupDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by pickup city',
        example: 'Dhaka',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterPickupDto.prototype, "pickupCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter from date (YYYY-MM-DD)',
        example: '2025-10-28',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterPickupDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter to date (YYYY-MM-DD)',
        example: '2025-10-29',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterPickupDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search by contact person or phone',
        example: 'John',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterPickupDto.prototype, "search", void 0);
//# sourceMappingURL=filter-pickup.dto.js.map