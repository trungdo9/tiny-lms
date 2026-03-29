import * as nodemailer from 'nodemailer';
import { EmailProvider, SendEmailOptions } from './email-provider.interface';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  fromName: string;
  fromEmail: string;
}

export class SmtpProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor(private config: SmtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure || config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const from = options.from || `${this.config.fromName} <${this.config.fromEmail}>`;
      const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;

      const info = await this.transporter.sendMail({
        from,
        to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
