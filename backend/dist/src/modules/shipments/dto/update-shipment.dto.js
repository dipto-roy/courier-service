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
exports.UpdateShipmentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../../../common/enums");
class UpdateAddressDto {
    name;
    phone;
    email;
    city;
    area;
    address;
    latitude;
    longitude;
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '01712345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john@example.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dhaka' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Gulshan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "area", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'House 12, Road 5' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 23.7808875 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAddressDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 90.4161712 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAddressDto.prototype, "longitude", void 0);
class UpdateShipmentDto {
    sender;
    receiver;
    deliveryType;
    weight;
    productCategory;
    productDescription;
    declaredValue;
    paymentMethod;
    codAmount;
    specialInstructions;
}
exports.UpdateShipmentDto = UpdateShipmentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: UpdateAddressDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateAddressDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", UpdateAddressDto)
], UpdateShipmentDto.prototype, "sender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: UpdateAddressDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UpdateAddressDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", UpdateAddressDto)
], UpdateShipmentDto.prototype, "receiver", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enums_1.DeliveryType }),
    (0, class_validator_1.IsEnum)(enums_1.DeliveryType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateShipmentDto.prototype, "deliveryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateShipmentDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Electronics' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateShipmentDto.prototype, "productCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Samsung Galaxy Phone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateShipmentDto.prototype, "productDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateShipmentDto.prototype, "declaredValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enums_1.PaymentMethod }),
    (0, class_validator_1.IsEnum)(enums_1.PaymentMethod),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateShipmentDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2500 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateShipmentDto.prototype, "codAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Handle with care' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateShipmentDto.prototype, "specialInstructions", void 0);
//# sourceMappingURL=update-shipment.dto.js.map