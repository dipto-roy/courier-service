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
exports.UpdateLocationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateLocationDto {
    latitude;
    longitude;
    accuracy;
    speed;
    heading;
    batteryLevel;
    shipmentAwb;
    isOnline;
}
exports.UpdateLocationDto = UpdateLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Latitude coordinate', example: 23.8103 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Longitude coordinate', example: 90.4125 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Location accuracy in meters', example: 10.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "accuracy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Speed in meters per second', example: 15.2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "speed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Heading/direction in degrees (0-360)', example: 270 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(360),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "heading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Battery level percentage (0-100)', example: 85 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateLocationDto.prototype, "batteryLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current shipment AWB being delivered', example: 'FX20250128000001' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLocationDto.prototype, "shipmentAwb", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Is rider online', example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateLocationDto.prototype, "isOnline", void 0);
//# sourceMappingURL=update-location.dto.js.map