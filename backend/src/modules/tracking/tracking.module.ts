import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
import { Shipment } from '../../entities/shipment.entity';
import { RiderLocation } from '../../entities/rider-location.entity';
import { Pickup } from '../../entities/pickup.entity';
import { Manifest } from '../../entities/manifest.entity';
import { WsJwtGuard } from '../../common/guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, RiderLocation, Pickup, Manifest]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingGateway, WsJwtGuard],
  exports: [TrackingService, TrackingGateway],
})
export class TrackingModule {}
