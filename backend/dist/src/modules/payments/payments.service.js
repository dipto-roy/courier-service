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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../entities/transaction.entity");
const user_entity_1 = require("../../entities/user.entity");
const shipment_entity_1 = require("../../entities/shipment.entity");
const enums_1 = require("../../common/enums");
let PaymentsService = class PaymentsService {
    transactionRepository;
    userRepository;
    shipmentRepository;
    constructor(transactionRepository, userRepository, shipmentRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.shipmentRepository = shipmentRepository;
    }
    async recordCodCollection(shipmentId, riderId) {
        const shipment = await this.shipmentRepository.findOne({
            where: { id: shipmentId },
            relations: ['merchant'],
        });
        if (!shipment) {
            throw new common_1.NotFoundException('Shipment not found');
        }
        if (shipment.status !== enums_1.ShipmentStatus.DELIVERED) {
            throw new common_1.BadRequestException('Can only record COD for delivered shipments');
        }
        if (shipment.paymentMethod !== enums_1.PaymentMethod.CASH) {
            throw new common_1.BadRequestException('Shipment is not COD');
        }
        const existingTransaction = await this.transactionRepository.findOne({
            where: {
                shipmentId,
                type: transaction_entity_1.TransactionType.COD_COLLECTION,
            },
        });
        if (existingTransaction) {
            throw new common_1.BadRequestException('COD collection already recorded for this shipment');
        }
        const transactionId = this.generateTransactionId('COD');
        const codAmount = shipment.codAmount || 0;
        const deliveryFee = shipment.deliveryFee || 0;
        const netAmount = codAmount - deliveryFee;
        const transaction = this.transactionRepository.create({
            transactionId,
            userId: shipment.merchantId,
            shipmentId: shipment.id,
            type: transaction_entity_1.TransactionType.COD_COLLECTION,
            paymentMethod: enums_1.PaymentMethod.CASH,
            status: enums_1.PaymentStatus.COMPLETED,
            amount: codAmount,
            fee: deliveryFee,
            netAmount,
            description: `COD collection for AWB: ${shipment.awb}`,
            processedAt: new Date(),
            processedById: riderId,
        });
        return await this.transactionRepository.save(transaction);
    }
    async recordDeliveryFee(shipmentId) {
        const shipment = await this.shipmentRepository.findOne({
            where: { id: shipmentId },
        });
        if (!shipment) {
            throw new common_1.NotFoundException('Shipment not found');
        }
        const existingTransaction = await this.transactionRepository.findOne({
            where: {
                shipmentId,
                type: transaction_entity_1.TransactionType.DELIVERY_FEE,
            },
        });
        if (existingTransaction) {
            return existingTransaction;
        }
        const transactionId = this.generateTransactionId('DFEE');
        const deliveryFee = shipment.deliveryFee || 0;
        const transaction = this.transactionRepository.create({
            transactionId,
            userId: shipment.merchantId,
            shipmentId: shipment.id,
            type: transaction_entity_1.TransactionType.DELIVERY_FEE,
            paymentMethod: shipment.paymentMethod,
            status: enums_1.PaymentStatus.COMPLETED,
            amount: deliveryFee,
            fee: 0,
            netAmount: deliveryFee,
            description: `Delivery fee for AWB: ${shipment.awb}`,
            processedAt: new Date(),
        });
        return await this.transactionRepository.save(transaction);
    }
    async initiatePayout(initiatePayoutDto, adminId) {
        const { merchantId, amount, paymentMethod, description, referenceNumber } = initiatePayoutDto;
        const merchant = await this.userRepository.findOne({
            where: { id: merchantId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        const pendingBalance = await this.calculatePendingBalance(merchantId);
        if (amount > pendingBalance) {
            throw new common_1.BadRequestException(`Insufficient balance. Available: ${pendingBalance}, Requested: ${amount}`);
        }
        const transactionId = this.generateTransactionId('POUT');
        const payoutFee = this.calculatePayoutFee(amount, paymentMethod || enums_1.PaymentMethod.BANK_TRANSFER);
        const netAmount = amount - payoutFee;
        const transaction = this.transactionRepository.create({
            transactionId,
            userId: merchantId,
            type: transaction_entity_1.TransactionType.COD_PAYOUT,
            paymentMethod: paymentMethod || enums_1.PaymentMethod.BANK_TRANSFER,
            status: enums_1.PaymentStatus.PROCESSING,
            amount,
            fee: payoutFee,
            netAmount,
            description: description || `Payout to merchant - T+7 settlement`,
            referenceNumber,
            processedById: adminId,
            previousBalance: merchant.walletBalance,
            newBalance: merchant.walletBalance - amount,
        });
        const savedTransaction = await this.transactionRepository.save(transaction);
        merchant.walletBalance = (merchant.walletBalance || 0) - amount;
        await this.userRepository.save(merchant);
        return savedTransaction;
    }
    async completePayout(transactionId, referenceNumber) {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.type !== transaction_entity_1.TransactionType.COD_PAYOUT) {
            throw new common_1.BadRequestException('Transaction is not a payout');
        }
        if (transaction.status === enums_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Payout already completed');
        }
        transaction.status = enums_1.PaymentStatus.COMPLETED;
        transaction.processedAt = new Date();
        if (referenceNumber) {
            transaction.referenceNumber = referenceNumber;
        }
        return await this.transactionRepository.save(transaction);
    }
    async failPayout(transactionId, reason) {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
            relations: ['user'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.type !== transaction_entity_1.TransactionType.COD_PAYOUT) {
            throw new common_1.BadRequestException('Transaction is not a payout');
        }
        if (transaction.status === enums_1.PaymentStatus.FAILED) {
            throw new common_1.BadRequestException('Payout already marked as failed');
        }
        transaction.status = enums_1.PaymentStatus.FAILED;
        transaction.description = `${transaction.description} - Failed: ${reason}`;
        const merchant = transaction.user;
        merchant.walletBalance = (merchant.walletBalance || 0) + transaction.amount;
        await this.userRepository.save(merchant);
        return await this.transactionRepository.save(transaction);
    }
    async getTransaction(transactionId) {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
            relations: ['user', 'processedBy'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async getTransactions(filterDto) {
        const { merchantId, type, status, paymentMethod, startDate, endDate, page = 1, limit = 20, } = filterDto;
        const queryBuilder = this.transactionRepository
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.user', 'user')
            .leftJoinAndSelect('transaction.processedBy', 'processedBy');
        if (merchantId) {
            queryBuilder.andWhere('transaction.userId = :merchantId', { merchantId });
        }
        if (type) {
            queryBuilder.andWhere('transaction.type = :type', { type });
        }
        if (status) {
            queryBuilder.andWhere('transaction.status = :status', { status });
        }
        if (paymentMethod) {
            queryBuilder.andWhere('transaction.paymentMethod = :paymentMethod', { paymentMethod });
        }
        if (startDate && endDate) {
            queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        else if (startDate) {
            queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate });
        }
        else if (endDate) {
            queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
        }
        queryBuilder
            .orderBy('transaction.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const [transactions, total] = await queryBuilder.getManyAndCount();
        return {
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPendingCodCollections(merchantId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const collections = await this.transactionRepository.find({
            where: {
                userId: merchantId,
                type: transaction_entity_1.TransactionType.COD_COLLECTION,
                status: enums_1.PaymentStatus.COMPLETED,
                createdAt: (0, typeorm_2.LessThanOrEqual)(sevenDaysAgo),
            },
            order: {
                createdAt: 'DESC',
            },
        });
        const pendingCollections = [];
        for (const collection of collections) {
            const payout = await this.transactionRepository.findOne({
                where: {
                    userId: merchantId,
                    type: transaction_entity_1.TransactionType.COD_PAYOUT,
                    shipmentId: collection.shipmentId,
                },
            });
            if (!payout) {
                pendingCollections.push(collection);
            }
        }
        return pendingCollections;
    }
    async calculatePendingBalance(merchantId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const result = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.netAmount)', 'total')
            .where('transaction.userId = :merchantId', { merchantId })
            .andWhere('transaction.type = :type', { type: transaction_entity_1.TransactionType.COD_COLLECTION })
            .andWhere('transaction.status = :status', { status: enums_1.PaymentStatus.COMPLETED })
            .andWhere('transaction.createdAt <= :sevenDaysAgo', { sevenDaysAgo })
            .getRawOne();
        const totalCollections = parseFloat(result?.total || '0');
        const payoutsResult = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .where('transaction.userId = :merchantId', { merchantId })
            .andWhere('transaction.type = :type', { type: transaction_entity_1.TransactionType.COD_PAYOUT })
            .andWhere('transaction.status IN (:...statuses)', {
            statuses: [enums_1.PaymentStatus.COMPLETED, enums_1.PaymentStatus.PROCESSING],
        })
            .getRawOne();
        const totalPayouts = parseFloat(payoutsResult?.total || '0');
        return totalCollections - totalPayouts;
    }
    async getMerchantStatistics(merchantId) {
        const merchant = await this.userRepository.findOne({
            where: { id: merchantId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        const codResult = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .addSelect('COUNT(*)', 'count')
            .where('transaction.userId = :merchantId', { merchantId })
            .andWhere('transaction.type = :type', { type: transaction_entity_1.TransactionType.COD_COLLECTION })
            .andWhere('transaction.status = :status', { status: enums_1.PaymentStatus.COMPLETED })
            .getRawOne();
        const feesResult = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.fee)', 'total')
            .where('transaction.userId = :merchantId', { merchantId })
            .andWhere('transaction.type = :type', { type: transaction_entity_1.TransactionType.COD_COLLECTION })
            .getRawOne();
        const payoutsResult = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .addSelect('COUNT(*)', 'count')
            .where('transaction.userId = :merchantId', { merchantId })
            .andWhere('transaction.type = :type', { type: transaction_entity_1.TransactionType.COD_PAYOUT })
            .andWhere('transaction.status = :status', { status: enums_1.PaymentStatus.COMPLETED })
            .getRawOne();
        const pendingBalance = await this.calculatePendingBalance(merchantId);
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthResult = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.netAmount)', 'total')
            .where('transaction.userId = :merchantId', { merchantId })
            .andWhere('transaction.type = :type', { type: transaction_entity_1.TransactionType.COD_COLLECTION })
            .andWhere('transaction.status = :status', { status: enums_1.PaymentStatus.COMPLETED })
            .andWhere('transaction.createdAt >= :startOfMonth', { startOfMonth })
            .getRawOne();
        return {
            walletBalance: merchant.walletBalance || 0,
            pendingBalance,
            totalCodCollected: parseFloat(codResult?.total || '0'),
            totalCodTransactions: parseInt(codResult?.count || '0'),
            totalDeliveryFees: parseFloat(feesResult?.total || '0'),
            totalPayouts: parseFloat(payoutsResult?.total || '0'),
            totalPayoutTransactions: parseInt(payoutsResult?.count || '0'),
            thisMonthCollections: parseFloat(monthResult?.total || '0'),
        };
    }
    async getOverallStatistics() {
        const codResult = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .addSelect('COUNT(*)', 'count')
            .where('transaction.type = :type', { type: transaction_entity_1.TransactionType.COD_COLLECTION })
            .andWhere('transaction.status = :status', { status: enums_1.PaymentStatus.COMPLETED })
            .getRawOne();
        const payoutsResult = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .addSelect('COUNT(*)', 'count')
            .where('transaction.type = :type', { type: transaction_entity_1.TransactionType.COD_PAYOUT })
            .andWhere('transaction.status = :status', { status: enums_1.PaymentStatus.COMPLETED })
            .getRawOne();
        const pendingPayoutsResult = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .addSelect('COUNT(*)', 'count')
            .where('transaction.type = :type', { type: transaction_entity_1.TransactionType.COD_PAYOUT })
            .andWhere('transaction.status = :status', { status: enums_1.PaymentStatus.PROCESSING })
            .getRawOne();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todayResult = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .where('transaction.type = :type', { type: transaction_entity_1.TransactionType.COD_COLLECTION })
            .andWhere('transaction.status = :status', { status: enums_1.PaymentStatus.COMPLETED })
            .andWhere('transaction.createdAt >= :startOfDay', { startOfDay })
            .getRawOne();
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthResult = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .where('transaction.type = :type', { type: transaction_entity_1.TransactionType.COD_COLLECTION })
            .andWhere('transaction.status = :status', { status: enums_1.PaymentStatus.COMPLETED })
            .andWhere('transaction.createdAt >= :startOfMonth', { startOfMonth })
            .getRawOne();
        return {
            totalCodCollected: parseFloat(codResult?.total || '0'),
            totalCodTransactions: parseInt(codResult?.count || '0'),
            totalPayouts: parseFloat(payoutsResult?.total || '0'),
            totalPayoutTransactions: parseInt(payoutsResult?.count || '0'),
            pendingPayouts: parseFloat(pendingPayoutsResult?.total || '0'),
            pendingPayoutTransactions: parseInt(pendingPayoutsResult?.count || '0'),
            todayCollections: parseFloat(todayResult?.total || '0'),
            thisMonthCollections: parseFloat(monthResult?.total || '0'),
        };
    }
    generateTransactionId(prefix) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
    calculatePayoutFee(amount, method) {
        switch (method) {
            case enums_1.PaymentMethod.BANK_TRANSFER:
                return Math.min(amount * 0.01, 50);
            case enums_1.PaymentMethod.MOBILE_BANKING:
                return amount * 0.015;
            case enums_1.PaymentMethod.CASH:
                return 0;
            default:
                return 0;
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(shipment_entity_1.Shipment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map