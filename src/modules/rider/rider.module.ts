import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiderController } from './rider.controller';
import { RiderService } from './rider.service';
import { Shipment } from '../../entities/shipment.entity';
import { Manifest } from '../../entities/manifest.entity';
import { RiderLocation } from '../../entities/rider-location.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, Manifest, RiderLocation, User]),
  ],
  controllers: [RiderController],
  providers: [RiderService],
  exports: [RiderService],
})
export class RiderModule {}
