import { ConfigService } from '@nestjs/config';
import { SendEmailDto } from './dto';
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendEmail(emailDto: SendEmailDto): Promise<boolean>;
    private renderTemplate;
    private shipmentCreatedTemplate;
    private shipmentPickedUpTemplate;
    private shipmentInTransitTemplate;
    private shipmentOutForDeliveryTemplate;
    private shipmentDeliveredTemplate;
    private shipmentFailedTemplate;
    private shipmentRtoTemplate;
    private otpVerificationTemplate;
    private passwordResetTemplate;
    private payoutInitiatedTemplate;
    private payoutCompletedTemplate;
    private defaultTemplate;
    verifyConnection(): Promise<boolean>;
}
