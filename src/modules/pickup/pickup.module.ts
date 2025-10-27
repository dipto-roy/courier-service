import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupService } from './pickup.service';
import { PickupController } from './pickup.controller';
import { Pickup } from '../../entities/pickup.entity';
import { Shipment } from '../../entities/shipment.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pickup, Shipment, User])],
  controllers: [PickupController],
  providers: [PickupService],
  exports: [PickupService],
})
export class PickupModule {}
