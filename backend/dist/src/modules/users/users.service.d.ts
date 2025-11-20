import { Repository } from 'typeorm';
import { User } from '../../entities';
import { CreateUserDto, UpdateUserDto, FilterUserDto, KYCVerificationDto, WalletUpdateDto } from './dto';
import { PaginatedResponseDto } from '../../common/dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(filterDto: FilterUserDto): Promise<PaginatedResponseDto<User>>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    updateKYCStatus(id: string, kycDto: KYCVerificationDto): Promise<User>;
    updateWallet(id: string, walletDto: WalletUpdateDto): Promise<User>;
    remove(id: string): Promise<void>;
    restore(id: string): Promise<User>;
    getStatistics(): Promise<{
        totalUsers: number;
        activeUsers: number;
        verifiedUsers: number;
        kycVerifiedUsers: number;
        roleStats: any[];
    }>;
}
