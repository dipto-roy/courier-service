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
exports.PickupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pickup_service_1 = require("./pickup.service");
const dto_1 = require("./dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
const user_entity_1 = require("../../entities/user.entity");
let PickupController = class PickupController {
    pickupService;
    constructor(pickupService) {
        this.pickupService = pickupService;
    }
    async create(createPickupDto, user) {
        return this.pickupService.create(createPickupDto, user);
    }
    async findAll(filterDto, user) {
        return this.pickupService.findAll(filterDto, user);
    }
    async getStatistics(user) {
        return this.pickupService.getStatistics(user);
    }
    async getAgentTodayPickups(user) {
        return this.pickupService.getAgentTodayPickups(user);
    }
    async findOne(id, user) {
        return this.pickupService.findOne(id, user);
    }
    async update(id, updatePickupDto, user) {
        return this.pickupService.update(id, updatePickupDto, user);
    }
    async assignPickup(id, assignPickupDto) {
        return this.pickupService.assignPickup(id, assignPickupDto);
    }
    async startPickup(id, user) {
        return this.pickupService.startPickup(id, user);
    }
    async completePickup(id, completePickupDto, user) {
        return this.pickupService.completePickup(id, completePickupDto, user);
    }
    async cancelPickup(id, user) {
        return this.pickupService.cancelPickup(id, user);
    }
};
exports.PickupController = PickupController;
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Roles)(enums_1.UserRole.MERCHANT, enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new pickup request (Merchant/Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pickup created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePickupDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PickupController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MERCHANT, enums_1.UserRole.AGENT, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pickups with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pickups retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FilterPickupDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PickupController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MERCHANT, enums_1.UserRole.AGENT, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get pickup statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PickupController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('today'),
    (0, decorators_1.Roles)(enums_1.UserRole.AGENT),
    (0, swagger_1.ApiOperation)({ summary: "Get agent's assigned pickups for today" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Today pickups retrieved successfully' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PickupController.prototype, "getAgentTodayPickups", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MERCHANT, enums_1.UserRole.AGENT, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get pickup by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pickup found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pickup not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PickupController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.MERCHANT, enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update pickup (only pending pickups)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pickup updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Only pending pickups can be updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pickup not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePickupDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PickupController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Assign pickup to an agent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pickup assigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid agent or pickup status' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pickup not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AssignPickupDto]),
    __metadata("design:returntype", Promise)
], PickupController.prototype, "assignPickup", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, decorators_1.Roles)(enums_1.UserRole.AGENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Start pickup (Agent)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pickup started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Only assigned pickups can be started' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not assigned to you' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PickupController.prototype, "startPickup", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, decorators_1.Roles)(enums_1.UserRole.AGENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Complete pickup with shipment scanning (Agent)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pickup completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid shipments or pickup status' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not assigned to you' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CompletePickupDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PickupController.prototype, "completePickup", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, decorators_1.Roles)(enums_1.UserRole.MERCHANT, enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel pickup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pickup cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot cancel completed pickup' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not authorized' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PickupController.prototype, "cancelPickup", null);
exports.PickupController = PickupController = __decorate([
    (0, swagger_1.ApiTags)('Pickups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, common_1.Controller)('pickups'),
    __metadata("design:paramtypes", [pickup_service_1.PickupService])
], PickupController);
//# sourceMappingURL=pickup.controller.js.map