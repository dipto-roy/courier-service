import { UserRole } from '../../../common/enums';
export declare class CreateUserDto {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    city?: string;
    area?: string;
    address?: string;
    companyName?: string;
    businessWebsite?: string;
}
