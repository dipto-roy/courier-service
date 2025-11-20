import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { Shipment } from '../../entities/shipment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User, Shipment]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
