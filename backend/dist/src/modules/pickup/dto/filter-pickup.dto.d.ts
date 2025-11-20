import { PaginationDto } from '../../../common/dto';
import { PickupStatus } from '../../../entities/pickup.entity';
export declare class FilterPickupDto extends PaginationDto {
    merchantId?: string;
    agentId?: string;
    status?: PickupStatus;
    pickupCity?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
}
