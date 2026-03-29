export const CONTACT_SYNC_EVENTS = {
  USER_REGISTERED: 'user.registered',
  ENROLLMENT_CREATED: 'enrollment.created',
  PROFILE_UPDATED: 'profile.updated',
  COURSE_COMPLETED: 'course.completed',
} as const;

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
