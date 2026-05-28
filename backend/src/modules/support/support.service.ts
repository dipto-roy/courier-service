import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SupportTicket,
  TicketStatus,
} from '../../entities/support-ticket.entity';
import { User } from '../../entities/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
  ) {}

  async create(dto: CreateTicketDto, user: User): Promise<SupportTicket> {
    const ticket = this.ticketRepository.create({
      ...dto,
      userId: user.id,
    });
    return this.ticketRepository.save(ticket);
  }

  async findAll(status?: TicketStatus) {
    const where = status ? { status } : {};
    return this.ticketRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto): Promise<SupportTicket> {
    const ticket = await this.findOne(id);
    return this.ticketRepository.save({ ...ticket, ...dto });
  }
}
