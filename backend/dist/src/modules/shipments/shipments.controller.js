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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shipments_service_1 = require("./shipments.service");
const dto_1 = require("./dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
const entities_1 = require("../../entities");
let ShipmentsController = class ShipmentsController {
    shipmentsService;
    constructor(shipmentsService) {
        this.shipmentsService = shipmentsService;
    }
    async create(createShipmentDto, user) {
        return await this.shipmentsService.create(createShipmentDto, user);
    }
    async findAll(filterDto, user) {
        return await this.shipmentsService.findAll(filterDto, user);
    }
    async getStatistics(user) {
        return await this.shipmentsService.getStatistics(user);
    }
    async getShipmentsByStatus(status, user) {
        return await this.shipmentsService.findAll({ status }, user);
    }
    async trackByAWB(awb) {
        return await this.shipmentsService.findByAWB(awb);
    }
    async findOne(id, user) {
        return await this.shipmentsService.findOne(id, user);
    }
    async update(id, updateShipmentDto, user) {
        return await this.shipmentsService.update(id, updateShipmentDto, user);
    }
    async updateStatus(id, updateStatusDto, user) {
        return await this.shipmentsService.updateStatus(id, updateStatusDto, user);
    }
    async remove(id, user) {
        await this.shipmentsService.remove(id, user);
    }
    async bulkUpload(csvData, user) {
        return await this.shipmentsService.bulkUpload(csvData, user);
    }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Roles)(enums_1.UserRole.MERCHANT, enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new shipment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Shipment created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateShipmentDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MERCHANT, enums_1.UserRole.SUPPORT, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get all shipments with filters and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipments retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FilterShipmentDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MERCHANT, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipment statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistics retrieved successfully',
    }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.User]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('by-status/:status'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MERCHANT, enums_1.UserRole.SUPPORT, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipments by status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipments retrieved successfully' }),
    __param(0, (0, common_1.Param)('status')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "getShipmentsByStatus", null);
__decorate([
    (0, common_1.Get)('track/:awb'),
    (0, decorators_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Track shipment by AWB (public endpoint)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipment found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    __param(0, (0, common_1.Param)('awb')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "trackByAWB", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MERCHANT, enums_1.UserRole.SUPPORT, enums_1.UserRole.HUB_STAFF, enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipment by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipment found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.MERCHANT, enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update shipment information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipment updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot update after pickup' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateShipmentDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF, enums_1.UserRole.AGENT, enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({ summary: 'Update shipment status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateStatusDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.MERCHANT, enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete shipment (only if PENDING)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Shipment deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete after pickup' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('bulk-upload'),
    (0, decorators_1.Roles)(enums_1.UserRole.MERCHANT, enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk upload shipments from CSV',
        description: `Upload multiple shipments at once using CSV format.
    
    **CSV Format:**
    - Header: receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType
    - Each row represents one shipment
    - Sender information is automatically taken from the logged-in merchant
    
    **Example CSV:**
    \`\`\`
    receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType
    Jane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal
    Michael Johnson,01687654321,Chittagong,Nasirabad,Building 10 Block A,1.2,1500,express
    \`\`\`
    
    **Response includes:**
    - Total rows processed
    - Success/failure counts
    - Error details for failed rows
    - AWB numbers for successful shipments`,
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['csvData'],
            properties: {
                csvData: {
                    type: 'string',
                    description: 'CSV data as a string with header and data rows separated by newlines',
                    example: 'receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType\nJane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal\nMichael Johnson,01687654321,Chittagong,Nasirabad,Building 10 Block A,1.2,1500,express',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Bulk upload completed with results',
        schema: {
            type: 'object',
            properties: {
                totalRows: {
                    type: 'number',
                    example: 2,
                    description: 'Total number of rows processed (excluding header)',
                },
                successCount: {
                    type: 'number',
                    example: 2,
                    description: 'Number of successfully created shipments',
                },
                failedCount: {
                    type: 'number',
                    example: 0,
                    description: 'Number of failed shipments',
                },
                errors: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            row: { type: 'number', example: 2 },
                            error: { type: 'string', example: 'Invalid phone number' },
                        },
                    },
                    description: 'List of errors for failed rows',
                },
                shipments: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            awb: { type: 'string', example: 'FX20251028929833' },
                            receiverName: { type: 'string', example: 'Jane Smith' },
                            receiverPhone: { type: 'string', example: '01798765432' },
                        },
                    },
                    description: 'List of successfully created shipments',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid CSV format or missing data',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Only merchants and admins can bulk upload',
    }),
    __param(0, (0, common_1.Body)('csvData')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "bulkUpload", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, swagger_1.ApiTags)('Shipments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, common_1.Controller)('shipments'),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map