import { NotificationType } from '../common/enums';
import { User } from './user.entity';
export declare class Notification {
    id: string;
    userId: string;
    shipmentId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: any;
    isRead: boolean;
    readAt: Date;
    sentAt: Date;
    deliveryStatus: string;
    errorMessage: string;
    createdAt: Date;
    user: User;
}
