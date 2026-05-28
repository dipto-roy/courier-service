import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { PaymentsService } from '../payments/payments.service';
import { PaymentFilterDto } from '../payments/dto';
import { PaymentStatus } from '../../common/enums';
import { ReportFilterDto, ReportPeriod } from './dto/report-filter.dto';
import { ApprovePayoutDto } from './dto/approve-payout.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly paymentsService: PaymentsService,
  ) {}

  async getReport(filter: ReportFilterDto) {
    const { period, startDate, endDate } = filter;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : this.periodStart(period ?? ReportPeriod.DAILY, end);

    const rows = await this.transactionRepository.find({
      where: { createdAt: Between(start, end) },
      order: { createdAt: 'DESC' },
    });

    const totals = rows.reduce(
      (acc, t) => {
        acc.count++;
        acc.amount += Number(t.amount);
        return acc;
      },
      { count: 0, amount: 0 },
    );

    return { period, start, end, transactions: rows, totals };
  }

  async getTransactions(filterDto: PaymentFilterDto) {
    return this.paymentsService.getTransactions(filterDto);
  }

  async getOverallStats() {
    return this.paymentsService.getOverallStatistics();
  }

  async getPendingPayouts() {
    return this.paymentsService.getTransactions({ status: PaymentStatus.PENDING } as PaymentFilterDto);
  }

  async approvePayout(transactionId: string, dto: ApprovePayoutDto) {
    return this.paymentsService.completePayout(transactionId, dto.referenceNumber);
  }

  async rejectPayout(transactionId: string, reason: string) {
    return this.paymentsService.failPayout(transactionId, reason);
  }

  private periodStart(period: ReportPeriod, end: Date): Date {
    const start = new Date(end);
    if (period === ReportPeriod.DAILY) start.setDate(start.getDate() - 1);
    else if (period === ReportPeriod.WEEKLY) start.setDate(start.getDate() - 7);
    else start.setMonth(start.getMonth() - 1);
    return start;
  }
}
