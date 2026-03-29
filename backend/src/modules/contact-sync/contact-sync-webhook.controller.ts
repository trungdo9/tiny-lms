import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { Request } from 'express';
import { SettingsService } from '../settings/settings.service';
import { ContactSyncLogService } from './contact-sync-log.service';

@ApiTags('contact-sync')
@Controller('contact-sync/webhooks')
export class ContactSyncWebhookController {
  private readonly logger = new Logger(ContactSyncWebhookController.name);

  constructor(
    private readonly settingsService: SettingsService,
    private readonly logService: ContactSyncLogService,
  ) {}

  /**
   * Mailchimp sends GET to verify webhook URL during setup.
   */
  @Get('mailchimp')
  verifyMailchimp(): string {
    return 'OK';
  }

  /**
   * Mailchimp webhook receiver.
   * Webhook URL: /contact-sync/webhooks/mailchimp?secret=<webhook_secret>
   */
  @Post('mailchimp')
  @HttpCode(HttpStatus.OK)
  async handleMailchimp(
    @Body() body: any,
    @Query('secret') secret?: string,
  ): Promise<void> {
    const storedSecret = await this.settingsService.get('mailchimp_webhook_secret');
    if (!storedSecret?.value || storedSecret.value !== secret) {
      this.logger.warn('Mailchimp webhook: invalid secret');
      return;
    }

    const type = body?.type;
    const email = body?.data?.email || body?.data?.merges?.EMAIL;

    if (!email) {
      this.logger.warn('Mailchimp webhook: no email in payload');
      return;
    }

    if (type === 'unsubscribe' || type === 'cleaned') {
      await this.logService.create({
        email,
        provider: 'mailchimp',
        operation: 'webhook_event',
        trigger: 'webhook',
        status: 'success',
        payload: { type, reason: body?.data?.reason },
      });
      this.logger.log(`Mailchimp webhook: ${type} for ${email}`);
    }
  }

  /**
   * Brevo webhook receiver.
   * Validates HMAC-SHA256 signature from x-sib-signature header.
   */
  @Post('brevo')
  @HttpCode(HttpStatus.OK)
  async handleBrevo(
    @Body() body: any,
    @Headers('x-sib-signature') signature?: string,
  ): Promise<void> {
    const storedSecret = await this.settingsService.get('brevo_webhook_secret');

    if (storedSecret?.value && signature) {
      // Use JSON.stringify of parsed body — Brevo sends compact JSON
      const expectedSignature = crypto
        .createHmac('sha256', storedSecret.value as string)
        .update(JSON.stringify(body))
        .digest('hex');

      // Timing-safe comparison to prevent timing oracle attacks
      try {
        const sigBuf = Buffer.from(signature, 'hex');
        const expBuf = Buffer.from(expectedSignature, 'hex');
        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
          this.logger.warn('Brevo webhook: invalid signature');
          return;
        }
      } catch {
        this.logger.warn('Brevo webhook: invalid signature format');
        return;
      }
    } else if (storedSecret?.value && !signature) {
      this.logger.warn('Brevo webhook: missing signature');
      return;
    }

    const event = body?.event;
    const email = body?.email;

    if (!email) {
      this.logger.warn('Brevo webhook: no email in payload');
      return;
    }

    if (event === 'unsubscribed' || event === 'hard_bounce') {
      await this.logService.create({
        email,
        provider: 'brevo',
        operation: 'webhook_event',
        trigger: 'webhook',
        status: 'success',
        payload: { event, reason: body?.reason },
      });
      this.logger.log(`Brevo webhook: ${event} for ${email}`);
    }
  }
}
