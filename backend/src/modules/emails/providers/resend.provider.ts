import { Resend } from 'resend';
import { EmailProvider, SendEmailOptions } from './email-provider.interface';

export interface ResendConfig {
  apiKey: string;
  fromName: string;
  fromEmail: string;
}

export class ResendProvider implements EmailProvider {
  private resend: Resend;

  constructor(private config: ResendConfig) {
    this.resend = new Resend(config.apiKey);
  }

  async send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const from = options.from || `${this.config.fromName} <${this.config.fromEmail}>`;
      const to = Array.isArray(options.to) ? options.to : [options.to];

      const data = await this.resend.emails.send({
        from,
        to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (data.error) {
        return { success: false, error: data.error.message };
      }

      return { success: true, messageId: data.data?.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
