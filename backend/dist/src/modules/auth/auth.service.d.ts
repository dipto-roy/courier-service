import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { SignupDto, LoginDto, VerifyOtpDto, RefreshTokenDto } from './dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly configService;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService);
    signup(signupDto: SignupDto): Promise<{
        message: string;
        email: string;
        phone: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
            role: import("../../common/enums").UserRole;
            isActive: boolean;
            isVerified: boolean;
            isKycVerified: boolean;
            twoFaEnabled: boolean;
            walletBalance: number;
            address: string;
            city: string;
            area: string;
            postalCode: string;
            latitude: string;
            longitude: string;
            hubId: string;
            merchantBusinessName: string;
            merchantTradeLicense: string;
            profileImage: string;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            shipments: import("../../entities").Shipment[];
            pickups: import("../../entities").Pickup[];
            riderLocations: import("../../entities").RiderLocation[];
            transactions: import("../../entities").Transaction[];
        };
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
            role: import("../../common/enums").UserRole;
            isActive: boolean;
            isVerified: boolean;
            isKycVerified: boolean;
            twoFaEnabled: boolean;
            walletBalance: number;
            address: string;
            city: string;
            area: string;
            postalCode: string;
            latitude: string;
            longitude: string;
            hubId: string;
            merchantBusinessName: string;
            merchantTradeLicense: string;
            profileImage: string;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            shipments: import("../../entities").Shipment[];
            pickups: import("../../entities").Pickup[];
            riderLocations: import("../../entities").RiderLocation[];
            transactions: import("../../entities").Transaction[];
        };
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    private sanitizeUser;
    validateUser(userId: string): Promise<User | null>;
}
