import { ContactSyncService } from './contact-sync.service';
export declare class ContactSyncEventsService {
    private contactSyncService;
    private readonly logger;
    constructor(contactSyncService: ContactSyncService);
    handleUserRegistered(event: {
        userId: string;
    }): Promise<void>;
    handleEnrollmentCreated(event: {
        userId: string;
        courseId: string;
    }): Promise<void>;
    handleProfileUpdated(event: {
        userId: string;
    }): Promise<void>;
    handleCourseCompleted(event: {
        userId: string;
        courseId: string;
    }): Promise<void>;
}
