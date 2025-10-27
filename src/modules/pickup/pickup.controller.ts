import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PickupService } from './pickup.service';
import {
  CreatePickupDto,
  AssignPickupDto,
  CompletePickupDto,
  UpdatePickupDto,
  FilterPickupDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../../entities/user.entity';

@ApiTags('Pickups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pickups')
export class PickupController {
  constructor(private readonly pickupService: PickupService) {}

  @Post()
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: 'Create a new pickup request (Merchant)' })
  @ApiResponse({ status: 201, description: 'Pickup created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createPickupDto: CreatePickupDto,
    @CurrentUser() user: User,
  ) {
    return this.pickupService.create(createPickupDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MERCHANT, UserRole.AGENT, UserRole.HUB_STAFF)
  @ApiOperation({ summary: 'Get all pickups with filters' })
  @ApiResponse({ status: 200, description: 'Pickups retrieved successfully' })
  async findAll(
    @Query() filterDto: FilterPickupDto,
    @CurrentUser() user: User,
  ) {
    return this.pickupService.findAll(filterDto, user);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MERCHANT, UserRole.AGENT, UserRole.HUB_STAFF)
  @ApiOperation({ summary: 'Get pickup statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@CurrentUser() user: User) {
    return this.pickupService.getStatistics(user);
  }

  @Get('today')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: "Get agent's assigned pickups for today" })
  @ApiResponse({ status: 200, description: 'Today pickups retrieved successfully' })
  async getAgentTodayPickups(@CurrentUser() user: User) {
    return this.pickupService.getAgentTodayPickups(user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MERCHANT, UserRole.AGENT, UserRole.HUB_STAFF)
  @ApiOperation({ summary: 'Get pickup by ID' })
  @ApiResponse({ status: 200, description: 'Pickup found' })
  @ApiResponse({ status: 404, description: 'Pickup not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pickupService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update pickup (only pending pickups)' })
  @ApiResponse({ status: 200, description: 'Pickup updated successfully' })
  @ApiResponse({ status: 400, description: 'Only pending pickups can be updated' })
  @ApiResponse({ status: 404, description: 'Pickup not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePickupDto: UpdatePickupDto,
    @CurrentUser() user: User,
  ) {
    return this.pickupService.update(id, updatePickupDto, user);
  }

  @Post(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign pickup to an agent' })
  @ApiResponse({ status: 200, description: 'Pickup assigned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid agent or pickup status' })
  @ApiResponse({ status: 404, description: 'Pickup not found' })
  async assignPickup(
    @Param('id') id: string,
    @Body() assignPickupDto: AssignPickupDto,
  ) {
    return this.pickupService.assignPickup(id, assignPickupDto);
  }

  @Post(':id/start')
  @Roles(UserRole.AGENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start pickup (Agent)' })
  @ApiResponse({ status: 200, description: 'Pickup started successfully' })
  @ApiResponse({ status: 400, description: 'Only assigned pickups can be started' })
  @ApiResponse({ status: 403, description: 'Not assigned to you' })
  async startPickup(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pickupService.startPickup(id, user);
  }

  @Post(':id/complete')
  @Roles(UserRole.AGENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete pickup with shipment scanning (Agent)' })
  @ApiResponse({ status: 200, description: 'Pickup completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid shipments or pickup status' })
  @ApiResponse({ status: 403, description: 'Not assigned to you' })
  async completePickup(
    @Param('id') id: string,
    @Body() completePickupDto: CompletePickupDto,
    @CurrentUser() user: User,
  ) {
    return this.pickupService.completePickup(id, completePickupDto, user);
  }

  @Post(':id/cancel')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel pickup' })
  @ApiResponse({ status: 200, description: 'Pickup cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed pickup' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async cancelPickup(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pickupService.cancelPickup(id, user);
  }
}
