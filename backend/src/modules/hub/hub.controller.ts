import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HubService } from './hub.service';
import {
  InboundScanDto,
  OutboundScanDto,
  CreateManifestDto,
  ReceiveManifestDto,
  FilterManifestDto,
  SortingDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { User } from '../../entities/user.entity';

@ApiTags('Hub Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hub')
export class HubController {
  constructor(private readonly hubService: HubService) {}

  @Post('inbound-scan')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF)
  @ApiOperation({
    summary: 'Inbound scanning - Receive shipments at hub',
    description:
      'Scan shipments arriving at hub from pickups or other hubs. Updates shipment status to AT_HUB.',
  })
  @ApiResponse({
    status: 201,
    description: 'Shipments scanned successfully',
    schema: {
      example: {
        success: true,
        scannedCount: 5,
        hubLocation: 'Dhaka Hub',
        scannedShipments: [
          {
            awb: 'FXC2025010001',
            status: 'at_hub',
            currentHub: 'Dhaka Hub',
          },
        ],
        message: 'Successfully scanned 5 shipments at Dhaka Hub',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid shipment AWBs or status' })
  inboundScan(
    @Body() inboundScanDto: InboundScanDto,
    @CurrentUser() user: User,
  ) {
    return this.hubService.inboundScan(inboundScanDto, user);
  }

  @Post('outbound-scan')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF)
  @ApiOperation({
    summary: 'Outbound scanning - Dispatch shipments from hub',
    description:
      'Scan shipments leaving hub for delivery or transfer. Can assign to rider or route to another hub.',
  })
  @ApiResponse({
    status: 201,
    description: 'Shipments dispatched successfully',
    schema: {
      example: {
        success: true,
        scannedCount: 5,
        originHub: 'Dhaka Hub',
        destinationHub: 'Chittagong Hub',
        scannedShipments: [
          {
            awb: 'FXC2025010001',
            status: 'in_transit',
            destination: 'Chittagong Hub',
          },
        ],
        message: 'Successfully dispatched 5 shipments from Dhaka Hub',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Shipments not at origin hub' })
  outboundScan(
    @Body() outboundScanDto: OutboundScanDto,
    @CurrentUser() user: User,
  ) {
    return this.hubService.outboundScan(outboundScanDto, user);
  }

  @Post('sorting')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF)
  @ApiOperation({
    summary: 'Sort shipments by destination',
    description:
      'Assign destination hub to shipments for routing. Used in hub sorting operations.',
  })
  @ApiResponse({
    status: 201,
    description: 'Shipments sorted successfully',
    schema: {
      example: {
        success: true,
        sortedCount: 10,
        hubLocation: 'Dhaka Hub',
        destinationHub: 'Chittagong Hub',
        sortedShipments: [
          {
            awb: 'FXC2025010001',
            nextHub: 'Chittagong Hub',
          },
        ],
        message: 'Sorted 10 shipments for Chittagong Hub',
      },
    },
  })
  sortShipments(@Body() sortingDto: SortingDto, @CurrentUser() user: User) {
    return this.hubService.sortShipments(sortingDto, user);
  }

  @Post('manifests')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF)
  @ApiOperation({
    summary: 'Create manifest for hub-to-hub transfer',
    description:
      'Create a manifest to group shipments for transfer to another hub. Auto-generates manifest number.',
  })
  @ApiResponse({
    status: 201,
    description: 'Manifest created successfully',
    schema: {
      example: {
        success: true,
        manifest: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          manifestNumber: 'MF-20250128-0001',
          originHub: 'Dhaka Hub',
          destinationHub: 'Chittagong Hub',
          totalShipments: 25,
          status: 'in_transit',
          dispatchDate: '2025-01-28T10:30:00Z',
        },
        message: 'Manifest MF-20250128-0001 created with 25 shipments',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid shipments or hub' })
  createManifest(
    @Body() createManifestDto: CreateManifestDto,
    @CurrentUser() user: User,
  ) {
    return this.hubService.createManifest(createManifestDto, user);
  }

  @Get('manifests')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF, UserRole.RIDER)
  @ApiOperation({
    summary: 'Get all manifests with filters',
    description:
      'List all manifests with pagination and filtering by status, hub, rider, date range.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of manifests',
  })
  async findAllManifests(
    @Query() filterDto: FilterManifestDto,
    @CurrentUser() user: User,
  ): Promise<any> {
    return this.hubService.findAll(filterDto, user);
  }

  @Get('manifests/statistics')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF)
  @ApiOperation({
    summary: 'Get manifest statistics',
    description: 'Get count of manifests by status, optionally filtered by hub.',
  })
  @ApiQuery({
    name: 'hubLocation',
    required: false,
    description: 'Filter statistics by hub location',
    example: 'Dhaka Hub',
  })
  @ApiResponse({
    status: 200,
    description: 'Manifest statistics',
    schema: {
      example: {
        total: 100,
        created: 5,
        inTransit: 20,
        received: 70,
        closed: 5,
        hubLocation: 'Dhaka Hub',
      },
    },
  })
  getStatistics(@Query('hubLocation') hubLocation?: string) {
    return this.hubService.getStatistics(hubLocation);
  }

  @Get('manifests/:id')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF, UserRole.RIDER)
  @ApiOperation({
    summary: 'Get manifest details by ID',
    description: 'Get full manifest details including all shipments and related data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Manifest ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Manifest details',
  })
  @ApiResponse({ status: 404, description: 'Manifest not found' })
  findOneManifest(@Param('id') id: string) {
    return this.hubService.findOne(id);
  }

  @Post('manifests/:id/receive')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF)
  @ApiOperation({
    summary: 'Receive manifest at destination hub',
    description:
      'Mark manifest as received and scan shipments. Handles discrepancies between expected and received shipments.',
  })
  @ApiParam({
    name: 'id',
    description: 'Manifest ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Manifest received successfully',
    schema: {
      example: {
        success: true,
        manifestNumber: 'MF-20250128-0001',
        receivedCount: 24,
        expectedCount: 25,
        discrepancies: {
          notInManifest: [],
          notReceived: ['FXC2025010025'],
        },
        message: 'Manifest MF-20250128-0001 received at Chittagong Hub',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Manifest not in transit or hub mismatch',
  })
  receiveManifest(
    @Param('id') id: string,
    @Body() receiveManifestDto: ReceiveManifestDto,
    @CurrentUser() user: User,
  ) {
    return this.hubService.receiveManifest(id, receiveManifestDto, user);
  }

  @Patch('manifests/:id/close')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF)
  @ApiOperation({
    summary: 'Close manifest',
    description: 'Mark received manifest as closed/completed.',
  })
  @ApiParam({
    name: 'id',
    description: 'Manifest ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Manifest closed successfully',
  })
  @ApiResponse({ status: 400, description: 'Can only close received manifests' })
  closeManifest(@Param('id') id: string, @CurrentUser() user: User) {
    return this.hubService.closeManifest(id, user);
  }

  @Get('inventory/:hubLocation')
  @Roles(UserRole.ADMIN, UserRole.HUB_STAFF)
  @ApiOperation({
    summary: 'Get hub inventory',
    description:
      'Get all shipments currently at the hub with statistics by destination, type, and COD.',
  })
  @ApiParam({
    name: 'hubLocation',
    description: 'Hub location name',
    example: 'Dhaka Hub',
  })
  @ApiResponse({
    status: 200,
    description: 'Hub inventory with statistics',
    schema: {
      example: {
        hubLocation: 'Dhaka Hub',
        statistics: {
          totalShipments: 150,
          byDestination: {
            'Chittagong Hub': 50,
            'Sylhet Hub': 30,
            'Local Delivery': 70,
          },
          byType: {
            express: 40,
            normal: 110,
          },
          codShipments: 80,
          totalCodAmount: 125000,
        },
        shipments: [
          {
            awb: 'FXC2025010001',
            merchantName: 'ABC Store',
            deliveryArea: 'Gulshan',
            nextHub: 'Local Delivery',
            weight: 2.5,
            codAmount: 1500,
            deliveryType: 'express',
            createdAt: '2025-01-28T08:00:00Z',
          },
        ],
      },
    },
  })
  getHubInventory(@Param('hubLocation') hubLocation: string) {
    return this.hubService.getHubInventory(hubLocation);
  }
}
