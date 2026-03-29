import { ContactSyncService } from './contact-sync.service';
import { ContactSyncLogService } from './contact-sync-log.service';
export declare class ContactSyncController {
    private readonly syncService;
    private readonly logService;
    private readonly logger;
    constructor(syncService: ContactSyncService, logService: ContactSyncLogService);
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
    verifyConnection(): Promise<{
        success: boolean;
        error?: string;
    }>;
    getLogs(page?: string, limit?: string, status?: string, provider?: string, trigger?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            email: string;
            status: string;
            userId: string | null;
            errorMessage: string | null;
            provider: string;
            operation: string;
            trigger: string;
            payload: import("@prisma/client/runtime/client").JsonValue | null;
            externalId: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLogStats(): Promise<{
        total: number;
        success: number;
        failed: number;
        pending: number;
    }>;
    bulkSync(): Promise<{
        message: string;
    }>;
    syncUser(userId: string): Promise<import("./providers/contact-sync-provider.interface").SyncResult | {
        message: string;
    }>;
}
