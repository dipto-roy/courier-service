import { Repository } from 'typeorm';
import { Pickup } from '../../entities/pickup.entity';
import { Shipment } from '../../entities/shipment.entity';
import { User } from '../../entities/user.entity';
import { PaginatedResponseDto } from '../../common/dto';
import { CreatePickupDto, AssignPickupDto, CompletePickupDto, UpdatePickupDto, FilterPickupDto } from './dto';
export declare class PickupService {
    private readonly pickupRepository;
    private readonly shipmentRepository;
    private readonly userRepository;
    constructor(pickupRepository: Repository<Pickup>, shipmentRepository: Repository<Shipment>, userRepository: Repository<User>);
    create(createPickupDto: CreatePickupDto, merchant: User): Promise<Pickup>;
    findAll(filterDto: FilterPickupDto, user: User): Promise<PaginatedResponseDto<Pickup>>;
    findOne(id: string, user: User): Promise<Pickup>;
    update(id: string, updatePickupDto: UpdatePickupDto, user: User): Promise<Pickup>;
    assignPickup(id: string, assignPickupDto: AssignPickupDto): Promise<Pickup>;
    startPickup(id: string, user: User): Promise<Pickup>;
    completePickup(id: string, completePickupDto: CompletePickupDto, user: User): Promise<Pickup>;
    cancelPickup(id: string, user: User): Promise<Pickup>;
    getStatistics(user: User): Promise<any>;
    getAgentTodayPickups(user: User): Promise<Pickup[]>;
}
