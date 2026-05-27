import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { Shipment } from '../../entities/shipment.entity';
import {
  ShipmentStatus,
  PaymentStatus,
  PaymentMethod,
} from '../../common/enums';
import { TransactionType } from '../../entities/transaction.entity';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let transactionRepository: any;
  let userRepository: any;
  let shipmentRepository: any;

  const mockMerchant: Partial<User> = {
    id: 'merchant-uuid-1',
    name: 'Test Merchant',
    walletBalance: 5000,
  };

  const mockShipment: Partial<Shipment> = {
    id: 'shipment-uuid-1',
    awb: 'FX1234567890',
    merchantId: 'merchant-uuid-1',
    codAmount: 1500,
    deliveryFee: 150,
    status: ShipmentStatus.DELIVERED,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.CASH,
  };

  const mockTransaction: Partial<Transaction> = {
    id: 'txn-uuid-1',
    type: TransactionType.COD_COLLECTION,
    status: PaymentStatus.COMPLETED,
    amount: 1500,
    userId: 'merchant-uuid-1',
    shipmentId: 'shipment-uuid-1',
    createdAt: new Date(),
  };

  const createQueryBuilderMock = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockTransaction]),
    getOne: jest.fn().mockResolvedValue(null),
    getCount: jest.fn().mockResolvedValue(1),
    getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
    getRawOne: jest.fn().mockResolvedValue({ total: '5000' }),
    getRawMany: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => createQueryBuilderMock),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Shipment),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    transactionRepository = module.get(getRepositoryToken(Transaction));
    userRepository = module.get(getRepositoryToken(User));
    shipmentRepository = module.get(getRepositoryToken(Shipment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordCodCollection', () => {
    it('should record COD collection for delivered shipment', async () => {
      shipmentRepository.findOne.mockResolvedValue(mockShipment);
      transactionRepository.findOne.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue(mockMerchant);
      transactionRepository.create.mockReturnValue(mockTransaction);
      transactionRepository.save.mockResolvedValue(mockTransaction);
      userRepository.save.mockResolvedValue(mockMerchant);
      shipmentRepository.save.mockResolvedValue(mockShipment);

      const result = await service.recordCodCollection(
        'shipment-uuid-1',
        'rider-uuid-1',
      );

      expect(result).toEqual(mockTransaction);
      expect(transactionRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid shipment', async () => {
      shipmentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.recordCodCollection('invalid-id', 'rider-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTransaction', () => {
    it('should return transaction by id', async () => {
      transactionRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.getTransaction('txn-uuid-1');
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException for invalid transaction', async () => {
      transactionRepository.findOne.mockResolvedValue(null);

      await expect(service.getTransaction('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('initiatePayout', () => {
    it('should initiate a payout for merchant', async () => {
      const payoutTxn = {
        ...mockTransaction,
        type: TransactionType.COD_PAYOUT,
        status: PaymentStatus.PENDING,
        amount: 5000,
      };
      userRepository.findOne.mockResolvedValue(mockMerchant);
      transactionRepository.create.mockReturnValue(payoutTxn);
      transactionRepository.save.mockResolvedValue(payoutTxn);
      // calculatePendingBalance calls getRawOne twice: collections=10000, payouts=0
      createQueryBuilderMock.getRawOne
        .mockResolvedValueOnce({ total: '10000' })
        .mockResolvedValueOnce({ total: '0' });

      const result = await service.initiatePayout(
        {
          merchantId: 'merchant-uuid-1',
          amount: 5000,
          bankDetails: { bankName: 'Test Bank', accountNumber: '1234567890' },
        } as any,
        'admin-uuid-1',
      );

      expect(result.type).toBe(TransactionType.COD_PAYOUT);
    });
  });

  describe('completePayout', () => {
    it('should complete a pending payout', async () => {
      const pendingPayout = {
        ...mockTransaction,
        type: TransactionType.COD_PAYOUT,
        status: PaymentStatus.PENDING,
      };
      const completedPayout = {
        ...pendingPayout,
        status: PaymentStatus.COMPLETED,
      };
      transactionRepository.findOne.mockResolvedValue(pendingPayout);
      transactionRepository.save.mockResolvedValue(completedPayout);
      userRepository.findOne.mockResolvedValue(mockMerchant);
      userRepository.save.mockResolvedValue(mockMerchant);

      const result = await service.completePayout('txn-uuid-1', 'REF-12345');

      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });
  });

  describe('getMerchantStatistics', () => {
    it('should return merchant financial statistics', async () => {
      userRepository.findOne.mockResolvedValue(mockMerchant);

      const result = await service.getMerchantStatistics('merchant-uuid-1');

      expect(result).toHaveProperty('walletBalance');
    });
  });

  describe('getOverallStatistics', () => {
    it('should return overall payment statistics', async () => {
      const result = await service.getOverallStatistics();

      expect(result).toBeDefined();
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      const result = await service.getTransactions({
        page: 1,
        limit: 10,
      } as any);

      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('pagination');
    });
  });
});
