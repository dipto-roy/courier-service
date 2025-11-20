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
exports.FilterShipmentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const dto_1 = require("../../../common/dto");
const enums_1 = require("../../../common/enums");
class FilterShipmentDto extends dto_1.PaginationDto {
    awb;
    merchantId;
    status;
    deliveryType;
    paymentMethod;
    paymentStatus;
    receiverCity;
    fromDate;
    toDate;
}
exports.FilterShipmentDto = FilterShipmentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'FX20251028', description: 'Search by AWB number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterShipmentDto.prototype, "awb", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'merchant-uuid', description: 'Filter by merchant ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterShipmentDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: enums_1.ShipmentStatus,
        example: enums_1.ShipmentStatus.PENDING,
        description: 'Filter by status',
    }),
    (0, class_validator_1.IsEnum)(enums_1.ShipmentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterShipmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: enums_1.DeliveryType,
        example: enums_1.DeliveryType.NORMAL,
        description: 'Filter by delivery type',
    }),
    (0, class_validator_1.IsEnum)(enums_1.DeliveryType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterShipmentDto.prototype, "deliveryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: enums_1.PaymentMethod,
        example: enums_1.PaymentMethod.COD,
        description: 'Filter by payment method',
    }),
    (0, class_validator_1.IsEnum)(enums_1.PaymentMethod),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterShipmentDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: enums_1.PaymentStatus,
        example: enums_1.PaymentStatus.PENDING,
        description: 'Filter by payment status',
    }),
    (0, class_validator_1.IsEnum)(enums_1.PaymentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterShipmentDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dhaka', description: 'Filter by receiver city' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterShipmentDto.prototype, "receiverCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-10-28', description: 'Filter from date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterShipmentDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-10-29', description: 'Filter to date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterShipmentDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe', description: 'Search by receiver name or phone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterShipmentDto.prototype, "search", void 0);
//# sourceMappingURL=filter-shipment.dto.js.map