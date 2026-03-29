import { EmailProvider, SendEmailOptions } from './email-provider.interface';
export interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    fromName: string;
    fromEmail: string;
}
export declare class SmtpProvider implements EmailProvider {
    private config;
    private transporter;
    constructor(config: SmtpConfig);
    send(options: SendEmailOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
