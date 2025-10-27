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
    description:
      'CSV format: receiverName, receiverPhone, receiverCity, receiverArea, receiverAddress, weight, codAmount, deliveryType',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk upload completed with results',
  })
  async bulkUpload(
    @Body('csvData') csvData: string,
    @CurrentUser() user: User,
  ) {
    return await this.shipmentsService.bulkUpload(csvData, user);
  }
}
