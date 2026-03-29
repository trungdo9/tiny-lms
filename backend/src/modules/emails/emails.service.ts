import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { EmailTemplatesService } from './templates/email-templates.service';
import { EmailLogsService } from './logs/email-logs.service';
import { EmailProvider, SendEmailOptions } from './providers/email-provider.interface';
import { SmtpProvider, SmtpConfig } from './providers/smtp.provider';
import { ResendProvider, ResendConfig } from './providers/resend.provider';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);

  constructor(
    private settingsService: SettingsService,
    private templatesService: EmailTemplatesService,
    private logsService: EmailLogsService,
  ) {}

  // Creates a fresh provider from current settings on every call.
  // Caching was removed to ensure settings changes take effect immediately.
  private async getProvider(): Promise<EmailProvider> {
    const providerType = await this.settingsService.get('email_provider');
    const value = providerType?.value as string;

    if (value === 'resend') {
      const apiKey = await this.settingsService.get('resend_api_key');
      const fromName = await this.settingsService.get('email_from_name');
      const fromEmail = await this.settingsService.get('email_from_email');

      const config: ResendConfig = {
        apiKey: apiKey?.value as string,
        fromName: (fromName?.value as string) || 'Tiny LMS',
        fromEmail: (fromEmail?.value as string) || 'noreply@tinylms.com',
      };

      this.logger.log('Using Resend email provider');
      return new ResendProvider(config);
    } else {
      // Default to SMTP
      const smtpHost = await this.settingsService.get('email_smtp_host');
      const smtpPort = await this.settingsService.get('email_smtp_port');
      const smtpUser = await this.settingsService.get('email_smtp_user');
      const smtpPass = await this.settingsService.get('email_smtp_pass');
      const smtpSecure = await this.settingsService.get('email_smtp_secure');
      const fromName = await this.settingsService.get('email_from_name');
      const fromEmail = await this.settingsService.get('email_from_email');

      const config: SmtpConfig = {
        host: (smtpHost?.value as string) || 'smtp.gmail.com',
        port: Number(smtpPort?.value) || 587,
        user: (smtpUser?.value as string) || '',
        pass: (smtpPass?.value as string) || '',
        secure: smtpSecure?.value === 'true' || smtpSecure?.value === true,
        fromName: (fromName?.value as string) || 'Tiny LMS',
        fromEmail: (fromEmail?.value as string) || 'noreply@tinylms.com',
      };

      this.logger.log('Using SMTP email provider');
      return new SmtpProvider(config);
    }
  }

  async send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const provider = await this.getProvider();
      const result = await provider.send(options);

      if (result.success) {
        this.logger.log(`Email sent successfully to ${options.to}`);
      } else {
        this.logger.error(`Failed to send email: ${result.error}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Email send error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  // Send email using a template
  async sendWithTemplate(
    templateSlug: string,
    to: string | string[],
    variables: Record<string, string>,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Get template
      const template = await this.templatesService.findBySlug(templateSlug);

      // Render template with variables
      const { subject, body } = this.templatesService.render(
        { subject: template.subject, body: template.body },
        variables,
      );

      // Get common settings for fallback
      const siteName = await this.settingsService.get('site_name');
      const siteUrl = await this.settingsService.get('site_url');
      const footerText = await this.settingsService.get('brand_footer_text');

      // Add common variables if not present
      const enrichedVars = {
        site_name: (siteName?.value as string) || 'Tiny LMS',
        site_url: (siteUrl?.value as string) || '',
        footer_text: (footerText?.value as string) || '',
        ...variables,
      };

      // Re-render with enriched variables
      const finalRendered = this.templatesService.render(
        { subject: template.subject, body: template.body },
        enrichedVars,
      );

      // Create log entry
      const log = await this.logsService.create({
        templateSlug,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: finalRendered.subject,
        body: finalRendered.body,
        status: 'pending',
      });

      // Send email
      const result = await this.send({
        to,
        subject: finalRendered.subject,
        html: finalRendered.body,
      });

      // Update log
      if (result.success) {
        await this.logsService.markAsSent(log.id, result.messageId || '');
      } else {
        await this.logsService.markAsFailed(log.id, result.error || 'Unknown error');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email with template: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }
}
