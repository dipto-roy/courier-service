import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ShipmentsService } from '../shipments/shipments.service';
import { WalletOperationType } from '../users/dto/wallet-update.dto';
import { WalletTopupDto } from './dto/topup.dto';
import { User } from '../../entities/user.entity';

@Injectable()
export class MerchantService {
  constructor(
    private readonly usersService: UsersService,
    private readonly shipmentsService: ShipmentsService,
  ) {}

  async getWallet(merchantId: string) {
    const user = await this.usersService.findOne(merchantId);
    return { balance: user.walletBalance };
  }

  async topup(merchantId: string, dto: WalletTopupDto) {
    return this.usersService.updateWallet(merchantId, {
      operation: WalletOperationType.CREDIT,
      amount: dto.amount,
      remarks: dto.remarks ?? 'Wallet topup',
    });
  }

  async getShipments(merchant: User, query: Record<string, any>) {
    return this.shipmentsService.findAll(query, merchant);
  }

  async getStatistics(merchant: User) {
    return this.shipmentsService.getStatistics(merchant);
  }
}
