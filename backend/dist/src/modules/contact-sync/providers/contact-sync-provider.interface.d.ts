export interface SyncContact {
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    tags: string[];
    customFields?: Record<string, string>;
}
export interface SyncResult {
    success: boolean;
    externalId?: string;
    error?: string;
}
export interface BatchSyncResult {
    total: number;
    succeeded: number;
    failed: number;
    errors: {
        email: string;
        error: string;
    }[];
}
export interface ContactSyncProvider {
    upsertContact(contact: SyncContact): Promise<SyncResult>;
    deleteContact(email: string): Promise<SyncResult>;
    addTags(email: string, tags: string[]): Promise<SyncResult>;
    removeTags(email: string, tags: string[]): Promise<SyncResult>;
    batchUpsertContacts(contacts: SyncContact[]): Promise<BatchSyncResult>;
    verifyConnection(): Promise<{
        success: boolean;
        error?: string;
    }>;
}
