import { Module } from '@nestjs/common';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { UsersModule } from '../users/users.module';
import { ShipmentsModule } from '../shipments/shipments.module';

@Module({
  imports: [UsersModule, ShipmentsModule],
  controllers: [MerchantController],
  providers: [MerchantService],
})
export class MerchantModule {}
