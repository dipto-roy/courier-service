import { ConfigService } from '@nestjs/config';
import { SendSmsDto } from './dto';
export declare class SmsService {
    private configService;
    private readonly logger;
    private readonly apiUrl;
    private readonly apiKey;
    private readonly senderId;
    constructor(configService: ConfigService);
    sendSms(smsDto: SendSmsDto): Promise<boolean>;
    private sendViaGateway;
    private sendViaTwilio;
    private sendViaSSLWireless;
    private sendViaNexmo;
    private sendViaGenericAPI;
    private renderTemplate;
    sendBulkSms(recipients: string[], message: string): Promise<boolean>;
    sendOtp(phone: string, otp: string): Promise<boolean>;
    sendDeliveryOtp(phone: string, awb: string, otp: string): Promise<boolean>;
}
