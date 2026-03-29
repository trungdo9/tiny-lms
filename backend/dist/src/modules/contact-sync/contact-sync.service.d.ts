import { SettingsService } from '../settings/settings.service';
import { PrismaService } from '../../common/prisma.service';
import { ContactSyncLogService } from './contact-sync-log.service';
import { SyncResult, BatchSyncResult } from './providers/contact-sync-provider.interface';
export declare class ContactSyncService {
    private settingsService;
    private logService;
    private prisma;
    private readonly logger;
    constructor(settingsService: SettingsService, logService: ContactSyncLogService, prisma: PrismaService);
    isEnabled(): Promise<boolean>;
    private getProvider;
    private buildSyncContact;
    syncUser(userId: string, trigger: string): Promise<SyncResult | null>;
    addUserTags(userId: string, tags: string[], trigger: string): Promise<SyncResult | null>;
    removeUserTags(userId: string, tags: string[], trigger: string): Promise<SyncResult | null>;
    addEnrollmentTag(userId: string, courseId: string, trigger: string): Promise<void>;
    addCompletionTag(userId: string, courseId: string, trigger: string): Promise<void>;
    bulkSync(): Promise<BatchSyncResult>;
    verifyConnection(): Promise<{
        success: boolean;
        error?: string;
    }>;
    getStatus(): Promise<{
        enabled: boolean;
        provider: {};
        lastSync: Date | null;
        stats: {
            total: number;
            success: number;
            failed: number;
            pending: number;
        };
    }>;
}
