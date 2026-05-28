import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RiderService } from './rider.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Shipment } from '../../entities/shipment.entity';
import { Manifest } from '../../entities/manifest.entity';
import { RiderLocation } from '../../entities/rider-location.entity';
import { User } from '../../entities/user.entity';
import { UserRole, ShipmentStatus } from '../../common/enums';

describe('RiderService', () => {
  let service: RiderService;
  let shipmentRepository: any;
  let riderLocationRepository: any;

  const mockRider: Partial<User> = {
    id: 'rider-uuid-1',
    name: 'Test Rider',
    role: UserRole.RIDER,
    isActive: true,
  };

  const mockShipment: Partial<Shipment> = {
    id: 'shipment-uuid-1',
    awb: 'FX1234567890',
    status: ShipmentStatus.OUT_FOR_DELIVERY,
    riderId: 'rider-uuid-1',
    receiverName: 'Customer',
    receiverPhone: '01812345678',
    codAmount: 1500,
    deliveryAttempts: 0,
  };

  const mockLocation: Partial<RiderLocation> = {
    id: 'loc-uuid-1',
    riderId: 'rider-uuid-1',
    latitude: 23.8103,
    longitude: 90.4125,
    accuracy: 10,
    speed: 30,
    heading: 90,
    createdAt: new Date(),
    isOnline: true,
  };

  const createQueryBuilderMock: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
    getCount: jest.fn().mockResolvedValue(0),
    getRawOne: jest.fn().mockResolvedValue({ totalCod: '0' }),
    getRawMany: jest.fn().mockResolvedValue([]),
    clone: jest.fn(),
  };
  // Make clone return a fresh mock with same chains
  createQueryBuilderMock.clone.mockReturnValue(createQueryBuilderMock);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiderService,
        {
          provide: getRepositoryToken(Shipment),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => createQueryBuilderMock),
          },
        },
        {
          provide: getRepositoryToken(Manifest),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => createQueryBuilderMock),
          },
        },
        {
          provide: getRepositoryToken(RiderLocation),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockReturnValue(mockLocation),
            save: jest.fn().mockResolvedValue(mockLocation),
            createQueryBuilder: jest.fn(() => createQueryBuilderMock),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createAndSend: jest.fn().mockResolvedValue(undefined),
            sendNotification: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<RiderService>(RiderService);
    shipmentRepository = module.get(getRepositoryToken(Shipment));
    riderLocationRepository = module.get(getRepositoryToken(RiderLocation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMyShipments', () => {
    it('should return rider assigned shipments', async () => {
      shipmentRepository.find.mockResolvedValue([mockShipment]);

      const result = await service.getMyShipments('rider-uuid-1');

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('shipments');
    });
  });

  describe('completeDelivery', () => {
    it('should mark shipment as delivered with valid OTP', async () => {
      const shipmentWithOtp = {
        ...mockShipment,
        otpCode: '123456',
        paymentMethod: 'cod',
        merchant: { id: 'merchant-uuid-1' },
      };
      const delivered = {
        ...shipmentWithOtp,
        status: ShipmentStatus.DELIVERED,
        actualDeliveryDate: new Date(),
      };
      shipmentRepository.findOne.mockResolvedValue(shipmentWithOtp);
      shipmentRepository.save.mockResolvedValue(delivered);

      const result = await service.completeDelivery(
        {
          awbNumber: 'FX1234567890',
          otpCode: '123456',
          codAmountCollected: 1500,
        } as any,
        mockRider as User,
      );

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException for invalid AWB', async () => {
      shipmentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.completeDelivery(
          { awbNumber: 'INVALID', otpCode: '123456' } as any,
          mockRider as User,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('recordFailedDelivery', () => {
    it('should record a failed delivery attempt', async () => {
      const failed = {
        ...mockShipment,
        deliveryAttempts: 1,
        failedReason: 'Customer not available',
      };
      shipmentRepository.findOne.mockResolvedValue(mockShipment);
      shipmentRepository.save.mockResolvedValue(failed);

      const result = await service.recordFailedDelivery(
        {
          awbNumber: 'FX1234567890',
          reason: 'Customer not available',
        } as any,
        mockRider as User,
      );

      expect(result.success).toBe(true);
    });
  });

  describe('updateLocation', () => {
    it('should update rider GPS location', async () => {
      const result = await service.updateLocation(
        {
          latitude: 23.8103,
          longitude: 90.4125,
          accuracy: 10,
          speed: 30,
          heading: 90,
        } as any,
        mockRider as User,
      );

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('location');
      expect(riderLocationRepository.save).toHaveBeenCalled();
    });
  });

  describe('getLocationHistory', () => {
    it('should return rider location history', async () => {
      riderLocationRepository.find.mockResolvedValue([mockLocation]);

      const result = await service.getLocationHistory('rider-uuid-1', 10);

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('locations');
    });
  });

  describe('markRTO', () => {
    it('should mark shipment as RTO', async () => {
      const rto = {
        ...mockShipment,
        isRto: true,
        rtoReason: 'Multiple failed attempts',
        status: ShipmentStatus.RTO_INITIATED,
      };
      shipmentRepository.findOne.mockResolvedValue({
        ...mockShipment,
        deliveryAttempts: 3,
      });
      shipmentRepository.save.mockResolvedValue(rto);

      const result = await service.markRTO(
        {
          awbNumber: 'FX1234567890',
          reason: 'Multiple failed attempts',
        } as any,
        mockRider as User,
      );

      expect(result.success).toBe(true);
    });
  });

  describe('getMyStatistics', () => {
    it('should return rider statistics', async () => {
      shipmentRepository.count.mockResolvedValue(50);

      const result = await service.getMyStatistics('rider-uuid-1');

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('statistics');
    });
  });
});
