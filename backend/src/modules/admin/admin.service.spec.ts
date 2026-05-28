import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { User } from '../../entities/user.entity';
import { Shipment } from '../../entities/shipment.entity';
import { Transaction } from '../../entities/transaction.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums';
import { AssignRoleDto } from './dto/assign-role.dto';

const mockUser: Partial<User> = {
  id: 'user-uuid-1',
  name: 'Admin User',
  email: 'admin@test.com',
  role: UserRole.ADMIN,
  isActive: true,
};

const rawOneResult = { total: '50000' };
const usersByRoleResult = [
  { role: UserRole.ADMIN, count: '2' },
  { role: UserRole.MERCHANT, count: '10' },
  { role: UserRole.CUSTOMER, count: '50' },
];

const qbMock = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  getRawOne: jest.fn().mockResolvedValue(rawOneResult),
  getRawMany: jest.fn().mockResolvedValue(usersByRoleResult),
};

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: {
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let shipmentRepository: { count: jest.Mock };
  let transactionRepository: { createQueryBuilder: jest.Mock };
  let usersService: jest.Mocked<Pick<UsersService, 'findAll' | 'update' | 'remove' | 'restore'>>;

  beforeEach(async () => {
    userRepository = {
      count: jest.fn().mockResolvedValue(62),
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
    };

    shipmentRepository = {
      count: jest.fn().mockResolvedValue(120),
    };

    transactionRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
    };

    usersService = {
      findAll: jest.fn().mockResolvedValue({ data: [mockUser], total: 1 }),
      update: jest.fn().mockResolvedValue({ ...mockUser, role: UserRole.FINANCE }),
      remove: jest.fn().mockResolvedValue(undefined),
      restore: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepository },
        { provide: getRepositoryToken(Transaction), useValue: transactionRepository },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getSystemStats', () => {
    it('returns aggregated system statistics', async () => {
      const result = await service.getSystemStats();

      expect(result.users.total).toBe(62);
      expect(result.shipments.total).toBe(120);
      expect(result.revenue.total).toBe(50000);
      expect(result.users.byRole).toEqual({
        admin: 2,
        merchant: 10,
        customer: 50,
      });
    });

    it('handles zero revenue gracefully', async () => {
      qbMock.getRawOne.mockResolvedValueOnce({ total: null });
      const result = await service.getSystemStats();
      expect(result.revenue.total).toBe(0);
    });
  });

  describe('listUsers', () => {
    it('delegates to usersService.findAll', async () => {
      const filter = { page: 1, limit: 10 } as any;
      await service.listUsers(filter);
      expect(usersService.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('assignRole', () => {
    it('assigns new role to user', async () => {
      const dto: AssignRoleDto = { role: UserRole.FINANCE };
      const result = await service.assignRole('user-uuid-1', dto);
      expect(usersService.update).toHaveBeenCalledWith('user-uuid-1', { role: UserRole.FINANCE });
      expect(result?.role).toBe(UserRole.FINANCE);
    });
  });

  describe('deleteUser', () => {
    it('calls usersService.remove', async () => {
      await service.deleteUser('user-uuid-1');
      expect(usersService.remove).toHaveBeenCalledWith('user-uuid-1');
    });
  });

  describe('restoreUser', () => {
    it('calls usersService.restore', async () => {
      const result = await service.restoreUser('user-uuid-1');
      expect(usersService.restore).toHaveBeenCalledWith('user-uuid-1');
      expect(result).toEqual(mockUser);
    });
  });
});
