import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { PaymentsModule } from '../payments/payments.module';
import { Transaction } from '../../entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), PaymentsModule],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
