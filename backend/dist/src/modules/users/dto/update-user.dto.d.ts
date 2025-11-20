import { UserRole } from '../../../common/enums';
export declare class UpdateUserDto {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: UserRole;
    city?: string;
    area?: string;
    address?: string;
    companyName?: string;
    businessWebsite?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    isActive?: boolean;
    walletBalance?: number;
}
