export declare const CONTACT_SYNC_EVENTS: {
    readonly USER_REGISTERED: "user.registered";
    readonly ENROLLMENT_CREATED: "enrollment.created";
    readonly PROFILE_UPDATED: "profile.updated";
    readonly COURSE_COMPLETED: "course.completed";
};
export interface UserRegisteredEvent {
    userId: string;
}
export interface EnrollmentCreatedEvent {
    userId: string;
    courseId: string;
}
export interface ProfileUpdatedEvent {
    userId: string;
}
export interface CourseCompletedEvent {
    userId: string;
    courseId: string;
}
