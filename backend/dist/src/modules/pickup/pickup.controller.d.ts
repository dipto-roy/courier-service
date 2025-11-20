import { PickupService } from './pickup.service';
import { CreatePickupDto, AssignPickupDto, CompletePickupDto, UpdatePickupDto, FilterPickupDto } from './dto';
import { User } from '../../entities/user.entity';
export declare class PickupController {
    private readonly pickupService;
    constructor(pickupService: PickupService);
    create(createPickupDto: CreatePickupDto, user: User): Promise<import("../../entities").Pickup>;
    findAll(filterDto: FilterPickupDto, user: User): Promise<import("../../common/dto").PaginatedResponseDto<import("../../entities").Pickup>>;
    getStatistics(user: User): Promise<any>;
    getAgentTodayPickups(user: User): Promise<import("../../entities").Pickup[]>;
    findOne(id: string, user: User): Promise<import("../../entities").Pickup>;
    update(id: string, updatePickupDto: UpdatePickupDto, user: User): Promise<import("../../entities").Pickup>;
    assignPickup(id: string, assignPickupDto: AssignPickupDto): Promise<import("../../entities").Pickup>;
    startPickup(id: string, user: User): Promise<import("../../entities").Pickup>;
    completePickup(id: string, completePickupDto: CompletePickupDto, user: User): Promise<import("../../entities").Pickup>;
    cancelPickup(id: string, user: User): Promise<import("../../entities").Pickup>;
}
