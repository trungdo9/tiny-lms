import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  private shouldUseSupabaseFallback(error: any) {
    return ['ENETUNREACH', 'P1001'].includes(error?.code)
      || /ENETUNREACH|Can't reach database server|connect ENETUNREACH/i.test(String(error?.message || ''));
  }

  async get(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) return null;
    return this.parseValue(setting);
  }

  async set(key: string, value: unknown, type = 'string', isSecret = false) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value: stringValue, type, isSecret },
      update: { value: stringValue, type, isSecret },
    });
  }

  async getByCategory(category: string) {
    const settings = await this.prisma.setting.findMany({ where: { category } });
    return settings.map(s => this.parseValue(s));
  }

  async getPublic() {
    try {
      const settings = await this.prisma.setting.findMany({
        where: { category: 'branding' },
      });
      const result: Record<string, unknown> = {};
      for (const s of settings) {
        if (!s.isSecret) {
          result[s.key] = this.parseValue(s).value;
        }
      }
      return result;
    } catch (error) {
      if (!this.shouldUseSupabaseFallback(error)) throw error;

      const { data, error: supabaseError } = await this.supabaseService.adminClient
        .from('settings')
        .select('key,value,type,isSecret')
        .eq('category', 'branding');

      if (supabaseError) throw supabaseError;

      const result: Record<string, unknown> = {};
      for (const s of data || []) {
        if (!s.isSecret) {
          result[s.key] = this.parseValue({
            key: s.key,
            value: s.value,
            type: s.type,
            isSecret: s.isSecret,
          }).value;
        }
      }
      return result;
    }
  }

  async getAll() {
    const settings = await this.prisma.setting.findMany();
    return settings.map(s => ({
      ...this.parseValue(s),
      value: s.isSecret ? '***' : this.parseValue(s).value,
    }));
  }

  async delete(key: string) {
    await this.prisma.setting.delete({ where: { key } });
    return { success: true };
  }

  private parseValue(setting: { key: string; value: string | null; type: string; isSecret?: boolean }) {
    let value: unknown = setting.value;
    if (setting.type === 'number') {
      value = Number(setting.value);
    } else if (setting.type === 'boolean') {
      value = setting.value === 'true';
    } else if (setting.type === 'json') {
      try {
        value = JSON.parse(setting.value || '{}');
      } catch {
        value = {};
      }
    }
    return { key: setting.key, value, type: setting.type, isSecret: setting.isSecret };
  }

  // Seed default settings
  async seedDefaults() {
    const defaults = [
      // General
      { key: 'site_name', value: 'Tiny LMS', type: 'string', category: 'general' },
      { key: 'site_url', value: '', type: 'string', category: 'general' },
      { key: 'site_description', value: '', type: 'string', category: 'general' },
      // White Label
      { key: 'brand_name', value: 'Tiny LMS', type: 'string', category: 'branding' },
      { key: 'brand_logo', value: '', type: 'string', category: 'branding' },
      { key: 'brand_favicon', value: '', type: 'string', category: 'branding' },
      { key: 'brand_primary_color', value: '#3b82f6', type: 'string', category: 'branding' },
      { key: 'brand_secondary_color', value: '#8b5cf6', type: 'string', category: 'branding' },
      { key: 'brand_accent_color', value: '#10b981', type: 'string', category: 'branding' },
      { key: 'brand_text_color', value: '#1f2937', type: 'string', category: 'branding' },
      { key: 'brand_background_color', value: '#ffffff', type: 'string', category: 'branding' },
      { key: 'brand_login_image', value: '', type: 'string', category: 'branding' },
      { key: 'brand_login_bg_color', value: '#f8fafc', type: 'string', category: 'branding' },
      { key: 'brand_og_image', value: '', type: 'string', category: 'branding' },
      { key: 'brand_dark_mode', value: 'false', type: 'boolean', category: 'branding' },
      { key: 'brand_login_message', value: '', type: 'string', category: 'branding' },
      { key: 'brand_footer_text', value: '© 2024 Tiny LMS', type: 'string', category: 'branding' },
      { key: 'brand_terms_url', value: '', type: 'string', category: 'branding' },
      { key: 'brand_privacy_url', value: '', type: 'string', category: 'branding' },
      { key: 'brand_facebook_url', value: '', type: 'string', category: 'branding' },
      { key: 'brand_twitter_url', value: '', type: 'string', category: 'branding' },
      { key: 'brand_instagram_url', value: '', type: 'string', category: 'branding' },
      { key: 'brand_youtube_url', value: '', type: 'string', category: 'branding' },
      { key: 'brand_custom_css', value: '', type: 'string', category: 'branding' },
      // Email
      { key: 'email_provider', value: 'smtp', type: 'string', category: 'email' },
      { key: 'email_smtp_host', value: 'smtp.gmail.com', type: 'string', category: 'email' },
      { key: 'email_smtp_port', value: '587', type: 'number', category: 'email' },
      { key: 'email_smtp_user', value: '', type: 'string', category: 'email' },
      { key: 'email_smtp_pass', value: '', type: 'string', category: 'email', isSecret: true },
      { key: 'email_smtp_secure', value: 'false', type: 'boolean', category: 'email' },
      { key: 'email_from_name', value: 'Tiny LMS', type: 'string', category: 'email' },
      { key: 'email_from_email', value: 'noreply@tinylms.com', type: 'string', category: 'email' },
      { key: 'resend_api_key', value: '', type: 'string', category: 'email', isSecret: true },
      // Contact Sync
      { key: 'contact_sync_provider', value: 'none', type: 'string', category: 'contact_sync' },
      { key: 'contact_sync_enabled', value: 'false', type: 'boolean', category: 'contact_sync' },
      { key: 'mailchimp_api_key', value: '', type: 'string', category: 'contact_sync', isSecret: true },
      { key: 'mailchimp_list_id', value: '', type: 'string', category: 'contact_sync' },
      { key: 'mailchimp_webhook_secret', value: '', type: 'string', category: 'contact_sync', isSecret: true },
      { key: 'brevo_api_key', value: '', type: 'string', category: 'contact_sync', isSecret: true },
      { key: 'brevo_list_id', value: '', type: 'string', category: 'contact_sync' },
      { key: 'brevo_webhook_secret', value: '', type: 'string', category: 'contact_sync', isSecret: true },
      // Auth
      { key: 'auth.require_email_verification', value: 'false', type: 'boolean', category: 'auth' },
      // Analytics
      { key: 'analytics_ga_code', value: '', type: 'string', category: 'analytics', isSecret: false },
    ];

    for (const s of defaults) {
      await this.prisma.setting.upsert({
        where: { key: s.key },
        create: { key: s.key, value: s.value, type: s.type, category: s.category, isSecret: s.isSecret || false },
        update: {},
      });
    }

    return { seeded: defaults.length };
  }
}
