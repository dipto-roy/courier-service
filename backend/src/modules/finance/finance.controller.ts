import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ApprovePayoutDto } from './dto/approve-payout.dto';
import { PaymentFilterDto } from '../payments/dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FINANCE, UserRole.ADMIN)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('reports')
  @ApiOperation({ summary: 'Revenue reconciliation report' })
  getReport(@Query() filter: ReportFilterDto) {
    return this.financeService.getReport(filter);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Full transaction ledger' })
  getTransactions(@Query() filter: PaymentFilterDto) {
    return this.financeService.getTransactions(filter);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Overall financial statistics' })
  getStats() {
    return this.financeService.getOverallStats();
  }

  @Get('payouts')
  @ApiOperation({ summary: 'Pending payout list' })
  getPendingPayouts() {
    return this.financeService.getPendingPayouts();
  }

  @Patch('payouts/:id/approve')
  @ApiOperation({ summary: 'Approve payout' })
  approvePayout(@Param('id') id: string, @Body() dto: ApprovePayoutDto) {
    return this.financeService.approvePayout(id, dto);
  }

  @Patch('payouts/:id/reject')
  @ApiOperation({ summary: 'Reject payout' })
  rejectPayout(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.financeService.rejectPayout(id, body.reason);
  }
}
