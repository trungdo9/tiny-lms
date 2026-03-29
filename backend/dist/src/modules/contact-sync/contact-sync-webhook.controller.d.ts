import { SettingsService } from '../settings/settings.service';
import { ContactSyncLogService } from './contact-sync-log.service';
export declare class ContactSyncWebhookController {
    private readonly settingsService;
    private readonly logService;
    private readonly logger;
    constructor(settingsService: SettingsService, logService: ContactSyncLogService);
    verifyMailchimp(): string;
    handleMailchimp(body: any, secret?: string): Promise<void>;
    handleBrevo(body: any, signature?: string): Promise<void>;
}
