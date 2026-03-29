import { ContactSyncProvider, SyncContact, SyncResult, BatchSyncResult } from './contact-sync-provider.interface';
export interface BrevoConfig {
    apiKey: string;
    listId: number;
}
export declare class BrevoProvider implements ContactSyncProvider {
    private apiKey;
    private listId;
    private baseUrl;
    constructor(config: BrevoConfig);
    private request;
    upsertContact(contact: SyncContact): Promise<SyncResult>;
    deleteContact(email: string): Promise<SyncResult>;
    addTags(email: string, tags: string[]): Promise<SyncResult>;
    removeTags(email: string, tags: string[]): Promise<SyncResult>;
    private getContactTags;
    batchUpsertContacts(contacts: SyncContact[]): Promise<BatchSyncResult>;
    verifyConnection(): Promise<{
        success: boolean;
        error?: string;
    }>;
}
