import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { SlaWatcherService } from './sla-watcher.service';
import { SlaWatcherProcessor } from './sla-watcher.processor';
import { SlaWatcherController } from './sla-watcher.controller';
import { Shipment } from '../../entities/shipment.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment]),
    BullModule.registerQueue({
      name: 'sla-watcher',
    }),
    ScheduleModule.forRoot(),
    NotificationsModule,
    AuditModule,
  ],
  controllers: [SlaWatcherController],
  providers: [SlaWatcherService, SlaWatcherProcessor],
  exports: [SlaWatcherService],
})
export class SlaWatcherModule {}
