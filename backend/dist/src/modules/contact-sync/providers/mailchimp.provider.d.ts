import { ContactSyncProvider, SyncContact, SyncResult, BatchSyncResult } from './contact-sync-provider.interface';
export interface MailchimpConfig {
    apiKey: string;
    listId: string;
}
export declare class MailchimpProvider implements ContactSyncProvider {
    private listId;
    constructor(config: MailchimpConfig);
    private subscriberHash;
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
