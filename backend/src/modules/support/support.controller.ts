import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from '../../entities/support-ticket.entity';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../../entities/user.entity';

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('support/tickets')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @Roles(
    UserRole.MERCHANT,
    UserRole.CUSTOMER,
    UserRole.AGENT,
    UserRole.RIDER,
    UserRole.ADMIN,
  )
  @ApiOperation({ summary: 'Create support ticket' })
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: User) {
    return this.supportService.create(dto, user);
  }

  @Get()
  @Roles(UserRole.SUPPORT, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all tickets (support/admin)' })
  findAll(@Query('status') status?: TicketStatus) {
    return this.supportService.findAll(status);
  }

  @Get(':id')
  @Roles(UserRole.SUPPORT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get ticket detail' })
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPPORT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update ticket status / resolution' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.supportService.update(id, dto);
  }
}
