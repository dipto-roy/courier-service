import { AuthService } from './auth.service';
import { SignupDto, LoginDto, VerifyOtpDto, RefreshTokenDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(signupDto: SignupDto): Promise<{
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
    resendOtp(body: {
        email: string;
    }): Promise<{
        message: string;
        email: string;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(user: any): Promise<{
        message: string;
    }>;
    getProfile(user: any): Promise<{
        user: any;
    }>;
}
