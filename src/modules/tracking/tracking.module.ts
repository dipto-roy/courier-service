import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
import { Shipment } from '../../entities/shipment.entity';
import { RiderLocation } from '../../entities/rider-location.entity';
import { Pickup } from '../../entities/pickup.entity';
import { Manifest } from '../../entities/manifest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, RiderLocation, Pickup, Manifest]),
  ],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingGateway],
  exports: [TrackingService, TrackingGateway],
})
export class TrackingModule {}
