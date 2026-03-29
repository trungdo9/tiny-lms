import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ContactSyncService } from './contact-sync.service';
import { CONTACT_SYNC_EVENTS } from './contact-sync.events';

@Injectable()
export class ContactSyncEventsService {
  private readonly logger = new Logger(ContactSyncEventsService.name);

  constructor(private contactSyncService: ContactSyncService) {}

  @OnEvent(CONTACT_SYNC_EVENTS.USER_REGISTERED, { async: true })
  async handleUserRegistered(event: { userId: string }): Promise<void> {
    try {
      await this.contactSyncService.syncUser(event.userId, 'register');
    } catch (error) {
      this.logger.error(`Failed to sync registered user ${event.userId}:`, error);
    }
  }

  @OnEvent(CONTACT_SYNC_EVENTS.ENROLLMENT_CREATED, { async: true })
  async handleEnrollmentCreated(event: { userId: string; courseId: string }): Promise<void> {
    try {
      await this.contactSyncService.addEnrollmentTag(event.userId, event.courseId, 'enroll');
    } catch (error) {
      this.logger.error(`Failed to sync enrollment for user ${event.userId}:`, error);
    }
  }

  @OnEvent(CONTACT_SYNC_EVENTS.PROFILE_UPDATED, { async: true })
  async handleProfileUpdated(event: { userId: string }): Promise<void> {
    try {
      await this.contactSyncService.syncUser(event.userId, 'profile_update');
    } catch (error) {
      this.logger.error(`Failed to sync profile update for user ${event.userId}:`, error);
    }
  }

  @OnEvent(CONTACT_SYNC_EVENTS.COURSE_COMPLETED, { async: true })
  async handleCourseCompleted(event: { userId: string; courseId: string }): Promise<void> {
    try {
      await this.contactSyncService.addCompletionTag(event.userId, event.courseId, 'completion');
    } catch (error) {
      this.logger.error(`Failed to sync course completion for user ${event.userId}:`, error);
    }
  }
}
