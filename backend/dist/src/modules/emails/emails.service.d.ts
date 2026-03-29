import { SettingsService } from '../settings/settings.service';
import { EmailTemplatesService } from './templates/email-templates.service';
import { EmailLogsService } from './logs/email-logs.service';
import { SendEmailOptions } from './providers/email-provider.interface';
export declare class EmailsService {
    private settingsService;
    private templatesService;
    private logsService;
    private readonly logger;
    constructor(settingsService: SettingsService, templatesService: EmailTemplatesService, logsService: EmailLogsService);
    private getProvider;
    send(options: SendEmailOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    sendWithTemplate(templateSlug: string, to: string | string[], variables: Record<string, string>): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
