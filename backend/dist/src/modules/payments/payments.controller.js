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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const enums_1 = require("../../common/enums");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async recordCodCollection(shipmentId, req) {
        return await this.paymentsService.recordCodCollection(shipmentId, req.user.userId);
    }
    async recordDeliveryFee(shipmentId) {
        return await this.paymentsService.recordDeliveryFee(shipmentId);
    }
    async initiatePayout(initiatePayoutDto, req) {
        return await this.paymentsService.initiatePayout(initiatePayoutDto, req.user.userId);
    }
    async completePayout(transactionId, referenceNumber) {
        return await this.paymentsService.completePayout(transactionId, referenceNumber);
    }
    async failPayout(transactionId, reason) {
        return await this.paymentsService.failPayout(transactionId, reason);
    }
    async getTransactions(filterDto, req) {
        if (req.user.role === enums_1.UserRole.MERCHANT) {
            filterDto.merchantId = req.user.userId;
        }
        return await this.paymentsService.getTransactions(filterDto);
    }
    async getTransaction(transactionId) {
        return await this.paymentsService.getTransaction(transactionId);
    }
    async getPendingCollections(merchantId) {
        return await this.paymentsService.getPendingCodCollections(merchantId);
    }
    async getPendingBalance(merchantId) {
        const pendingBalance = await this.paymentsService.calculatePendingBalance(merchantId);
        return { pendingBalance };
    }
    async getMerchantStatistics(merchantId) {
        return await this.paymentsService.getMerchantStatistics(merchantId);
    }
    async getOverallStatistics() {
        return await this.paymentsService.getOverallStatistics();
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('record-cod/:shipmentId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.RIDER),
    (0, swagger_1.ApiOperation)({
        summary: 'Record COD collection',
        description: 'Record COD collection when shipment is delivered. Automatically creates transaction record.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'shipmentId',
        description: 'Shipment ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'COD collection recorded successfully',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                transactionId: 'COD-1KXYZ123-ABC456',
                userId: '123e4567-e89b-12d3-a456-426614174000',
                shipmentId: '123e4567-e89b-12d3-a456-426614174000',
                type: 'cod_collection',
                paymentMethod: 'cash',
                status: 'completed',
                amount: 5000,
                fee: 150,
                netAmount: 4850,
                description: 'COD collection for AWB: FX20250128000001',
                processedAt: '2025-01-28T10:30:00Z',
                createdAt: '2025-01-28T10:30:00Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Shipment not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid shipment status or payment method' }),
    __param(0, (0, common_1.Param)('shipmentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "recordCodCollection", null);
__decorate([
    (0, common_1.Post)('record-delivery-fee/:shipmentId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.HUB_STAFF),
    (0, swagger_1.ApiOperation)({
        summary: 'Record delivery fee',
        description: 'Record delivery fee transaction for a shipment.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'shipmentId',
        description: 'Shipment ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Delivery fee recorded successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Shipment not found' }),
    __param(0, (0, common_1.Param)('shipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "recordDeliveryFee", null);
__decorate([
    (0, common_1.Post)('initiate-payout'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({
        summary: 'Initiate payout to merchant',
        description: 'Initiate T+7 payout to merchant. Validates available balance and creates payout transaction.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Payout initiated successfully',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                transactionId: 'POUT-1KXYZ123-DEF789',
                userId: '123e4567-e89b-12d3-a456-426614174000',
                type: 'cod_payout',
                paymentMethod: 'bank_transfer',
                status: 'processing',
                amount: 15000,
                fee: 50,
                netAmount: 14950,
                description: 'Payout to merchant - T+7 settlement',
                previousBalance: 20000,
                newBalance: 5000,
                processedById: 'admin-123',
                createdAt: '2025-01-28T10:30:00Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Merchant not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Insufficient balance' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.InitiatePayoutDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initiatePayout", null);
__decorate([
    (0, common_1.Patch)('complete-payout/:transactionId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete a payout',
        description: 'Mark a payout transaction as completed after successful bank transfer.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'transactionId',
        description: 'Transaction ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Payout completed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Transaction not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid transaction type or status' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __param(1, (0, common_1.Body)('referenceNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "completePayout", null);
__decorate([
    (0, common_1.Patch)('fail-payout/:transactionId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({
        summary: 'Fail a payout',
        description: 'Mark a payout as failed and reverse wallet deduction.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'transactionId',
        description: 'Transaction ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Payout marked as failed and balance reversed',
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "failPayout", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE, enums_1.UserRole.MERCHANT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transactions with filters',
        description: 'Retrieve transactions with pagination and filters. Merchants can only see their own transactions.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Transactions retrieved successfully',
        schema: {
            example: {
                transactions: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        transactionId: 'COD-1KXYZ123-ABC456',
                        type: 'cod_collection',
                        amount: 5000,
                        status: 'completed',
                        createdAt: '2025-01-28T10:30:00Z',
                    },
                ],
                pagination: {
                    total: 150,
                    page: 1,
                    limit: 20,
                    totalPages: 8,
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PaymentFilterDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/:transactionId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE, enums_1.UserRole.MERCHANT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transaction by ID',
        description: 'Retrieve detailed transaction information.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'transactionId',
        description: 'Transaction ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Transaction details',
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Get)('pending-collections/:merchantId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE, enums_1.UserRole.MERCHANT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get pending COD collections',
        description: 'Get COD collections that are older than 7 days and pending payout.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'merchantId',
        description: 'Merchant user ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Pending collections retrieved successfully',
        schema: {
            example: [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    transactionId: 'COD-1KXYZ123-ABC456',
                    amount: 5000,
                    netAmount: 4850,
                    createdAt: '2025-01-20T10:30:00Z',
                },
            ],
        },
    }),
    __param(0, (0, common_1.Param)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPendingCollections", null);
__decorate([
    (0, common_1.Get)('pending-balance/:merchantId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE, enums_1.UserRole.MERCHANT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get pending balance for merchant',
        description: 'Calculate pending balance available for payout (T+7 eligible amount).',
    }),
    (0, swagger_1.ApiParam)({
        name: 'merchantId',
        description: 'Merchant user ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Pending balance calculated',
        schema: {
            example: {
                pendingBalance: 15750.50,
            },
        },
    }),
    __param(0, (0, common_1.Param)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPendingBalance", null);
__decorate([
    (0, common_1.Get)('statistics/merchant/:merchantId'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE, enums_1.UserRole.MERCHANT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get merchant payment statistics',
        description: 'Get comprehensive payment statistics for a specific merchant.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'merchantId',
        description: 'Merchant user ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Statistics retrieved successfully',
        schema: {
            example: {
                walletBalance: 5000,
                pendingBalance: 15750.50,
                totalCodCollected: 150000,
                totalCodTransactions: 250,
                totalDeliveryFees: 7500,
                totalPayouts: 100000,
                totalPayoutTransactions: 15,
                thisMonthCollections: 25000,
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Merchant not found' }),
    __param(0, (0, common_1.Param)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getMerchantStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/overall'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({
        summary: 'Get overall payment statistics',
        description: 'Get system-wide payment statistics (admin only).',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Overall statistics retrieved successfully',
        schema: {
            example: {
                totalCodCollected: 5000000,
                totalCodTransactions: 8500,
                totalPayouts: 3500000,
                totalPayoutTransactions: 450,
                pendingPayouts: 250000,
                pendingPayoutTransactions: 35,
                todayCollections: 75000,
                thisMonthCollections: 850000,
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getOverallStatistics", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map