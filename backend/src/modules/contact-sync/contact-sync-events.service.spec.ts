import { Test, TestingModule } from '@nestjs/testing';
import { ContactSyncEventsService } from './contact-sync-events.service';
import { ContactSyncService } from './contact-sync.service';

describe('ContactSyncEventsService', () => {
  let eventsService: ContactSyncEventsService;
  let syncService: Record<string, jest.Mock>;

  beforeEach(async () => {
    syncService = {
      syncUser: jest.fn().mockResolvedValue({ success: true }),
      addEnrollmentTag: jest.fn().mockResolvedValue(undefined),
      addCompletionTag: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactSyncEventsService,
        { provide: ContactSyncService, useValue: syncService },
      ],
    }).compile();

    eventsService = module.get<ContactSyncEventsService>(ContactSyncEventsService);
  });

  describe('handleUserRegistered', () => {
    it('calls syncUser with register trigger', async () => {
      await eventsService.handleUserRegistered({ userId: 'user-1' });
      expect(syncService.syncUser).toHaveBeenCalledWith('user-1', 'register');
    });

    it('does not throw on sync error', async () => {
      syncService.syncUser.mockRejectedValue(new Error('Provider error'));
      await expect(eventsService.handleUserRegistered({ userId: 'user-1' })).resolves.not.toThrow();
    });
  });

  describe('handleEnrollmentCreated', () => {
    it('calls addEnrollmentTag', async () => {
      await eventsService.handleEnrollmentCreated({ userId: 'user-1', courseId: 'course-1' });
      expect(syncService.addEnrollmentTag).toHaveBeenCalledWith('user-1', 'course-1', 'enroll');
    });

    it('does not throw on sync error', async () => {
      syncService.addEnrollmentTag.mockRejectedValue(new Error('fail'));
      await expect(
        eventsService.handleEnrollmentCreated({ userId: 'user-1', courseId: 'course-1' }),
      ).resolves.not.toThrow();
    });
  });

  describe('handleProfileUpdated', () => {
    it('calls syncUser with profile_update trigger', async () => {
      await eventsService.handleProfileUpdated({ userId: 'user-1' });
      expect(syncService.syncUser).toHaveBeenCalledWith('user-1', 'profile_update');
    });
  });

  describe('handleCourseCompleted', () => {
    it('calls addCompletionTag', async () => {
      await eventsService.handleCourseCompleted({ userId: 'user-1', courseId: 'course-1' });
      expect(syncService.addCompletionTag).toHaveBeenCalledWith('user-1', 'course-1', 'completion');
    });
  });
});
