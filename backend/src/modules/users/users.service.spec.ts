import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums';

jest.mock('../../common/utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-pw'),
  comparePassword: jest.fn().mockResolvedValue(true),
  generateOTP: jest.fn().mockReturnValue('000000'),
  getOTPExpiry: jest.fn().mockReturnValue(new Date()),
  isOTPValid: jest.fn().mockReturnValue(true),
}));

const mockUser: Partial<User> = {
  id: 'user-uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+8801700000001',
  role: UserRole.CUSTOMER,
  isActive: true,
  isVerified: true,
  walletBalance: 0,
  createdAt: new Date(),
};

const qbMock = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  withDeleted: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
  getMany: jest.fn().mockResolvedValue([mockUser]),
  getOne: jest.fn().mockResolvedValue(mockUser),
  getCount: jest.fn().mockResolvedValue(1),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue([{ role: UserRole.CUSTOMER, count: '1' }]),
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
    softRemove: jest.Mock;
    restore: jest.Mock;
    count: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
      softRemove: jest.fn().mockResolvedValue(mockUser),
      restore: jest.fn().mockResolvedValue({ affected: 1 }),
      count: jest.fn().mockResolvedValue(5),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    const dto = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+8801700000001',
      password: 'password123',
      role: UserRole.CUSTOMER,
    };

    it('creates user with hashed password', async () => {
      await service.create(dto as any);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('throws ConflictException when email exists', async () => {
      userRepository.findOne.mockResolvedValueOnce({ ...mockUser, email: dto.email });
      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('returns paginated users with meta', async () => {
      const result = await service.findAll({ page: 1, limit: 10 } as any);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect((result as any).meta).toHaveProperty('totalItems');
    });
  });

  describe('findOne', () => {
    it('returns user by id', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      const result = await service.findOne('user-uuid-1');
      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('returns user by email', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('returns null when not found', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);
      const result = await service.findByEmail('ghost@example.com');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates and saves user', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      await service.update('user-uuid-1', { role: UserRole.MERCHANT } as any);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('throws NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.update('non-existent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('soft-deletes user', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      await service.remove('user-uuid-1');
      expect(userRepository.softRemove).toHaveBeenCalledWith(mockUser);
    });

    it('throws NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('restores soft-deleted user and returns it', async () => {
      // qbMock.getOne returns mockUser for the withDeleted query
      // then findOne called inside findOne() after restore
      userRepository.findOne.mockResolvedValueOnce(mockUser);
      const result = await service.restore('user-uuid-1');
      expect(userRepository.restore).toHaveBeenCalledWith('user-uuid-1');
      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException when user not found', async () => {
      qbMock.getOne.mockResolvedValueOnce(null);
      await expect(service.restore('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
