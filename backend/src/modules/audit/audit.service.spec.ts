import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from '../../entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let auditLogRepository: any;

  const mockAuditLog: Partial<AuditLog> = {
    id: 'audit-uuid-1',
    userId: 'user-uuid-1',
    entityType: 'shipment',
    entityId: 'shipment-uuid-1',
    action: 'status_update',
    description: 'Status changed to IN_TRANSIT',
    oldValues: { status: 'PENDING' },
    newValues: { status: 'IN_TRANSIT' },
    ipAddress: '127.0.0.1',
    createdAt: new Date(),
  };

  const createQueryBuilderMock = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockAuditLog]),
    getOne: jest.fn().mockResolvedValue(mockAuditLog),
    getCount: jest.fn().mockResolvedValue(1),
    getManyAndCount: jest.fn().mockResolvedValue([[mockAuditLog], 1]),
    getRawMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue({ count: '10' }),
    delete: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 5 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn().mockReturnValue(mockAuditLog),
            save: jest.fn().mockResolvedValue(mockAuditLog),
            count: jest.fn().mockResolvedValue(10),
            createQueryBuilder: jest.fn(() => createQueryBuilderMock),
          },
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditLogRepository = module.get(getRepositoryToken(AuditLog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const result = await service.log({
        userId: 'user-uuid-1',
        entityType: 'shipment',
        entityId: 'shipment-uuid-1',
        action: 'status_update',
        description: 'Status changed to IN_TRANSIT',
      });

      expect(result).toEqual(mockAuditLog);
      expect(auditLogRepository.create).toHaveBeenCalled();
      expect(auditLogRepository.save).toHaveBeenCalled();
    });

    it('should handle errors gracefully and return null', async () => {
      auditLogRepository.save.mockRejectedValue(new Error('DB error'));

      const result = await service.log({
        userId: 'user-uuid-1',
        entityType: 'shipment',
        entityId: 'shipment-uuid-1',
        action: 'status_update',
      });

      expect(result).toBeNull();
    });
  });

  describe('logAction', () => {
    it('should log a generic action', async () => {
      const result = await service.logAction(
        'user-uuid-1',
        'shipment',
        'shipment-uuid-1',
        'create',
        'Created new shipment',
      );

      expect(result).toEqual(mockAuditLog);
    });
  });

  describe('logShipmentAction', () => {
    it('should log a shipment-specific action', async () => {
      const result = await service.logShipmentAction(
        'user-uuid-1',
        'shipment-uuid-1',
        'status_update',
        'Shipment status updated',
        { status: 'PENDING' },
        { status: 'IN_TRANSIT' },
      );

      expect(result).toEqual(mockAuditLog);
    });
  });

  describe('logAuthAction', () => {
    it('should log an auth-specific action', async () => {
      const result = await service.logAuthAction(
        'user-uuid-1',
        'login',
        'User logged in',
        '127.0.0.1',
      );

      expect(result).toEqual(mockAuditLog);
    });
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs', async () => {
      const result = await service.getAuditLogs({ page: 1, limit: 10 } as any);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
    });
  });

  describe('getAuditLogById', () => {
    it('should return audit log by id', async () => {
      auditLogRepository.findOne.mockResolvedValue(mockAuditLog);

      const result = await service.getAuditLogById('audit-uuid-1');
      expect(result).toEqual(mockAuditLog);
    });

    it('should return null for invalid id', async () => {
      auditLogRepository.findOne.mockResolvedValue(null);

      const result = await service.getAuditLogById('invalid-id');
      expect(result).toBeNull();
    });
  });

  describe('getEntityAuditTrail', () => {
    it('should return audit trail for an entity', async () => {
      auditLogRepository.find.mockResolvedValue([mockAuditLog]);

      const result = await service.getEntityAuditTrail(
        'shipment',
        'shipment-uuid-1',
      );

      expect(result).toEqual([mockAuditLog]);
    });
  });

  describe('getUserActivityLogs', () => {
    it('should return user activity logs', async () => {
      auditLogRepository.find.mockResolvedValue([mockAuditLog]);

      const result = await service.getUserActivityLogs('user-uuid-1');

      expect(result).toEqual([mockAuditLog]);
    });
  });

  describe('getRecentLogs', () => {
    it('should return recent audit logs', async () => {
      auditLogRepository.find.mockResolvedValue([mockAuditLog]);

      const result = await service.getRecentLogs(5);

      expect(result).toEqual([mockAuditLog]);
    });
  });

  describe('deleteOldLogs', () => {
    it('should delete logs older than specified days', async () => {
      const result = await service.deleteOldLogs(90);

      expect(result).toBe(5);
    });
  });
});
