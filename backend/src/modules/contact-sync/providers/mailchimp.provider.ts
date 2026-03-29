import * as crypto from 'crypto';
import mailchimp from '@mailchimp/mailchimp_marketing';
import {
  ContactSyncProvider,
  SyncContact,
  SyncResult,
  BatchSyncResult,
} from './contact-sync-provider.interface';

export interface MailchimpConfig {
  apiKey: string;
  listId: string;
}

export class MailchimpProvider implements ContactSyncProvider {
  private listId: string;

  constructor(config: MailchimpConfig) {
    const [key, server] = config.apiKey.split('-');
    mailchimp.setConfig({ apiKey: key, server: server || 'us1' });
    this.listId = config.listId;
  }

  private subscriberHash(email: string): string {
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  async upsertContact(contact: SyncContact): Promise<SyncResult> {
    try {
      const hash = this.subscriberHash(contact.email);
      const response = await mailchimp.lists.setListMember(this.listId, hash, {
        email_address: contact.email,
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: contact.firstName || '',
          LNAME: contact.lastName || '',
          ROLE: contact.role,
          ...(contact.customFields || {}),
        },
      });

      if (contact.tags.length > 0) {
        await mailchimp.lists.updateListMemberTags(this.listId, hash, {
          tags: contact.tags.map((name) => ({ name, status: 'active' })),
        });
      }

      return { success: true, externalId: (response as any).id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Mailchimp error',
      };
    }
  }

  async deleteContact(email: string): Promise<SyncResult> {
    try {
      const hash = this.subscriberHash(email);
      await mailchimp.lists.deleteListMember(this.listId, hash);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async addTags(email: string, tags: string[]): Promise<SyncResult> {
    try {
      const hash = this.subscriberHash(email);
      await mailchimp.lists.updateListMemberTags(this.listId, hash, {
        tags: tags.map((name) => ({ name, status: 'active' })),
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async removeTags(email: string, tags: string[]): Promise<SyncResult> {
    try {
      const hash = this.subscriberHash(email);
      await mailchimp.lists.updateListMemberTags(this.listId, hash, {
        tags: tags.map((name) => ({ name, status: 'inactive' })),
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async batchUpsertContacts(contacts: SyncContact[]): Promise<BatchSyncResult> {
    const result: BatchSyncResult = {
      total: contacts.length,
      succeeded: 0,
      failed: 0,
      errors: [],
    };

    const operations = contacts.map((contact) => ({
      method: 'PUT' as const,
      path: `/lists/${this.listId}/members/${this.subscriberHash(contact.email)}`,
      body: JSON.stringify({
        email_address: contact.email,
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: contact.firstName || '',
          LNAME: contact.lastName || '',
          ROLE: contact.role,
        },
      }),
    }));

    try {
      await (mailchimp as any).batches.start({ operations });
      result.succeeded = contacts.length;
    } catch (error) {
      result.failed = contacts.length;
      result.errors = contacts.map((c) => ({
        email: c.email,
        error: error instanceof Error ? error.message : 'Batch failed',
      }));
    }

    return result;
  }

  async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await mailchimp.ping.get();
      await (mailchimp.lists as any).getList(this.listId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}
