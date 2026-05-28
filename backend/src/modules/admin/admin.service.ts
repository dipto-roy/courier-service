import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Shipment } from '../../entities/shipment.entity';
import { Transaction } from '../../entities/transaction.entity';
import { UsersService } from '../users/users.service';
import { FilterUserDto, UpdateUserDto } from '../users/dto';
import { UserRole } from '../../common/enums';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly usersService: UsersService,
  ) {}

  async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      totalShipments,
      pendingShipments,
      totalRevenue,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.shipmentRepository.count(),
      this.shipmentRepository.count({ where: { status: 'PENDING' as any } }),
      this.transactionRepository
        .createQueryBuilder('t')
        .select('SUM(t.amount)', 'total')
        .getRawOne<{ total: string }>(),
    ]);

    const usersByRole = await this.userRepository
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role')
      .getRawMany<{ role: UserRole; count: string }>();

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: Object.fromEntries(
          usersByRole.map((r) => [r.role, parseInt(r.count, 10)]),
        ),
      },
      shipments: {
        total: totalShipments,
        pending: pendingShipments,
      },
      revenue: {
        total: parseFloat(totalRevenue?.total ?? '0'),
      },
    };
  }

  async listUsers(filterDto: FilterUserDto) {
    return this.usersService.findAll(filterDto);
  }

  async assignRole(userId: string, dto: AssignRoleDto) {
    return this.usersService.update(userId, {
      role: dto.role,
    } as UpdateUserDto);
  }

  async deleteUser(userId: string) {
    return this.usersService.remove(userId);
  }

  async restoreUser(userId: string) {
    return this.usersService.restore(userId);
  }
}
