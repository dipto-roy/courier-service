import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Transaction, TransactionType } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { Shipment } from '../../entities/shipment.entity';
import { PaymentStatus, PaymentMethod, ShipmentStatus } from '../../common/enums';
import { InitiatePayoutDto, PaymentFilterDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
  ) {}

  /**
   * Record COD collection when shipment is delivered
   */
  async recordCodCollection(shipmentId: string, riderId: string): Promise<Transaction> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['merchant'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    if (shipment.status !== ShipmentStatus.DELIVERED) {
      throw new BadRequestException('Can only record COD for delivered shipments');
    }

    if (shipment.paymentMethod !== PaymentMethod.CASH) {
      throw new BadRequestException('Shipment is not COD');
    }

    // Check if already recorded
    const existingTransaction = await this.transactionRepository.findOne({
      where: {
        shipmentId,
        type: TransactionType.COD_COLLECTION,
      },
    });

    if (existingTransaction) {
      throw new BadRequestException('COD collection already recorded for this shipment');
    }

    const transactionId = this.generateTransactionId('COD');
    const codAmount = shipment.codAmount || 0;
    const deliveryFee = shipment.deliveryFee || 0;
    const netAmount = codAmount - deliveryFee;

    const transaction = this.transactionRepository.create({
      transactionId,
      userId: shipment.merchantId,
      shipmentId: shipment.id,
      type: TransactionType.COD_COLLECTION,
      paymentMethod: PaymentMethod.CASH,
      status: PaymentStatus.COMPLETED,
      amount: codAmount,
      fee: deliveryFee,
      netAmount,
      description: `COD collection for AWB: ${shipment.awb}`,
      processedAt: new Date(),
      processedById: riderId,
    });

    return await this.transactionRepository.save(transaction);
  }

  /**
   * Record delivery fee charge
   */
  async recordDeliveryFee(shipmentId: string): Promise<Transaction> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    // Check if already recorded
    const existingTransaction = await this.transactionRepository.findOne({
      where: {
        shipmentId,
        type: TransactionType.DELIVERY_FEE,
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
      type: TransactionType.DELIVERY_FEE,
      paymentMethod: shipment.paymentMethod,
      status: PaymentStatus.COMPLETED,
      amount: deliveryFee,
      fee: 0,
      netAmount: deliveryFee,
      description: `Delivery fee for AWB: ${shipment.awb}`,
      processedAt: new Date(),
    });

    return await this.transactionRepository.save(transaction);
  }

  /**
   * Initiate payout to merchant (T+7 settlement)
   */
  async initiatePayout(initiatePayoutDto: InitiatePayoutDto, adminId: string): Promise<Transaction> {
    const { merchantId, amount, paymentMethod, description, referenceNumber } = initiatePayoutDto;

    const merchant = await this.userRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Validate merchant has sufficient pending balance
    const pendingBalance = await this.calculatePendingBalance(merchantId);
    
    if (amount > pendingBalance) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${pendingBalance}, Requested: ${amount}`,
      );
    }

    const transactionId = this.generateTransactionId('POUT');
    const payoutFee = this.calculatePayoutFee(amount, paymentMethod || PaymentMethod.BANK_TRANSFER);
    const netAmount = amount - payoutFee;

    const transaction = this.transactionRepository.create({
      transactionId,
      userId: merchantId,
      type: TransactionType.COD_PAYOUT,
      paymentMethod: paymentMethod || PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.PROCESSING,
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

    // Update merchant wallet balance
    merchant.walletBalance = (merchant.walletBalance || 0) - amount;
    await this.userRepository.save(merchant);

    return savedTransaction;
  }

  /**
   * Complete a payout transaction
   */
  async completePayout(transactionId: string, referenceNumber?: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.type !== TransactionType.COD_PAYOUT) {
      throw new BadRequestException('Transaction is not a payout');
    }

    if (transaction.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payout already completed');
    }

    transaction.status = PaymentStatus.COMPLETED;
    transaction.processedAt = new Date();
    
    if (referenceNumber) {
      transaction.referenceNumber = referenceNumber;
    }

    return await this.transactionRepository.save(transaction);
  }

  /**
   * Fail a payout transaction and reverse wallet deduction
   */
  async failPayout(transactionId: string, reason: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.type !== TransactionType.COD_PAYOUT) {
      throw new BadRequestException('Transaction is not a payout');
    }

    if (transaction.status === PaymentStatus.FAILED) {
      throw new BadRequestException('Payout already marked as failed');
    }

    transaction.status = PaymentStatus.FAILED;
    transaction.description = `${transaction.description} - Failed: ${reason}`;

    // Reverse wallet deduction
    const merchant = transaction.user;
    merchant.walletBalance = (merchant.walletBalance || 0) + transaction.amount;
    await this.userRepository.save(merchant);

    return await this.transactionRepository.save(transaction);
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user', 'processedBy'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Get transactions with filters
   */
  async getTransactions(filterDto: PaymentFilterDto) {
    const {
      merchantId,
      type,
      status,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filterDto;

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
    } else if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate });
    } else if (endDate) {
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

  /**
   * Get pending COD collections (for T+7 calculation)
   */
  async getPendingCodCollections(merchantId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const collections = await this.transactionRepository.find({
      where: {
        userId: merchantId,
        type: TransactionType.COD_COLLECTION,
        status: PaymentStatus.COMPLETED,
        createdAt: LessThanOrEqual(sevenDaysAgo),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Check which ones haven't been paid out yet
    const pendingCollections: Transaction[] = [];
    
    for (const collection of collections) {
      const payout = await this.transactionRepository.findOne({
        where: {
          userId: merchantId,
          type: TransactionType.COD_PAYOUT,
          shipmentId: collection.shipmentId,
        },
      });

      if (!payout) {
        pendingCollections.push(collection);
      }
    }

    return pendingCollections;
  }

  /**
   * Calculate pending balance for merchant (ready for payout)
   */
  async calculatePendingBalance(merchantId: string): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all COD collections older than 7 days
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.netAmount)', 'total')
      .where('transaction.userId = :merchantId', { merchantId })
      .andWhere('transaction.type = :type', { type: TransactionType.COD_COLLECTION })
      .andWhere('transaction.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('transaction.createdAt <= :sevenDaysAgo', { sevenDaysAgo })
      .getRawOne();

    const totalCollections = parseFloat(result?.total || '0');

    // Subtract already paid out amounts
    const payoutsResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :merchantId', { merchantId })
      .andWhere('transaction.type = :type', { type: TransactionType.COD_PAYOUT })
      .andWhere('transaction.status IN (:...statuses)', {
        statuses: [PaymentStatus.COMPLETED, PaymentStatus.PROCESSING],
      })
      .getRawOne();

    const totalPayouts = parseFloat(payoutsResult?.total || '0');

    return totalCollections - totalPayouts;
  }

  /**
   * Get payment statistics for merchant
   */
  async getMerchantStatistics(merchantId: string) {
    const merchant = await this.userRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Total COD collected
    const codResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('transaction.userId = :merchantId', { merchantId })
      .andWhere('transaction.type = :type', { type: TransactionType.COD_COLLECTION })
      .andWhere('transaction.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    // Total delivery fees
    const feesResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.fee)', 'total')
      .where('transaction.userId = :merchantId', { merchantId })
      .andWhere('transaction.type = :type', { type: TransactionType.COD_COLLECTION })
      .getRawOne();

    // Total payouts
    const payoutsResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('transaction.userId = :merchantId', { merchantId })
      .andWhere('transaction.type = :type', { type: TransactionType.COD_PAYOUT })
      .andWhere('transaction.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    // Pending balance
    const pendingBalance = await this.calculatePendingBalance(merchantId);

    // This month's collections
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.netAmount)', 'total')
      .where('transaction.userId = :merchantId', { merchantId })
      .andWhere('transaction.type = :type', { type: TransactionType.COD_COLLECTION })
      .andWhere('transaction.status = :status', { status: PaymentStatus.COMPLETED })
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

  /**
   * Get overall payment statistics (for admin)
   */
  async getOverallStatistics() {
    // Total COD collections
    const codResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('transaction.type = :type', { type: TransactionType.COD_COLLECTION })
      .andWhere('transaction.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    // Total payouts
    const payoutsResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('transaction.type = :type', { type: TransactionType.COD_PAYOUT })
      .andWhere('transaction.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    // Pending payouts
    const pendingPayoutsResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('transaction.type = :type', { type: TransactionType.COD_PAYOUT })
      .andWhere('transaction.status = :status', { status: PaymentStatus.PROCESSING })
      .getRawOne();

    // Today's collections
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.type = :type', { type: TransactionType.COD_COLLECTION })
      .andWhere('transaction.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('transaction.createdAt >= :startOfDay', { startOfDay })
      .getRawOne();

    // This month's collections
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.type = :type', { type: TransactionType.COD_COLLECTION })
      .andWhere('transaction.status = :status', { status: PaymentStatus.COMPLETED })
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

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(prefix: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Calculate payout fee based on amount and method
   */
  private calculatePayoutFee(amount: number, method: PaymentMethod): number {
    // Example fee structure
    switch (method) {
      case PaymentMethod.BANK_TRANSFER:
        return Math.min(amount * 0.01, 50); // 1% or max 50 BDT
      case PaymentMethod.MOBILE_BANKING:
        return amount * 0.015; // 1.5%
      case PaymentMethod.CASH:
        return 0;
      default:
        return 0;
    }
  }
}
