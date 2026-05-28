import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MerchantService } from './merchant.service';
import { WalletTopupDto } from './dto/topup.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../../entities/user.entity';

@ApiTags('Merchant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MERCHANT)
@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get('wallet')
  @ApiOperation({ summary: 'Get wallet balance' })
  getWallet(@CurrentUser() user: User) {
    return this.merchantService.getWallet(user.id);
  }

  @Post('wallet/topup')
  @ApiOperation({ summary: 'Initiate wallet topup' })
  topup(@CurrentUser() user: User, @Body() dto: WalletTopupDto) {
    return this.merchantService.topup(user.id, dto);
  }

  @Get('shipments')
  @ApiOperation({ summary: "Get merchant's own shipments" })
  getShipments(@CurrentUser() user: User, @Query() query: Record<string, any>) {
    return this.merchantService.getShipments(user, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Merchant shipment statistics' })
  getStats(@CurrentUser() user: User) {
    return this.merchantService.getStatistics(user);
  }
}
