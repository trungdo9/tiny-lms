import { Test, TestingModule } from '@nestjs/testing';
import { ContactSyncService } from './contact-sync.service';
import { ContactSyncLogService } from './contact-sync-log.service';
import { SettingsService } from '../settings/settings.service';
import { PrismaService } from '../../common/prisma.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/helpers/mock-prisma';

describe('ContactSyncService', () => {
  let service: ContactSyncService;
  let prisma: MockPrismaService;
  let settingsService: Record<string, jest.Mock>;
  let logService: Record<string, jest.Mock>;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    settingsService = {
      get: jest.fn(),
    };
    logService = {
      create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      markSuccess: jest.fn(),
      markFailed: jest.fn(),
      getStats: jest.fn().mockResolvedValue({ total: 0, success: 0, failed: 0, pending: 0 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactSyncService,
        { provide: PrismaService, useValue: prisma },
        { provide: SettingsService, useValue: settingsService },
        { provide: ContactSyncLogService, useValue: logService },
      ],
    }).compile();

    service = module.get<ContactSyncService>(ContactSyncService);
  });

  describe('isEnabled', () => {
    it('returns true when enabled', async () => {
      settingsService.get.mockResolvedValue({ value: 'true' });
      expect(await service.isEnabled()).toBe(true);
    });

    it('returns false when disabled', async () => {
      settingsService.get.mockResolvedValue({ value: 'false' });
      expect(await service.isEnabled()).toBe(false);
    });
  });

  describe('syncUser', () => {
    it('returns null when sync disabled', async () => {
      settingsService.get.mockResolvedValue({ value: 'false' });
      const result = await service.syncUser('user-1', 'register');
      expect(result).toBeNull();
    });

    it('returns null when provider is none', async () => {
      settingsService.get
        .mockResolvedValueOnce({ value: 'true' }) // enabled
        .mockResolvedValueOnce({ value: 'none' }); // provider
      const result = await service.syncUser('user-1', 'register');
      expect(result).toBeNull();
    });

    it('returns null when user not found', async () => {
      settingsService.get
        .mockResolvedValueOnce({ value: 'true' }) // enabled
        .mockResolvedValueOnce({ value: 'mailchimp' }) // provider
        .mockResolvedValueOnce({ value: 'key-us1' }) // api key
        .mockResolvedValueOnce({ value: 'list-1' }); // list id
      prisma.profile.findUnique.mockResolvedValue(null);
      const result = await service.syncUser('user-1', 'register');
      expect(result).toBeNull();
    });
  });

  describe('addEnrollmentTag', () => {
    it('returns early when course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await service.addEnrollmentTag('user-1', 'course-1', 'enroll');
      expect(logService.create).not.toHaveBeenCalled();
    });
  });

  describe('addCompletionTag', () => {
    it('returns early when course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      await service.addCompletionTag('user-1', 'course-1', 'completion');
      expect(logService.create).not.toHaveBeenCalled();
    });
  });

  describe('verifyConnection', () => {
    it('returns error when not enabled', async () => {
      settingsService.get.mockResolvedValue({ value: 'false' });
      const result = await service.verifyConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('not enabled');
    });
  });

  describe('getStatus', () => {
    it('returns status with stats', async () => {
      settingsService.get
        .mockResolvedValueOnce({ value: 'true' }) // enabled
        .mockResolvedValueOnce({ value: 'mailchimp' }); // provider
      logService.getStats.mockResolvedValue({ total: 10, success: 8, failed: 2, pending: 0 });
      prisma.contactSyncLog.findFirst.mockResolvedValue({ createdAt: new Date('2026-03-14') });

      const result = await service.getStatus();
      expect(result.enabled).toBe(true);
      expect(result.provider).toBe('mailchimp');
      expect(result.stats.total).toBe(10);
      expect(result.lastSync).toEqual(new Date('2026-03-14'));
    });
  });

  describe('bulkSync', () => {
    it('returns zeros when provider disabled', async () => {
      settingsService.get.mockResolvedValue({ value: 'false' });
      const result = await service.bulkSync();
      expect(result.total).toBe(0);
      expect(result.succeeded).toBe(0);
    });
  });
});
