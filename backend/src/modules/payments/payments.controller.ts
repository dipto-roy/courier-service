import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePayoutDto, PaymentFilterDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('record-cod/:shipmentId')
  @Roles(UserRole.ADMIN, UserRole.RIDER)
  @ApiOperation({
    summary: 'Record COD collection',
    description: 'Record COD collection when shipment is delivered. Automatically creates transaction record.',
  })
  @ApiParam({
    name: 'shipmentId',
    description: 'Shipment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'COD collection recorded successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        transactionId: 'COD-1KXYZ123-ABC456',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        shipmentId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'cod_collection',
        paymentMethod: 'cash',
        status: 'completed',
        amount: 5000,
        fee: 150,
        netAmount: 4850,
        description: 'COD collection for AWB: FX20250128000001',
        processedAt: '2025-01-28T10:30:00Z',
        createdAt: '2025-01-28T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Shipment not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid shipment status or payment method' })
  async recordCodCollection(@Param('shipmentId') shipmentId: string, @Request() req: any) {
    return await this.paymentsService.recordCodCollection(shipmentId, req.user.userId);
  }

  @Post('record-delivery-fee/:shipmentId')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF)
  @ApiOperation({
    summary: 'Record delivery fee',
    description: 'Record delivery fee transaction for a shipment.',
  })
  @ApiParam({
    name: 'shipmentId',
    description: 'Shipment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Delivery fee recorded successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Shipment not found' })
  async recordDeliveryFee(@Param('shipmentId') shipmentId: string) {
    return await this.paymentsService.recordDeliveryFee(shipmentId);
  }

  @Post('initiate-payout')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({
    summary: 'Initiate payout to merchant',
    description: 'Initiate T+7 payout to merchant. Validates available balance and creates payout transaction.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payout initiated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        transactionId: 'POUT-1KXYZ123-DEF789',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'cod_payout',
        paymentMethod: 'bank_transfer',
        status: 'processing',
        amount: 15000,
        fee: 50,
        netAmount: 14950,
        description: 'Payout to merchant - T+7 settlement',
        previousBalance: 20000,
        newBalance: 5000,
        processedById: 'admin-123',
        createdAt: '2025-01-28T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Merchant not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Insufficient balance' })
  async initiatePayout(@Body() initiatePayoutDto: InitiatePayoutDto, @Request() req: any) {
    return await this.paymentsService.initiatePayout(initiatePayoutDto, req.user.userId);
  }

  @Patch('complete-payout/:transactionId')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({
    summary: 'Complete a payout',
    description: 'Mark a payout transaction as completed after successful bank transfer.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payout completed successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid transaction type or status' })
  async completePayout(
    @Param('transactionId') transactionId: string,
    @Body('referenceNumber') referenceNumber?: string,
  ) {
    return await this.paymentsService.completePayout(transactionId, referenceNumber);
  }

  @Patch('fail-payout/:transactionId')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({
    summary: 'Fail a payout',
    description: 'Mark a payout as failed and reverse wallet deduction.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payout marked as failed and balance reversed',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
  async failPayout(
    @Param('transactionId') transactionId: string,
    @Body('reason') reason: string,
  ) {
    return await this.paymentsService.failPayout(transactionId, reason);
  }

  @Get('transactions')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.MERCHANT)
  @ApiOperation({
    summary: 'Get transactions with filters',
    description: 'Retrieve transactions with pagination and filters. Merchants can only see their own transactions.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transactions retrieved successfully',
    schema: {
      example: {
        transactions: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            transactionId: 'COD-1KXYZ123-ABC456',
            type: 'cod_collection',
            amount: 5000,
            status: 'completed',
            createdAt: '2025-01-28T10:30:00Z',
          },
        ],
        pagination: {
          total: 150,
          page: 1,
          limit: 20,
          totalPages: 8,
        },
      },
    },
  })
  async getTransactions(@Query() filterDto: PaymentFilterDto, @Request() req: any) {
    // If user is merchant, filter by their ID
    if (req.user.role === UserRole.MERCHANT) {
      filterDto.merchantId = req.user.userId;
    }
    
    return await this.paymentsService.getTransactions(filterDto);
  }

  @Get('transactions/:transactionId')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.MERCHANT)
  @ApiOperation({
    summary: 'Get transaction by ID',
    description: 'Retrieve detailed transaction information.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction details',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
  async getTransaction(@Param('transactionId') transactionId: string) {
    return await this.paymentsService.getTransaction(transactionId);
  }

  @Get('pending-collections/:merchantId')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.MERCHANT)
  @ApiOperation({
    summary: 'Get pending COD collections',
    description: 'Get COD collections that are older than 7 days and pending payout.',
  })
  @ApiParam({
    name: 'merchantId',
    description: 'Merchant user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pending collections retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          transactionId: 'COD-1KXYZ123-ABC456',
          amount: 5000,
          netAmount: 4850,
          createdAt: '2025-01-20T10:30:00Z',
        },
      ],
    },
  })
  async getPendingCollections(@Param('merchantId') merchantId: string) {
    return await this.paymentsService.getPendingCodCollections(merchantId);
  }

  @Get('pending-balance/:merchantId')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.MERCHANT)
  @ApiOperation({
    summary: 'Get pending balance for merchant',
    description: 'Calculate pending balance available for payout (T+7 eligible amount).',
  })
  @ApiParam({
    name: 'merchantId',
    description: 'Merchant user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pending balance calculated',
    schema: {
      example: {
        pendingBalance: 15750.50,
      },
    },
  })
  async getPendingBalance(@Param('merchantId') merchantId: string) {
    const pendingBalance = await this.paymentsService.calculatePendingBalance(merchantId);
    return { pendingBalance };
  }

  @Get('statistics/merchant/:merchantId')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.MERCHANT)
  @ApiOperation({
    summary: 'Get merchant payment statistics',
    description: 'Get comprehensive payment statistics for a specific merchant.',
  })
  @ApiParam({
    name: 'merchantId',
    description: 'Merchant user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        walletBalance: 5000,
        pendingBalance: 15750.50,
        totalCodCollected: 150000,
        totalCodTransactions: 250,
        totalDeliveryFees: 7500,
        totalPayouts: 100000,
        totalPayoutTransactions: 15,
        thisMonthCollections: 25000,
      },
    },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Merchant not found' })
  async getMerchantStatistics(@Param('merchantId') merchantId: string) {
    return await this.paymentsService.getMerchantStatistics(merchantId);
  }

  @Get('statistics/overall')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({
    summary: 'Get overall payment statistics',
    description: 'Get system-wide payment statistics (admin only).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Overall statistics retrieved successfully',
    schema: {
      example: {
        totalCodCollected: 5000000,
        totalCodTransactions: 8500,
        totalPayouts: 3500000,
        totalPayoutTransactions: 450,
        pendingPayouts: 250000,
        pendingPayoutTransactions: 35,
        todayCollections: 75000,
        thisMonthCollections: 850000,
      },
    },
  })
  async getOverallStatistics() {
    return await this.paymentsService.getOverallStatistics();
  }
}
