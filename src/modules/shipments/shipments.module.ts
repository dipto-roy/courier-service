import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { Shipment, User } from '../../entities';
import { PricingService, GeoService } from '../../common/services';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, User])],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, PricingService, GeoService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
