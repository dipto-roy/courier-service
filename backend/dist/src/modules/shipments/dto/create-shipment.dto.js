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
exports.CreateShipmentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../../../common/enums");
class AddressDto {
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
    (0, swagger_1.ApiProperty)({ example: 'John Doe', description: 'Full name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddressDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01712345678', description: 'Phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddressDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john@example.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddressDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Dhaka', description: 'City name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gulshan', description: 'Area name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddressDto.prototype, "area", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'House 12, Road 5', description: 'Full address' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddressDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 23.7808875,
        description: 'Latitude coordinate',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AddressDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 90.4161712,
        description: 'Longitude coordinate',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AddressDto.prototype, "longitude", void 0);
class CreateShipmentDto {
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
    merchantInvoice;
}
exports.CreateShipmentDto = CreateShipmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: AddressDto, description: 'Sender information' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", AddressDto)
], CreateShipmentDto.prototype, "sender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AddressDto, description: 'Receiver information' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", AddressDto)
], CreateShipmentDto.prototype, "receiver", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: enums_1.DeliveryType,
        example: enums_1.DeliveryType.NORMAL,
        description: 'Delivery type',
    }),
    (0, class_validator_1.IsEnum)(enums_1.DeliveryType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "deliveryType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1.5,
        description: 'Package weight in kg (0.1 - 50)',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateShipmentDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Electronics',
        description: 'Product category',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "productCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Samsung Galaxy Phone',
        description: 'Product description',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "productDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 5000,
        description: 'Declared value of product',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateShipmentDto.prototype, "declaredValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: enums_1.PaymentMethod,
        example: enums_1.PaymentMethod.COD,
        description: 'Payment method',
    }),
    (0, class_validator_1.IsEnum)(enums_1.PaymentMethod),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 2500,
        description: 'COD amount to collect',
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateShipmentDto.prototype, "codAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Handle with care',
        description: 'Special instructions',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "specialInstructions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'INV-12345',
        description: 'Merchant invoice number',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "merchantInvoice", void 0);
//# sourceMappingURL=create-shipment.dto.js.map