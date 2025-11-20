"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../entities");
const dto_1 = require("./dto");
const utils_1 = require("../../common/utils");
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        const existingUser = await this.userRepository.findOne({
            where: [
                { email: createUserDto.email },
                { phone: createUserDto.phone },
            ],
        });
        if (existingUser) {
            if (existingUser.email === createUserDto.email) {
                throw new common_1.ConflictException('Email already exists');
            }
            if (existingUser.phone === createUserDto.phone) {
                throw new common_1.ConflictException('Phone number already exists');
            }
        }
        const hashedPassword = await (0, utils_1.hashPassword)(createUserDto.password);
        const user = this.userRepository.create({
            ...createUserDto,
            name: createUserDto.fullName,
            password: hashedPassword,
        });
        return await this.userRepository.save(user);
    }
    async findAll(filterDto) {
        const { page = 1, limit = 10, search, role, isActive, isEmailVerified, isPhoneVerified, isKYCVerified, city } = filterDto;
        const skip = (page - 1) * limit;
        const where = {};
        if (role) {
            where.role = role;
        }
        if (typeof isActive === 'boolean') {
            where.isActive = isActive;
        }
        if (isEmailVerified !== undefined) {
            where.isVerified = isEmailVerified;
        }
        if (isPhoneVerified !== undefined) {
            where.isVerified = isPhoneVerified;
        }
        if (isKYCVerified !== undefined) {
            where.isKycVerified = isKYCVerified;
        }
        if (city) {
            where.city = city;
        }
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        Object.keys(where).forEach((key) => {
            queryBuilder.andWhere(`user.${key} = :${key}`, { [key]: where[key] });
        });
        if (search) {
            queryBuilder.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)', { search: `%${search}%` });
        }
        const totalItems = await queryBuilder.getCount();
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
    async findOne(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return await this.userRepository.findOne({ where: { email } });
    }
    async findByPhone(phone) {
        return await this.userRepository.findOne({ where: { phone } });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findByEmail(updateUserDto.email);
            if (existingUser) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
            const existingUser = await this.findByPhone(updateUserDto.phone);
            if (existingUser) {
                throw new common_1.ConflictException('Phone number already exists');
            }
        }
        if (updateUserDto.password) {
            updateUserDto.password = await (0, utils_1.hashPassword)(updateUserDto.password);
        }
        Object.assign(user, updateUserDto);
        return await this.userRepository.save(user);
    }
    async updateKYCStatus(id, kycDto) {
        const user = await this.findOne(id);
        user.isKycVerified = kycDto.isKYCVerified;
        return await this.userRepository.save(user);
    }
    async updateWallet(id, walletDto) {
        const user = await this.findOne(id);
        if (walletDto.operation === dto_1.WalletOperationType.CREDIT) {
            user.walletBalance += walletDto.amount;
        }
        else if (walletDto.operation === dto_1.WalletOperationType.DEBIT) {
            if (user.walletBalance < walletDto.amount) {
                throw new common_1.BadRequestException('Insufficient wallet balance');
            }
            user.walletBalance -= walletDto.amount;
        }
        return await this.userRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.softRemove(user);
    }
    async restore(id) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .withDeleted()
            .where('user.id = :id', { id })
            .getOne();
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        await this.userRepository.restore(id);
        return await this.findOne(id);
    }
    async getStatistics() {
        const totalUsers = await this.userRepository.count();
        const activeUsers = await this.userRepository.count({ where: { isActive: true } });
        const verifiedUsers = await this.userRepository.count({ where: { isVerified: true } });
        const kycVerifiedUsers = await this.userRepository.count({ where: { isKycVerified: true } });
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map