import { ShipmentStatus } from '../../../common/enums';
export declare class UpdateStatusDto {
    status: ShipmentStatus;
    remarks?: string;
    location?: string;
}
