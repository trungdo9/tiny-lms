import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { PrismaService } from '../../common/prisma.service';
import { ContactSyncLogService } from './contact-sync-log.service';
import {
  ContactSyncProvider,
  SyncContact,
  SyncResult,
  BatchSyncResult,
} from './providers/contact-sync-provider.interface';
import { MailchimpProvider } from './providers/mailchimp.provider';
import { BrevoProvider } from './providers/brevo.provider';

@Injectable()
export class ContactSyncService {
  private readonly logger = new Logger(ContactSyncService.name);

  constructor(
    private settingsService: SettingsService,
    private logService: ContactSyncLogService,
    private prisma: PrismaService,
  ) {}

  async isEnabled(): Promise<boolean> {
    const enabled = await this.settingsService.get('contact_sync_enabled');
    return enabled?.value === 'true' || enabled?.value === true;
  }

  private async getProvider(): Promise<ContactSyncProvider | null> {
    if (!(await this.isEnabled())) return null;

    const providerSetting = await this.settingsService.get('contact_sync_provider');
    const provider = providerSetting?.value as string;

    if (provider === 'mailchimp') {
      const apiKey = await this.settingsService.get('mailchimp_api_key');
      const listId = await this.settingsService.get('mailchimp_list_id');
      if (!apiKey?.value || !listId?.value) return null;
      this.logger.log('Using Mailchimp contact sync provider');
      return new MailchimpProvider({
        apiKey: apiKey.value as string,
        listId: listId.value as string,
      });
    }

    if (provider === 'brevo') {
      const apiKey = await this.settingsService.get('brevo_api_key');
      const listId = await this.settingsService.get('brevo_list_id');
      if (!apiKey?.value || !listId?.value) return null;
      this.logger.log('Using Brevo contact sync provider');
      return new BrevoProvider({
        apiKey: apiKey.value as string,
        listId: Number(listId.value),
      });
    }

    return null;
  }

  private async buildSyncContact(userId: string): Promise<SyncContact | null> {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true },
    });
    if (!user?.email) return null;

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      select: { course: { select: { slug: true } } },
    });

    const completedCerts = await this.prisma.certificate.findMany({
      where: { userId },
      select: { course: { select: { slug: true } } },
    });

    const nameParts = (user.fullName || '').split(' ');
    const tags = [
      `role:${user.role}`,
      ...enrollments.map((e) => `enrolled:${e.course.slug}`),
      ...completedCerts.filter((c) => c.course).map((c) => `completed:${c.course!.slug}`),
    ];

    return {
      email: user.email,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      role: user.role,
      tags,
    };
  }

  async syncUser(userId: string, trigger: string): Promise<SyncResult | null> {
    const provider = await this.getProvider();
    if (!provider) return null;

    const contact = await this.buildSyncContact(userId);
    if (!contact) return null;

    const providerName = (await this.settingsService.get('contact_sync_provider'))?.value as string;
    const log = await this.logService.create({
      userId,
      email: contact.email,
      provider: providerName,
      operation: 'upsert',
      trigger,
    });

    const result = await provider.upsertContact(contact);

    if (result.success) {
      await this.logService.markSuccess(log.id, result.externalId);
      this.logger.log(`Synced user ${contact.email} to ${providerName}`);
    } else {
      await this.logService.markFailed(log.id, result.error || 'Unknown error');
      this.logger.error(`Failed to sync ${contact.email}: ${result.error}`);
    }

    return result;
  }

  async addUserTags(userId: string, tags: string[], trigger: string): Promise<SyncResult | null> {
    const provider = await this.getProvider();
    if (!provider) return null;

    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user?.email) return null;

    const providerName = (await this.settingsService.get('contact_sync_provider'))?.value as string;
    const log = await this.logService.create({
      userId,
      email: user.email,
      provider: providerName,
      operation: 'add_tags',
      trigger,
      payload: { tags },
    });

    const result = await provider.addTags(user.email, tags);

    if (result.success) {
      await this.logService.markSuccess(log.id);
    } else {
      await this.logService.markFailed(log.id, result.error || 'Unknown error');
    }

    return result;
  }

  async removeUserTags(userId: string, tags: string[], trigger: string): Promise<SyncResult | null> {
    const provider = await this.getProvider();
    if (!provider) return null;

    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user?.email) return null;

    const providerName = (await this.settingsService.get('contact_sync_provider'))?.value as string;
    const log = await this.logService.create({
      userId,
      email: user.email,
      provider: providerName,
      operation: 'remove_tags',
      trigger,
      payload: { tags },
    });

    const result = await provider.removeTags(user.email, tags);

    if (result.success) {
      await this.logService.markSuccess(log.id);
    } else {
      await this.logService.markFailed(log.id, result.error || 'Unknown error');
    }

    return result;
  }

  async addEnrollmentTag(userId: string, courseId: string, trigger: string): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { slug: true },
    });
    if (!course) return;
    await this.addUserTags(userId, [`enrolled:${course.slug}`], trigger);
  }

  async addCompletionTag(userId: string, courseId: string, trigger: string): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { slug: true },
    });
    if (!course) return;
    await this.addUserTags(userId, [`completed:${course.slug}`], trigger);
    await this.removeUserTags(userId, [`enrolled:${course.slug}`], trigger);
  }

  async bulkSync(): Promise<BatchSyncResult> {
    const provider = await this.getProvider();
    if (!provider) return { total: 0, succeeded: 0, failed: 0, errors: [] };

    const providerName = (await this.settingsService.get('contact_sync_provider'))?.value as string;

    const users = await this.prisma.profile.findMany({
      where: { isActive: true, email: { not: null } },
      select: { id: true, email: true, fullName: true, role: true },
    });

    const userIds = users.map((u) => u.id);

    // Batch load to avoid N+1
    const allEnrollments = await this.prisma.enrollment.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, course: { select: { slug: true } } },
    });
    const allCerts = await this.prisma.certificate.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, course: { select: { slug: true } } },
    });

    const enrollmentsByUser = new Map<string, string[]>();
    for (const e of allEnrollments) {
      const list = enrollmentsByUser.get(e.userId) || [];
      list.push(e.course.slug);
      enrollmentsByUser.set(e.userId, list);
    }
    const certsByUser = new Map<string, string[]>();
    for (const c of allCerts) {
      const list = certsByUser.get(c.userId) || [];
      if (c.course) list.push(c.course.slug);
      certsByUser.set(c.userId, list);
    }

    const contacts: SyncContact[] = users
      .filter((u) => u.email)
      .map((u) => {
        const nameParts = (u.fullName || '').split(' ');
        return {
          email: u.email!,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          role: u.role,
          tags: [
            `role:${u.role}`,
            ...(enrollmentsByUser.get(u.id) || []).map((s) => `enrolled:${s}`),
            ...(certsByUser.get(u.id) || []).map((s) => `completed:${s}`),
          ],
        };
      });

    const BATCH_SIZE = 500;
    const BATCH_DELAY_MS = 1000;
    let totalSucceeded = 0;
    let totalFailed = 0;
    const allErrors: { email: string; error: string }[] = [];

    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);
      const result = await provider.batchUpsertContacts(batch);
      totalSucceeded += result.succeeded;
      totalFailed += result.failed;
      allErrors.push(...result.errors);

      if (i + BATCH_SIZE < contacts.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    await this.logService.create({
      email: 'bulk-sync',
      provider: providerName,
      operation: 'batch',
      trigger: 'bulk_sync',
      status: totalFailed === 0 ? 'success' : 'failed',
      payload: { total: contacts.length, succeeded: totalSucceeded, failed: totalFailed },
    });

    this.logger.log(`Bulk sync complete: ${totalSucceeded}/${contacts.length} succeeded`);
    return { total: contacts.length, succeeded: totalSucceeded, failed: totalFailed, errors: allErrors };
  }

  async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    const provider = await this.getProvider();
    if (!provider) return { success: false, error: 'Contact sync is not enabled or configured' };
    return provider.verifyConnection();
  }

  async getStatus() {
    const enabled = await this.isEnabled();
    const providerSetting = await this.settingsService.get('contact_sync_provider');
    const stats = await this.logService.getStats();
    const lastSync = await this.prisma.contactSyncLog.findFirst({
      where: { status: 'success' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      enabled,
      provider: providerSetting?.value || 'none',
      lastSync: lastSync?.createdAt || null,
      stats,
    };
  }
}
