import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { Transaction } from '../../entities/transaction.entity';
import { PaymentsService } from '../payments/payments.service';
import { PaymentStatus } from '../../common/enums';
import { ReportFilterDto, ReportPeriod } from './dto/report-filter.dto';
import { ApprovePayoutDto } from './dto/approve-payout.dto';

const mockTransaction: Partial<Transaction> = {
  id: 'txn-uuid-1',
  amount: 1500,
  status: PaymentStatus.PENDING,
  createdAt: new Date(),
};

describe('FinanceService', () => {
  let service: FinanceService;
  let transactionRepository: { find: jest.Mock };
  let paymentsService: jest.Mocked<
    Pick<PaymentsService, 'getTransactions' | 'getOverallStatistics' | 'completePayout' | 'failPayout'>
  >;

  beforeEach(async () => {
    transactionRepository = {
      find: jest.fn().mockResolvedValue([mockTransaction]),
    };

    paymentsService = {
      getTransactions: jest.fn().mockResolvedValue({ data: [mockTransaction], total: 1 }),
      getOverallStatistics: jest.fn().mockResolvedValue({ total: 1, totalAmount: 1500 }),
      completePayout: jest.fn().mockResolvedValue({ ...mockTransaction, status: PaymentStatus.COMPLETED }),
      failPayout: jest.fn().mockResolvedValue({ ...mockTransaction, status: PaymentStatus.FAILED }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: getRepositoryToken(Transaction), useValue: transactionRepository },
        { provide: PaymentsService, useValue: paymentsService },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  describe('getReport', () => {
    it('returns report with totals for daily period', async () => {
      const filter: ReportFilterDto = { period: ReportPeriod.DAILY };
      const result = await service.getReport(filter);

      expect(transactionRepository.find).toHaveBeenCalled();
      expect(result.totals.count).toBe(1);
      expect(result.totals.amount).toBe(1500);
      expect(result.period).toBe(ReportPeriod.DAILY);
    });

    it('returns report with totals for weekly period', async () => {
      const filter: ReportFilterDto = { period: ReportPeriod.WEEKLY };
      const result = await service.getReport(filter);
      expect(result.period).toBe(ReportPeriod.WEEKLY);
    });

    it('uses provided startDate and endDate', async () => {
      const filter: ReportFilterDto = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };
      const result = await service.getReport(filter);
      expect(result.start).toEqual(new Date('2025-01-01'));
      expect(result.end).toEqual(new Date('2025-01-31'));
    });

    it('returns zero totals when no transactions', async () => {
      transactionRepository.find.mockResolvedValueOnce([]);
      const result = await service.getReport({});
      expect(result.totals).toEqual({ count: 0, amount: 0 });
    });
  });

  describe('getPendingPayouts', () => {
    it('calls paymentsService with PENDING status', async () => {
      await service.getPendingPayouts();
      expect(paymentsService.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({ status: PaymentStatus.PENDING }),
      );
    });
  });

  describe('approvePayout', () => {
    it('calls completePayout with reference number', async () => {
      const dto: ApprovePayoutDto = { referenceNumber: 'REF-001' };
      await service.approvePayout('txn-uuid-1', dto);
      expect(paymentsService.completePayout).toHaveBeenCalledWith('txn-uuid-1', 'REF-001');
    });

    it('calls completePayout without reference number', async () => {
      const dto: ApprovePayoutDto = {};
      await service.approvePayout('txn-uuid-1', dto);
      expect(paymentsService.completePayout).toHaveBeenCalledWith('txn-uuid-1', undefined);
    });
  });

  describe('rejectPayout', () => {
    it('calls failPayout with reason', async () => {
      await service.rejectPayout('txn-uuid-1', 'Fraudulent request');
      expect(paymentsService.failPayout).toHaveBeenCalledWith('txn-uuid-1', 'Fraudulent request');
    });
  });

  describe('getOverallStats', () => {
    it('delegates to paymentsService.getOverallStatistics', async () => {
      const result = await service.getOverallStats();
      expect(paymentsService.getOverallStatistics).toHaveBeenCalled();
      expect(result).toEqual({ total: 1, totalAmount: 1500 });
    });
  });
});
