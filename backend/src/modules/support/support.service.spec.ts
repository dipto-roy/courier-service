import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SupportService } from './support.service';
import {
  SupportTicket,
  TicketStatus,
  TicketPriority,
} from '../../entities/support-ticket.entity';
import { User } from '../../entities/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

const mockUser: Partial<User> = {
  id: 'user-uuid-1',
  name: 'Test Customer',
  email: 'customer@test.com',
};

const mockTicket: Partial<SupportTicket> = {
  id: 'ticket-uuid-1',
  subject: 'Package not delivered',
  description: 'My package was supposed to arrive yesterday.',
  status: TicketStatus.OPEN,
  priority: TicketPriority.MEDIUM,
  userId: 'user-uuid-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('SupportService', () => {
  let service: SupportService;
  let ticketRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    ticketRepository = {
      create: jest.fn().mockReturnValue(mockTicket),
      save: jest.fn().mockResolvedValue(mockTicket),
      find: jest.fn().mockResolvedValue([mockTicket]),
      findOne: jest.fn().mockResolvedValue(mockTicket),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportService,
        {
          provide: getRepositoryToken(SupportTicket),
          useValue: ticketRepository,
        },
      ],
    }).compile();

    service = module.get<SupportService>(SupportService);
  });

  describe('create', () => {
    it('creates and saves a ticket', async () => {
      const dto: CreateTicketDto = {
        subject: 'Package not delivered',
        description: 'My package was supposed to arrive yesterday.',
        priority: TicketPriority.MEDIUM,
      };

      const result = await service.create(dto, mockUser as User);

      expect(ticketRepository.create).toHaveBeenCalledWith({
        ...dto,
        userId: mockUser.id,
      });
      expect(ticketRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTicket);
    });
  });

  describe('findAll', () => {
    it('returns all tickets when no status filter', async () => {
      const result = await service.findAll();
      expect(ticketRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockTicket]);
    });

    it('filters by status when provided', async () => {
      await service.findAll(TicketStatus.OPEN);
      expect(ticketRepository.find).toHaveBeenCalledWith({
        where: { status: TicketStatus.OPEN },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('returns ticket by id', async () => {
      const result = await service.findOne('ticket-uuid-1');
      expect(ticketRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'ticket-uuid-1' },
        relations: ['user'],
      });
      expect(result).toEqual(mockTicket);
    });

    it('throws NotFoundException when ticket not found', async () => {
      ticketRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates ticket status and resolution', async () => {
      const dto: UpdateTicketDto = {
        status: TicketStatus.RESOLVED,
        resolution: 'Parcel was delivered to neighbor.',
      };

      await service.update('ticket-uuid-1', dto);

      expect(ticketRepository.save).toHaveBeenCalledWith({
        ...mockTicket,
        ...dto,
      });
    });

    it('throws NotFoundException when ticket not found', async () => {
      ticketRepository.findOne.mockResolvedValueOnce(null);
      await expect(
        service.update('non-existent', { status: TicketStatus.CLOSED }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
