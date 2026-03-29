# Contact Sync Module Scout Report

**Date:** 2026-03-14  
**Objective:** Comprehensive file listing for contact-sync module implementation reference

## Summary

All requested files related to contact-sync module have been located and read. The contact-sync module is partially implemented with service infrastructure, event handling, and provider integrations (Mailchimp and Brevo). Missing components are the frontend settings page and full administrative UI.

---

## 1. Contact Sync Directory Structure

### Existing Files in `backend/src/modules/contact-sync/`

- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/contact-sync/contact-sync.module.ts` - Module definition, imports SettingsModule, exports ContactSyncService
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/contact-sync/contact-sync.service.ts` - Core service handling sync logic, provider management, contact building
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/contact-sync/contact-sync.controller.ts` - REST endpoints: status, verify, logs, stats, manual sync
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/contact-sync/contact-sync.events.ts` - Event definitions (USER_REGISTERED, ENROLLMENT_CREATED, PROFILE_UPDATED, COURSE_COMPLETED)
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/contact-sync/contact-sync-events.service.ts` - Event listeners that trigger sync operations
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/contact-sync/contact-sync-log.service.ts` - ContactSyncLog persistence and querying
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/contact-sync/providers/contact-sync-provider.interface.ts` - Abstract provider interface
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/contact-sync/providers/mailchimp.provider.ts` - Mailchimp API implementation
- `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/contact-sync/providers/brevo.provider.ts` - Brevo API implementation

---

## 2. Database Schema

### ContactSyncLog Model
**File:** `/home/trung/workspace/project/private/tiny-lms/backend/prisma/schema.prisma` (lines 539-560)

```prisma
model ContactSyncLog {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String?  @map("user_id") @db.Uuid
  email        String
  provider     String // "mailchimp" | "brevo"
  operation    String // "upsert" | "delete" | "add_tags" | "remove_tags" | "batch"
  trigger      String // "register" | "enroll" | "profile_update" | "completion" | "bulk_sync" | "webhook"
  status       String   @default("pending") // "pending" | "success" | "failed"
  errorMessage String?  @map("error_message") @db.Text
  payload      Json?
  externalId   String?  @map("external_id")
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([status])
  @@index([provider])
  @@index([createdAt])
  @@schema("public")
  @@map("contact_sync_logs")
}
```

### Related Models
- **Profile Model** (lines 13-48): email, fullName, role, isActive, createdAt, updatedAt
- **Enrollment Model** (lines 182-196): userId, courseId, enrolledAt, completedAt
- **Certificate Model** (lines 471-486): userId, courseId, issuedAt

---

## 3. Settings Configuration

### File: `backend/src/modules/settings/settings.service.ts`

**Key Methods:**
- `get(key)` - Retrieves single setting by key with type parsing
- `set(key, value, type, isSecret)` - Upserts setting with type support
- `getByCategory(category)` - Fetches all settings in category
- `getPublic()` - Returns public (non-secret) settings in 'branding' category
- `seedDefaults()` - Initializes default settings

**Default Contact Sync Settings** (lines 109-117):
```typescript
{ key: 'contact_sync_provider', value: 'none', type: 'string', category: 'contact_sync' },
{ key: 'contact_sync_enabled', value: 'false', type: 'boolean', category: 'contact_sync' },
{ key: 'mailchimp_api_key', value: '', type: 'string', category: 'contact_sync', isSecret: true },
{ key: 'mailchimp_list_id', value: '', type: 'string', category: 'contact_sync' },
{ key: 'mailchimp_webhook_secret', value: '', type: 'string', category: 'contact_sync', isSecret: true },
{ key: 'brevo_api_key', value: '', type: 'string', category: 'contact_sync', isSecret: true },
{ key: 'brevo_list_id', value: '', type: 'string', category: 'contact_sync' },
{ key: 'brevo_webhook_secret', value: '', type: 'string', category: 'contact_sync', isSecret: true },
```

---

## 4. Event Emission Points

### File: `backend/src/modules/contact-sync/contact-sync.events.ts`

Defined event types:
- `CONTACT_SYNC_EVENTS.USER_REGISTERED` = 'user.registered'
- `CONTACT_SYNC_EVENTS.ENROLLMENT_CREATED` = 'enrollment.created'
- `CONTACT_SYNC_EVENTS.PROFILE_UPDATED` = 'profile.updated'
- `CONTACT_SYNC_EVENTS.COURSE_COMPLETED` = 'course.completed'

**Event Emission Locations:**

1. **Auth Service** (`backend/src/modules/auth/auth.service.ts`, line 49)
   - Emits `USER_REGISTERED` after successful profile creation

2. **Enrollments Service** (`backend/src/modules/enrollments/enrollments.service.ts`, lines 54, 147)
   - Emits `ENROLLMENT_CREATED` in `enroll()` and `bulkEnroll()`

3. **Users Service** (`backend/src/modules/users/users.service.ts`, line 53)
   - Emits `PROFILE_UPDATED` in `updateProfile()`

4. **Certificates Service** (`backend/src/modules/certificates/certificates.service.ts`, line 53)
   - Emits `COURSE_COMPLETED` after certificate creation

---

## 5. Email Module Structure (Reference Pattern)

### File: `backend/src/modules/emails/emails.module.ts`

```typescript
@Module({
  imports: [SettingsModule],
  controllers: [EmailsController],
  providers: [EmailsService, EmailTemplatesService, EmailLogsService, PrismaService],
  exports: [EmailsService, EmailTemplatesService, EmailLogsService],
})
export class EmailsModule {}
```

**Pattern to follow:**
- Import SettingsModule for config access
- Export primary service for use in other modules
- Separate concerns into dedicated services (Templates, Logs, main service)

---

## 6. Module Registration

### File: `backend/src/app.module.ts`

**Contact Sync Module Imported** (line 33, 72):
```typescript
import { ContactSyncModule } from './modules/contact-sync/contact-sync.module';
...
ContactSyncModule,
```

---

## 7. Authentication & Authorization Patterns

### File: `backend/src/common/guards/roles.guard.ts`

**Usage in ContactSyncController:**
```typescript
@Controller('contact-sync')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ContactSyncController { ... }
```

**Pattern:**
- Use `@UseGuards(JwtAuthGuard, RolesGuard)` on controller
- Use `@Roles(Role.ADMIN)` to restrict to specific roles
- Roles enum: 'student', 'instructor', 'admin'

---

## 8. Frontend Settings Pages Structure

### Files in `frontend/app/admin/settings/`

- `/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/settings/layout.tsx` - Tab navigation layout
- `/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/settings/page.tsx` - General settings
- `/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/settings/email/page.tsx` - Email provider configuration
- `/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/settings/email/email-setting-field.tsx` - Reusable setting field component
- `/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/settings/branding/page.tsx` - Branding settings
- `/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/settings/auth/page.tsx` - Auth settings
- `/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/settings/organization/page.tsx` - Organization info
- `/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/settings/departments/page.tsx` - Departments management
- `/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/settings/email/templates/page.tsx` - Email templates editor
- `/home/trung/workspace/project/private/tiny-lms/frontend/app/admin/settings/email/logs/page.tsx` - Email delivery logs

### Navigation Tabs (layout.tsx, lines 6-15)
Current tabs: General, Email, Templates, Logs, Branding, Auth, Organization, Departments

**Missing:** Contact Sync tab (needs to be added)

### Email Settings Page Pattern (`email/page.tsx`)

**Pattern to follow:**
1. `useState` for settings array, loading, saving states, messages
2. `useEffect` to fetch settings on mount with `settingsApi.getByCategory('email')`
3. `updateSetting()` method with error handling and refetch
4. Filter settings by category/prefix
5. Conditional rendering based on current provider value
6. Show success/error messages
7. "Seed" button for initial setup if empty
8. Provider selection buttons with active state styling
9. Test input (send test email)

---

## 9. Frontend API Patterns

### File: `frontend/lib/api.ts`

**Settings API** (lines 203-219):
```typescript
export const settingsApi = {
  getAll: () => fetchApi('/settings'),
  getPublic: () => fetchApi('/settings/public'),
  getByCategory: (category: string) => fetchApi(`/settings/category/${category}`),
  get: (key: string) => fetchApi(`/settings/${key}`),
  update: (key: string, data: { value: unknown; type?: string }) =>
    fetchApi(`/settings/${key}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (key: string) => fetchApi(`/settings/${key}`, { method: 'DELETE' }),
  seed: () => fetchApi('/settings/seed', { method: 'POST' }),
};
```

**Fetch Implementation** (lines 20-45):
- Auto-adds Authorization header from Supabase session
- Uses `API_URL` environment variable
- Throws on non-OK responses
- Returns JSON response

---

## 10. Frontend Query Key Patterns

### File: `frontend/lib/query-keys.ts`

**Pattern for new feature:**
```typescript
contact_sync: {
  status: () => ['contact-sync', 'status'] as const,
  logs: (params?: object) => ['contact-sync', 'logs', params] as const,
  stats: () => ['contact-sync', 'stats'] as const,
}
```

---

## 11. Provider Interface & Implementation

### Contact Sync Provider Interface
**File:** `backend/src/modules/contact-sync/providers/contact-sync-provider.interface.ts`

```typescript
export interface ContactSyncProvider {
  upsertContact(contact: SyncContact): Promise<SyncResult>;
  deleteContact(email: string): Promise<SyncResult>;
  addTags(email: string, tags: string[]): Promise<SyncResult>;
  removeTags(email: string, tags: string[]): Promise<SyncResult>;
  batchUpsertContacts(contacts: SyncContact[]): Promise<BatchSyncResult>;
  verifyConnection(): Promise<{ success: boolean; error?: string }>;
}

export interface SyncContact {
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  tags: string[];
  customFields?: Record<string, string>;
}
```

### Mailchimp Implementation
**File:** `backend/src/modules/contact-sync/providers/mailchimp.provider.ts`

- Uses `@mailchimp/mailchimp_marketing` package (v3.0.80)
- Parses API key to extract key and server: `apiKey.split('-')`
- Uses MD5 hash of email for subscriber operations
- Tags mapped to format: `{ name, status: 'active'|'inactive' }`

### Brevo Implementation
**File:** `backend/src/modules/contact-sync/providers/brevo.provider.ts`

- Uses native fetch with API key in headers
- Base URL: `https://api.brevo.com/v3`
- Tags stored in `LMS_TAGS` attribute as comma-separated string
- Batch import via `/contacts/import` endpoint

---

## 12. Backend Dependencies

### File: `backend/package.json` (relevant packages)

**Contact Sync Related:**
```json
"@mailchimp/mailchimp_marketing": "^3.0.80",
"@getbrevo/brevo": "^4.0.1",
"nodemailer": "^8.0.1"
```

**NestJS Core:**
```json
"@nestjs/common": "^11.0.1",
"@nestjs/core": "^11.0.1",
"@nestjs/event-emitter": "^3.0.1",
"@nestjs/jwt": "^11.0.2",
```

**Database:**
```json
"@prisma/client": "^7.4.1",
"pg": "^8.19.0"
```

---

## 13. Contact Sync Service Methods

### File: `backend/src/modules/contact-sync/contact-sync.service.ts`

**Public Methods:**

1. `isEnabled()` - Checks if contact sync is enabled
2. `getProvider()` - Returns configured provider instance or null
3. `buildSyncContact(userId)` - Fetches user data and builds sync payload with tags
4. `syncUser(userId, trigger)` - Full upsert operation with logging
5. `addUserTags(userId, tags, trigger)` - Add tags to contact
6. `removeUserTags(userId, tags, trigger)` - Remove tags from contact
7. `addEnrollmentTag(userId, courseId, trigger)` - Add course enrollment tag
8. `addCompletionTag(userId, courseId, trigger)` - Replace enrollment with completion tag
9. `verifyConnection()` - Test provider credentials
10. `getStatus()` - Returns enabled state, provider, last sync time, stats

**Tag Format:**
- Role tags: `role:student`, `role:instructor`, `role:admin`
- Enrollment tags: `enrolled:course-slug`
- Completion tags: `completed:course-slug`

---

## 14. Contact Sync Event Listeners

### File: `backend/src/modules/contact-sync/contact-sync-events.service.ts`

**Event Handlers:**

1. `@OnEvent(USER_REGISTERED)` - Calls `syncUser(userId, 'register')`
2. `@OnEvent(ENROLLMENT_CREATED)` - Calls `addEnrollmentTag(userId, courseId, 'enroll')`
3. `@OnEvent(PROFILE_UPDATED)` - Calls `syncUser(userId, 'profile_update')`
4. `@OnEvent(COURSE_COMPLETED)` - Calls `addCompletionTag(userId, courseId, 'completion')`

All handlers wrapped in try-catch with error logging.

---

## 15. Contact Sync Log Service

### File: `backend/src/modules/contact-sync/contact-sync-log.service.ts`

**Methods:**

1. `create(data)` - Insert sync log with pending status
2. `markSuccess(id, externalId)` - Update to success with external ID
3. `markFailed(id, errorMessage)` - Update to failed with error
4. `findAll(params)` - Paginated query with filters (status, provider, trigger)
5. `getStats()` - Counts by status (total, success, failed, pending)

---

## 16. Contact Sync Controller

### File: `backend/src/modules/contact-sync/contact-sync.controller.ts`

**Endpoints:**

- `GET /contact-sync/status` - Get sync status and stats
- `POST /contact-sync/verify` - Test provider connection
- `GET /contact-sync/logs` - Paginated sync logs with filters
- `GET /contact-sync/logs/stats` - Aggregated log statistics
- `POST /contact-sync/sync-user/:userId` - Manual user sync

All endpoints protected by `@Roles(Role.ADMIN)` guard.

---

## Key Implementation Notes

### 1. Tag System
- Tags use colon notation: `prefix:value`
- Multiple enrollments/completions supported
- Completion removes enrollment tag automatically

### 2. Event-Driven Sync
- Contact sync happens asynchronously on user actions
- Events emitted in multiple services (Auth, Enrollments, Users, Certificates)
- Each operation tracked in ContactSyncLog

### 3. Provider Abstraction
- Common interface for multiple providers (Mailchimp, Brevo)
- Easy to add new providers (implement interface + register in getProvider)
- Each provider handles API authentication and data formatting

### 4. Error Handling
- Failed syncs logged with error messages
- System continues operating even if sync fails
- Manual re-sync available via API endpoint

### 5. Settings Pattern
- All configuration stored in Settings table
- Sensitive keys marked with `isSecret: true` (hidden in UI)
- Category grouping for organization

---

## Missing Components (For Frontend Implementation)

### Frontend Pages Needed:
1. `/frontend/app/admin/settings/contact-sync/page.tsx` - Main settings page
2. `/frontend/app/admin/settings/contact-sync/logs/page.tsx` - Sync logs viewer
3. `/frontend/app/admin/settings/contact-sync/contact-sync-setting-field.tsx` - Reusable field component (optional)

### Navigation Updates Needed:
- Add "Contact Sync" tab to settings layout tabs array

### API Client Methods Needed:
- Contact sync endpoints in `frontend/lib/api.ts`
- Query keys in `frontend/lib/query-keys.ts`

---

## File References Summary

### Backend Files
| File | Purpose | Lines |
|------|---------|-------|
| `prisma/schema.prisma` | ContactSyncLog model | 539-560 |
| `app.module.ts` | Module import | 33, 72 |
| `modules/contact-sync/contact-sync.module.ts` | Module definition | |
| `modules/contact-sync/contact-sync.service.ts` | Core service | |
| `modules/contact-sync/contact-sync.controller.ts` | REST endpoints | |
| `modules/contact-sync/contact-sync-events.service.ts` | Event listeners | |
| `modules/contact-sync/contact-sync-log.service.ts` | Log persistence | |
| `modules/contact-sync/contact-sync.events.ts` | Event definitions | |
| `modules/contact-sync/providers/contact-sync-provider.interface.ts` | Provider contract | |
| `modules/contact-sync/providers/mailchimp.provider.ts` | Mailchimp impl | |
| `modules/contact-sync/providers/brevo.provider.ts` | Brevo impl | |
| `modules/settings/settings.service.ts` | Settings management | 109-117 |
| `modules/auth/auth.service.ts` | User registration | 49 |
| `modules/enrollments/enrollments.service.ts` | Enrollment logic | 54, 147 |
| `modules/users/users.service.ts` | User updates | 53 |
| `modules/certificates/certificates.service.ts` | Certificate issuing | 53 |
| `common/guards/roles.guard.ts` | Authorization | |
| `package.json` | Dependencies | |

### Frontend Files
| File | Purpose |
|------|---------|
| `app/admin/settings/layout.tsx` | Settings navigation tabs |
| `app/admin/settings/email/page.tsx` | Email settings (pattern reference) |
| `app/admin/settings/email/email-setting-field.tsx` | Setting field component |
| `lib/api.ts` | API client functions |
| `lib/query-keys.ts` | React Query key patterns |

---

## Unresolved Questions

None - all requested files have been located and read.
