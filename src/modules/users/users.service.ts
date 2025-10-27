import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { User } from '../../entities';
import { CreateUserDto, UpdateUserDto, FilterUserDto, KYCVerificationDto, WalletUpdateDto, WalletOperationType } from './dto';
import { PaginatedResponseDto } from '../../common/dto';
import { hashPassword } from '../../common/utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email or phone already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { phone: createUserDto.phone },
      ],
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.phone === createUserDto.phone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(createUserDto.password);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  /**
   * Get all users with pagination and filters
   */
  async findAll(filterDto: FilterUserDto): Promise<PaginatedResponseDto<User>> {
    const { page = 1, limit = 10, search, role, isActive, isEmailVerified, isPhoneVerified, isKYCVerified, city } = filterDto;
    
    const skip = (page - 1) * limit;
    
    // Build where conditions
    const where: FindOptionsWhere<User> = {};
    
    if (role) {
      where.role = role;
    }
    
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }
    
    if (isEmailVerified !== undefined) {
      where.isVerified = isEmailVerified; // Using isVerified as the entity field
    }

    if (isPhoneVerified !== undefined) {
      where.isVerified = isPhoneVerified; // Using isVerified as the entity field
    }

    if (isKYCVerified !== undefined) {
      where.isKycVerified = isKYCVerified;
    }    if (city) {
      where.city = city;
    }

    // Create query builder for search
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    
    // Apply filters
    Object.keys(where).forEach((key) => {
      queryBuilder.andWhere(`user.${key} = :${key}`, { [key]: where[key] });
    });
    
    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(user.fullName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    
    // Get total count
    const totalItems = await queryBuilder.getCount();
    
    // Get paginated data
    const data = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get user by ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * Get user by phone
   */
  async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { phone } });
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If updating email or phone, check for conflicts
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingUser = await this.findByPhone(updateUserDto.phone);
      if (existingUser) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // Hash password if updating
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    // Update user
    Object.assign(user, updateUserDto);
    
    return await this.userRepository.save(user);
  }

  /**
   * Update KYC verification status
   */
  async updateKYCStatus(id: string, kycDto: KYCVerificationDto): Promise<User> {
    const user = await this.findOne(id);

    user.isKycVerified = kycDto.isKYCVerified;

    return await this.userRepository.save(user);
  }

  /**
   * Update wallet balance
   */
  async updateWallet(id: string, walletDto: WalletUpdateDto): Promise<User> {
    const user = await this.findOne(id);

    if (walletDto.operation === WalletOperationType.CREDIT) {
      user.walletBalance += walletDto.amount;
    } else if (walletDto.operation === WalletOperationType.DEBIT) {
      if (user.walletBalance < walletDto.amount) {
        throw new BadRequestException('Insufficient wallet balance');
      }
      user.walletBalance -= walletDto.amount;
    }

    return await this.userRepository.save(user);
  }

  /**
   * Soft delete user
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
  }

  /**
   * Restore soft deleted user
   */
  async restore(id: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .withDeleted()
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.restore(id);
    return await this.findOne(id);
  }

  /**
   * Get user statistics by role
   */
  async getStatistics() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { isActive: true } });
    const verifiedUsers = await this.userRepository.count({ where: { isVerified: true } });
    const kycVerifiedUsers = await this.userRepository.count({ where: { isKycVerified: true } });

    // Count by role
    const roleStats = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      kycVerifiedUsers,
      roleStats,
    };
  }
}
