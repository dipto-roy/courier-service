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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const dto_1 = require("./dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
const enums_1 = require("../../common/enums");
const user_entity_1 = require("../../entities/user.entity");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(createUserDto) {
        const user = await this.usersService.create(createUserDto);
        const { password, refreshToken, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }
    async findAll(filterDto) {
        const result = await this.usersService.findAll(filterDto);
        const sanitizedData = result.data.map(user => {
            const { password, refreshToken, ...userWithoutSensitiveData } = user;
            return userWithoutSensitiveData;
        });
        return { ...result, data: sanitizedData };
    }
    async getStatistics() {
        return await this.usersService.getStatistics();
    }
    async getUsersByRole(role) {
        const result = await this.usersService.findAll({ role });
        const sanitizedData = result.data.map(user => {
            const { password, refreshToken, ...userWithoutSensitiveData } = user;
            return userWithoutSensitiveData;
        });
        return { ...result, data: sanitizedData };
    }
    async getCurrentUser(currentUser) {
        const user = await this.usersService.findOne(currentUser.id);
        const { password, refreshToken, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }
    async findOne(id) {
        const user = await this.usersService.findOne(id);
        const { password, refreshToken, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }
    async update(id, updateUserDto) {
        const user = await this.usersService.update(id, updateUserDto);
        const { password, refreshToken, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }
    async updateKYCStatus(id, kycDto) {
        const user = await this.usersService.updateKYCStatus(id, kycDto);
        const { password, refreshToken, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }
    async updateWallet(id, walletDto) {
        const user = await this.usersService.updateWallet(id, walletDto);
        const { password, refreshToken, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }
    async remove(id) {
        await this.usersService.remove(id);
    }
    async restore(id) {
        const user = await this.usersService.restore(id);
        const { password, refreshToken, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email or phone already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users with filters and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FilterUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('by-role/:role'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Get users by role' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid role' }),
    __param(0, (0, common_1.Param)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsersByRole", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MERCHANT, enums_1.UserRole.RIDER, enums_1.UserRole.HUB_STAFF, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current user profile retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.SUPPORT),
    (0, swagger_1.ApiOperation)({ summary: 'Update user information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email or phone already exists' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/kyc'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Update KYC verification status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.KYCVerificationDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateKYCStatus", null);
__decorate([
    (0, common_1.Patch)(':id/wallet'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Update user wallet balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Insufficient balance' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.WalletUpdateDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateWallet", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete user (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Restore soft deleted user (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "restore", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map