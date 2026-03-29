# Phase 2: Brevo Provider + Event-Driven Sync Triggers

## Goal
Implement Brevo provider, wire up NestJS event emitter, and add event listeners that trigger contact sync on user actions.

---

## Step 1: Install Brevo SDK

```bash
cd backend
npm install @getbrevo/brevo
```

---

## Step 2: Implement Brevo Provider

File: `backend/src/modules/contact-sync/providers/brevo.provider.ts`

Config:
```typescript
export interface BrevoConfig {
  apiKey: string;
  listId: number; // Brevo uses numeric list IDs
}
```

Implementation details:
- Use `ContactsApi` from `@getbrevo/brevo`
- `upsertContact()`: `POST /contacts` with `updateEnabled: true`, attributes (FIRSTNAME, LASTNAME, ROLE), listIds
- `deleteContact()`: `DELETE /contacts/{email}`
- `addTags()` / `removeTags()`: Brevo does not have tags like Mailchimp. Use **contact attributes** (string field `TAGS` as comma-separated) or add/remove from named lists. Plan: use a string attribute `LMS_TAGS` stored as comma-separated values, updated via `PUT /contacts/{email}`
- `batchUpsertContacts()`: `POST /contacts/import` with JSON body (up to 8MB per request)
- `verifyConnection()`: `GET /account` to validate API key, then `GET /contacts/lists/{listId}` to validate list

Alternative for tags: create Brevo lists per tag. This is more complex but enables native Brevo segmentation. **Decision: use the simpler attribute-based approach first.** Admin can create Brevo segments based on attribute values.

---

## Step 3: Register EventEmitterModule

File: `backend/src/app.module.ts`

```typescript
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),  // Add this
    // ... existing modules
  ],
})
export class AppModule {}
```

---

## Step 4: Define Event Constants

File: `backend/src/modules/contact-sync/contact-sync.events.ts`

```typescript
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
```

---

## Step 5: Add Event Emits to Existing Services

Each change is a 2-line addition: inject `EventEmitter2`, call `this.eventEmitter.emit()`.

### 5a. AuthService — `register()`

File: `backend/src/modules/auth/auth.service.ts`

- Inject `EventEmitter2` in constructor
- After successful profile creation, emit:
```typescript
this.eventEmitter.emit('user.registered', { userId: data.user.id });
```

### 5b. EnrollmentsService — `enroll()` and `bulkEnroll()`

File: `backend/src/modules/enrollments/enrollments.service.ts`

- Inject `EventEmitter2`
- After `enrollment.create()`:
```typescript
this.eventEmitter.emit('enrollment.created', { userId, courseId });
```
- After `bulkEnroll()` createMany, emit for each new user:
```typescript
for (const uid of newUserIds) {
  this.eventEmitter.emit('enrollment.created', { userId: uid, courseId });
}
```

### 5c. UsersService — `updateProfile()`

File: `backend/src/modules/users/users.service.ts`

- Inject `EventEmitter2`
- After profile update:
```typescript
this.eventEmitter.emit('profile.updated', { userId });
```

### 5d. CertificatesService — `create()`

File: `backend/src/modules/certificates/certificates.service.ts`

- Inject `EventEmitter2`
- After certificate creation (which implies course completion):
```typescript
this.eventEmitter.emit('course.completed', { userId, courseId });
```

---

## Step 6: Create Event Listener Service

File: `backend/src/modules/contact-sync/contact-sync-events.service.ts`

```typescript
@Injectable()
export class ContactSyncEventsService {
  private readonly logger = new Logger(ContactSyncEventsService.name);

  constructor(private contactSyncService: ContactSyncService) {}

  @OnEvent('user.registered', { async: true })
  async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    // syncUser builds tags from profile data (role tag included automatically)
    await this.contactSyncService.syncUser(event.userId, 'register');
  }

  @OnEvent('enrollment.created', { async: true })
  async handleEnrollmentCreated(event: EnrollmentCreatedEvent): Promise<void> {
    // Look up course slug, add tag 'enrolled:course-slug'
    await this.contactSyncService.addEnrollmentTag(event.userId, event.courseId, 'enroll');
  }

  @OnEvent('profile.updated', { async: true })
  async handleProfileUpdated(event: ProfileUpdatedEvent): Promise<void> {
    // Full re-sync of contact data (name, email, role may have changed)
    await this.contactSyncService.syncUser(event.userId, 'profile_update');
  }

  @OnEvent('course.completed', { async: true })
  async handleCourseCompleted(event: CourseCompletedEvent): Promise<void> {
    // Add 'completed:course-slug', remove 'enrolled:course-slug'
    await this.contactSyncService.addCompletionTag(event.userId, event.courseId, 'completion');
  }
}
```

All listeners use `{ async: true }` — fire-and-forget, no blocking on the original request.

---

## Step 7: Add Helper Methods to ContactSyncService

File: `backend/src/modules/contact-sync/contact-sync.service.ts`

Add two new methods:

```typescript
async addEnrollmentTag(userId: string, courseId: string, trigger: string): Promise<void> {
  // 1. Look up course slug
  // 2. Call addUserTags(userId, [`enrolled:${slug}`], trigger)
}

async addCompletionTag(userId: string, courseId: string, trigger: string): Promise<void> {
  // 1. Look up course slug
  // 2. Call addUserTags(userId, [`completed:${slug}`], trigger)
  // 3. Call removeUserTags(userId, [`enrolled:${slug}`], trigger)
}
```

---

## Step 8: Update Module Registration

File: `backend/src/modules/contact-sync/contact-sync.module.ts`

Add `ContactSyncEventsService` to providers.

File: `backend/src/modules/auth/auth.module.ts` (and enrollments, users, certificates modules)

Add `EventEmitter2` — no module import needed, `@nestjs/event-emitter` is global when registered with `forRoot()`.

---

## Step 9: Unit Tests

File: `backend/src/modules/contact-sync/providers/brevo.provider.spec.ts`

- `upsertContact()` calls ContactsApi with correct attributes and listIds
- `deleteContact()` calls ContactsApi.deleteContact
- `addTags()` updates LMS_TAGS attribute
- `verifyConnection()` calls getAccount + getList
- Error handling returns `{ success: false }`

File: `backend/src/modules/contact-sync/contact-sync-events.service.spec.ts`

- Each `@OnEvent` handler calls the correct ContactSyncService method
- Errors in sync do not propagate (caught and logged)
- When sync is disabled, handlers return early without error

---

## Deliverables Checklist

- [x] `@getbrevo/brevo` installed
- [x] `BrevoProvider` implemented and tested
- [x] `EventEmitterModule.forRoot()` registered in AppModule
- [x] Event constants and payload interfaces defined
- [x] Event emits added to AuthService, EnrollmentsService, UsersService, CertificatesService
- [x] `ContactSyncEventsService` with 4 event listeners
- [x] `addEnrollmentTag()` and `addCompletionTag()` helpers on ContactSyncService
- [x] Unit tests for Brevo provider and event listeners
