import { Test, TestingModule } from '@nestjs/testing';
import { ContactSyncWebhookController } from './contact-sync-webhook.controller';
import { ContactSyncLogService } from './contact-sync-log.service';
import { SettingsService } from '../settings/settings.service';

describe('ContactSyncWebhookController', () => {
  let controller: ContactSyncWebhookController;
  let settingsService: Record<string, jest.Mock>;
  let logService: Record<string, jest.Mock>;

  beforeEach(async () => {
    settingsService = {
      get: jest.fn(),
    };
    logService = {
      create: jest.fn().mockResolvedValue({ id: 'log-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactSyncWebhookController],
      providers: [
        { provide: SettingsService, useValue: settingsService },
        { provide: ContactSyncLogService, useValue: logService },
      ],
    }).compile();

    controller = module.get<ContactSyncWebhookController>(ContactSyncWebhookController);
  });

  describe('verifyMailchimp', () => {
    it('returns OK', () => {
      expect(controller.verifyMailchimp()).toBe('OK');
    });
  });

  describe('handleMailchimp', () => {
    it('creates log for unsubscribe with valid secret', async () => {
      settingsService.get.mockResolvedValue({ value: 'my-secret' });

      await controller.handleMailchimp(
        { type: 'unsubscribe', data: { email: 'user@test.com', reason: 'manual' } },
        'my-secret',
      );

      expect(logService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@test.com',
          provider: 'mailchimp',
          operation: 'webhook_event',
          trigger: 'webhook',
        }),
      );
    });

    it('ignores with invalid secret', async () => {
      settingsService.get.mockResolvedValue({ value: 'my-secret' });

      await controller.handleMailchimp(
        { type: 'unsubscribe', data: { email: 'user@test.com' } },
        'wrong-secret',
      );

      expect(logService.create).not.toHaveBeenCalled();
    });

    it('creates log for cleaned event', async () => {
      settingsService.get.mockResolvedValue({ value: 'secret' });

      await controller.handleMailchimp(
        { type: 'cleaned', data: { email: 'bounce@test.com', reason: 'hard' } },
        'secret',
      );

      expect(logService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'bounce@test.com',
          payload: { type: 'cleaned', reason: 'hard' },
        }),
      );
    });

    it('ignores unknown event types', async () => {
      settingsService.get.mockResolvedValue({ value: 'secret' });

      await controller.handleMailchimp(
        { type: 'subscribe', data: { email: 'user@test.com' } },
        'secret',
      );

      expect(logService.create).not.toHaveBeenCalled();
    });
  });

  describe('handleBrevo', () => {
    it('creates log for unsubscribed event', async () => {
      settingsService.get.mockResolvedValue({ value: '' }); // no secret configured

      await controller.handleBrevo(
        { event: 'unsubscribed', email: 'user@test.com', reason: 'user' },
        undefined,
      );

      expect(logService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@test.com',
          provider: 'brevo',
          operation: 'webhook_event',
        }),
      );
    });

    it('creates log for hard_bounce event', async () => {
      settingsService.get.mockResolvedValue({ value: '' });

      await controller.handleBrevo(
        { event: 'hard_bounce', email: 'invalid@test.com' },
        undefined,
      );

      expect(logService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'invalid@test.com',
          provider: 'brevo',
        }),
      );
    });

    it('rejects missing signature when secret configured', async () => {
      settingsService.get.mockResolvedValue({ value: 'brevo-secret' });

      await controller.handleBrevo(
        { event: 'unsubscribed', email: 'user@test.com' },
        undefined,
      );

      expect(logService.create).not.toHaveBeenCalled();
    });

    it('ignores when no email in payload', async () => {
      settingsService.get.mockResolvedValue({ value: '' });

      await controller.handleBrevo({ event: 'unsubscribed' }, undefined);

      expect(logService.create).not.toHaveBeenCalled();
    });
  });
});
