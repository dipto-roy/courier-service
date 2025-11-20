import { UserRole } from '../../../common/enums';
export declare class SignupDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    city?: string;
    area?: string;
    address?: string;
    merchantBusinessName?: string;
}
