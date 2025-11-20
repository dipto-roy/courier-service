import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RiderService } from './rider.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import {
  DeliveryAttemptDto,
  FailedDeliveryDto,
  UpdateLocationDto,
  RTODto,
  GenerateOTPDto,
} from './dto';

@ApiTags('Rider Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rider')
export class RiderController {
  constructor(private readonly riderService: RiderService) {}

  @Get('manifests')
  @Roles(UserRole.RIDER)
  @ApiOperation({ summary: 'Get all manifests assigned to rider' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of assigned manifests with shipments',
    schema: {
      example: {
        success: true,
        total: 2,
        manifests: [
          {
            id: 'uuid',
            manifestNumber: 'MF-20250128-0001',
            status: 'IN_TRANSIT',
            originHub: 'Dhaka Hub',
            destinationHub: 'Chittagong Hub',
            totalShipments: 15,
            dispatchDate: '2025-01-28T10:00:00Z',
            shipments: [
              {
                awb: 'FX20250128000001',
                status: 'OUT_FOR_DELIVERY',
                receiverName: 'John Doe',
                receiverPhone: '01712345678',
                receiverAddress: '123 Main St, Chittagong',
                deliveryArea: 'Agrabad',
                codAmount: 1500,
              },
            ],
          },
        ],
      },
    },
  })
  async getAssignedManifests(@Request() req) {
    return this.riderService.getAssignedManifests(req.user.id);
  }

  @Get('shipments')
  @Roles(UserRole.RIDER)
  @ApiOperation({ summary: 'Get all shipments directly assigned to rider' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of shipments out for delivery',
    schema: {
      example: {
        success: true,
        total: 8,
        shipments: [
          {
            id: 'uuid',
            awb: 'FX20250128000001',
            status: 'OUT_FOR_DELIVERY',
            merchantName: 'ABC Store',
            receiverName: 'John Doe',
            receiverPhone: '01712345678',
            receiverAddress: '123 Main St',
            deliveryArea: 'Gulshan',
            codAmount: 1500,
            deliveryType: 'EXPRESS',
            weight: 2.5,
            deliveryAttempts: 0,
            expectedDeliveryDate: '2025-01-28T18:00:00Z',
            specialInstructions: 'Call before delivery',
            otpCode: '123456',
          },
        ],
      },
    },
  })
  async getMyShipments(@Request() req) {
    return this.riderService.getMyShipments(req.user.id);
  }

  @Get('shipments/:awb')
  @Roles(UserRole.RIDER)
  @ApiOperation({ summary: 'Get shipment details by AWB' })
  @ApiParam({ name: 'awb', description: 'Shipment AWB number' })
  @ApiResponse({
    status: 200,
    description: 'Returns shipment details',
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 403, description: 'Shipment not assigned to this rider' })
  async getShipmentDetails(@Param('awb') awb: string, @Request() req) {
    return this.riderService.getShipmentDetails(awb, req.user);
  }

  @Post('generate-otp')
  @Roles(UserRole.RIDER)
  @ApiOperation({
    summary: 'Generate OTP for shipment delivery',
    description: 'Generates a 6-digit OTP and sends it to the customer for delivery verification',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP generated and sent to customer',
    schema: {
      example: {
        success: true,
        message: 'OTP generated and sent to customer',
        awb: 'FX20250128000001',
        otpGenerated: true,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 403, description: 'Shipment not assigned to this rider' })
  async generateOTP(@Body() generateOTPDto: GenerateOTPDto, @Request() req) {
    return this.riderService.generateOTP(generateOTPDto, req.user);
  }

  @Post('complete-delivery')
  @Roles(UserRole.RIDER)
  @ApiOperation({
    summary: 'Complete delivery with OTP verification',
    description:
      'Marks shipment as delivered after verifying OTP, capturing POD, and collecting COD if applicable',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery completed successfully',
    schema: {
      example: {
        success: true,
        message: 'Delivery completed successfully',
        awb: 'FX20250128000001',
        deliveredAt: '2025-01-28T14:30:00Z',
        codCollected: 1500,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP or COD amount mismatch' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 403, description: 'Shipment not assigned to this rider' })
  async completeDelivery(@Body() deliveryAttemptDto: DeliveryAttemptDto, @Request() req) {
    return this.riderService.completeDelivery(deliveryAttemptDto, req.user);
  }

  @Post('failed-delivery')
  @Roles(UserRole.RIDER)
  @ApiOperation({
    summary: 'Record failed delivery attempt',
    description:
      'Records a failed delivery with reason. Auto-initiates RTO after 3 failed attempts',
  })
  @ApiResponse({
    status: 200,
    description: 'Failed delivery recorded',
    schema: {
      example: {
        success: true,
        message: 'Failed delivery recorded',
        awb: 'FX20250128000001',
        deliveryAttempts: 2,
        status: 'FAILED_DELIVERY',
        autoRTO: false,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 403, description: 'Shipment not assigned to this rider' })
  async recordFailedDelivery(@Body() failedDeliveryDto: FailedDeliveryDto, @Request() req) {
    return this.riderService.recordFailedDelivery(failedDeliveryDto, req.user);
  }

  @Post('mark-rto')
  @Roles(UserRole.RIDER)
  @ApiOperation({
    summary: 'Mark shipment for RTO (Return to Origin)',
    description: 'Initiates RTO process for a shipment that cannot be delivered',
  })
  @ApiResponse({
    status: 200,
    description: 'Shipment marked for RTO',
    schema: {
      example: {
        success: true,
        message: 'Shipment marked for RTO',
        awb: 'FX20250128000001',
        status: 'RTO_INITIATED',
        rtoReason: 'CUSTOMER_REFUSED: Customer refused to accept the package',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 403, description: 'Shipment not assigned to this rider' })
  async markRTO(@Body() rtoDto: RTODto, @Request() req) {
    return this.riderService.markRTO(rtoDto, req.user);
  }

  @Post('update-location')
  @Roles(UserRole.RIDER)
  @ApiOperation({
    summary: 'Update rider live location',
    description: 'Updates rider GPS location for real-time tracking',
  })
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Location updated successfully',
        location: {
          latitude: 23.8103,
          longitude: 90.4125,
          timestamp: '2025-01-28T14:30:00Z',
        },
      },
    },
  })
  async updateLocation(@Body() updateLocationDto: UpdateLocationDto, @Request() req) {
    return this.riderService.updateLocation(updateLocationDto, req.user);
  }

  @Get('location-history')
  @Roles(UserRole.RIDER, UserRole.ADMIN, UserRole.HUB_STAFF)
  @ApiOperation({ summary: 'Get rider location history' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return', example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Returns location history',
    schema: {
      example: {
        success: true,
        total: 50,
        locations: [
          {
            latitude: 23.8103,
            longitude: 90.4125,
            accuracy: 10.5,
            speed: 15.2,
            heading: 270,
            batteryLevel: 85,
            isOnline: true,
            timestamp: '2025-01-28T14:30:00Z',
          },
        ],
      },
    },
  })
  async getLocationHistory(@Request() req, @Query('limit') limit?: number) {
    return this.riderService.getLocationHistory(req.user.id, limit || 50);
  }

  @Get('statistics')
  @Roles(UserRole.RIDER)
  @ApiOperation({ summary: 'Get rider statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns rider performance statistics',
    schema: {
      example: {
        success: true,
        statistics: {
          totalAssigned: 150,
          outForDelivery: 12,
          delivered: 125,
          failedDeliveries: 8,
          rtoShipments: 5,
          todayDeliveries: 18,
          totalCodCollected: 125000,
          deliveryRate: '83.33%',
        },
      },
    },
  })
  async getMyStatistics(@Request() req) {
    return this.riderService.getMyStatistics(req.user.id);
  }
}
