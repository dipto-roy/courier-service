import { PaginationDto } from '../../../common/dto';
import { UserRole } from '../../../common/enums';
export declare class FilterUserDto extends PaginationDto {
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    isKYCVerified?: boolean;
    city?: string;
}
