import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HubService } from './hub.service';
import { HubController } from './hub.controller';
import { Manifest } from '../../entities/manifest.entity';
import { Shipment } from '../../entities/shipment.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Manifest, Shipment, User])],
  controllers: [HubController],
  providers: [HubService],
  exports: [HubService],
})
export class HubModule {}
