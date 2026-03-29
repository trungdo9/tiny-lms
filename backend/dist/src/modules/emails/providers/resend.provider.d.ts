import { EmailProvider, SendEmailOptions } from './email-provider.interface';
export interface ResendConfig {
    apiKey: string;
    fromName: string;
    fromEmail: string;
}
export declare class ResendProvider implements EmailProvider {
    private config;
    private resend;
    constructor(config: ResendConfig);
    send(options: SendEmailOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
