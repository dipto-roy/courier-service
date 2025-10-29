import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import {
  CreateShipmentDto,
  UpdateShipmentDto,
  UpdateStatusDto,
  FilterShipmentDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../../entities';

@ApiTags('Shipments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @Roles(UserRole.MERCHANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new shipment' })
  @ApiResponse({ status: 201, description: 'Shipment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createShipmentDto: CreateShipmentDto,
    @CurrentUser() user: User,
  ) {
    return await this.shipmentsService.create(createShipmentDto, user);
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.MERCHANT,
    UserRole.SUPPORT,
    UserRole.HUB_STAFF,
  )
  @ApiOperation({ summary: 'Get all shipments with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Shipments retrieved successfully' })
  async findAll(
    @Query() filterDto: FilterShipmentDto,
    @CurrentUser() user: User,
  ) {
    return await this.shipmentsService.findAll(filterDto, user);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MERCHANT, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get shipment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics(@CurrentUser() user: User) {
    return await this.shipmentsService.getStatistics(user);
  }

  @Get('track/:awb')
  @Public()
  @ApiOperation({ summary: 'Track shipment by AWB (public endpoint)' })
  @ApiResponse({ status: 200, description: 'Shipment found' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async trackByAWB(@Param('awb') awb: string) {
    return await this.shipmentsService.findByAWB(awb);
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.MERCHANT,
    UserRole.SUPPORT,
    UserRole.HUB_STAFF,
    UserRole.RIDER,
  )
  @ApiOperation({ summary: 'Get shipment by ID' })
  @ApiResponse({ status: 200, description: 'Shipment found' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.shipmentsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update shipment information' })
  @ApiResponse({ status: 200, description: 'Shipment updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update after pickup' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async update(
    @Param('id') id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
    @CurrentUser() user: User,
  ) {
    return await this.shipmentsService.update(id, updateShipmentDto, user);
  }

  @Patch(':id/status')
  @Roles(
    UserRole.ADMIN,
    UserRole.HUB_STAFF,
    UserRole.AGENT,
    UserRole.RIDER,
  )
  @ApiOperation({ summary: 'Update shipment status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @CurrentUser() user: User,
  ) {
    return await this.shipmentsService.updateStatus(
      id,
      updateStatusDto,
      user,
    );
  }

  @Delete(':id')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete shipment (only if PENDING)' })
  @ApiResponse({ status: 204, description: 'Shipment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete after pickup' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.shipmentsService.remove(id, user);
  }

  @Post('bulk-upload')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Bulk upload shipments from CSV',
    description: `Upload multiple shipments at once using CSV format.
    
    **CSV Format:**
    - Header: receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType
    - Each row represents one shipment
    - Sender information is automatically taken from the logged-in merchant
    
    **Example CSV:**
    \`\`\`
    receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType
    Jane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal
    Michael Johnson,01687654321,Chittagong,Nasirabad,Building 10 Block A,1.2,1500,express
    \`\`\`
    
    **Response includes:**
    - Total rows processed
    - Success/failure counts
    - Error details for failed rows
    - AWB numbers for successful shipments`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['csvData'],
      properties: {
        csvData: {
          type: 'string',
          description: 'CSV data as a string with header and data rows separated by newlines',
          example:
            'receiverName,receiverPhone,receiverCity,receiverArea,receiverAddress,weight,codAmount,deliveryType\nJane Smith,01798765432,Dhaka,Dhanmondi,House 5 Road 3,2.5,3500,normal\nMichael Johnson,01687654321,Chittagong,Nasirabad,Building 10 Block A,1.2,1500,express',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk upload completed with results',
    schema: {
      type: 'object',
      properties: {
        totalRows: {
          type: 'number',
          example: 2,
          description: 'Total number of rows processed (excluding header)',
        },
        successCount: {
          type: 'number',
          example: 2,
          description: 'Number of successfully created shipments',
        },
        failedCount: {
          type: 'number',
          example: 0,
          description: 'Number of failed shipments',
        },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              row: { type: 'number', example: 2 },
              error: { type: 'string', example: 'Invalid phone number' },
            },
          },
          description: 'List of errors for failed rows',
        },
        shipments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              awb: { type: 'string', example: 'FX20251028929833' },
              receiverName: { type: 'string', example: 'Jane Smith' },
              receiverPhone: { type: 'string', example: '01798765432' },
            },
          },
          description: 'List of successfully created shipments',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid CSV format or missing data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only merchants and admins can bulk upload',
  })
  async bulkUpload(
    @Body('csvData') csvData: string,
    @CurrentUser() user: User,
  ) {
    return await this.shipmentsService.bulkUpload(csvData, user);
  }
}
