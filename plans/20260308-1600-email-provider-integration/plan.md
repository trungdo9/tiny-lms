# Contact Sync Integration Plan — Mailchimp & Brevo

**Status:** ✅ VERIFIED COMPLETE (2026-03-31)

## 1. Overview

Add a `contact-sync` backend module that synchronizes LMS user/contact data to external email marketing platforms (Mailchimp, Brevo). This enables admins to run email marketing campaigns outside the LMS using segmented contact lists.

**Not in scope:** transactional email (handled by existing `emails` module via SMTP/Resend).

**Key behaviors:**
- One-way sync: LMS -> marketing platform (except webhook-driven unsubscribe/bounce updates)
- Admin selects provider (mailchimp/brevo/none) via Settings
- Contacts tagged by role, enrolled courses, completion status
- Event-driven: sync triggers on register, enroll, profile update, course completion
- Bulk sync for initial import and manual re-sync

---

## 2. Architecture

### 2.1 Module Structure

New module: `backend/src/modules/contact-sync/`

Follows the existing provider pattern from `emails/` module — a `ContactSyncProvider` interface with Mailchimp and Brevo implementations, selected at runtime via Settings table.

```
ContactSyncModule
    |
    +-- ContactSyncService         # Orchestrator: reads provider from Settings, dispatches sync ops
    |
    +-- providers/
    |   +-- contact-sync-provider.interface.ts   # Shared interface
    |   +-- mailchimp.provider.ts                # Mailchimp Marketing API v3
    |   +-- brevo.provider.ts                    # Brevo Contacts API v3
    |
    +-- contact-sync-events.service.ts   # Listens to NestJS events, triggers sync
    +-- contact-sync-webhook.controller.ts  # Receives webhooks from Mailchimp/Brevo
    +-- contact-sync.controller.ts       # Admin API: config, manual sync, logs
    +-- contact-sync-log.service.ts      # CRUD for ContactSyncLog table
    +-- dto/                             # Request/response DTOs
```

### 2.2 Event-Driven Architecture

Introduce `@nestjs/event-emitter` (new dependency). Existing modules emit events; `contact-sync` listens. This avoids circular dependencies and keeps existing modules untouched except for 1-line event emit calls.

```
AuthService.register()        -> emit('user.registered', { userId })
EnrollmentsService.enroll()   -> emit('enrollment.created', { userId, courseId })
UsersService.updateProfile()  -> emit('profile.updated', { userId })
ProgressService / CertificatesService -> emit('course.completed', { userId, courseId })
```

### 2.3 Provider Interface

```typescript
interface ContactSyncProvider {
  upsertContact(contact: SyncContact): Promise<SyncResult>;
  deleteContact(email: string): Promise<SyncResult>;
  addTags(email: string, tags: string[]): Promise<SyncResult>;
  removeTags(email: string, tags: string[]): Promise<SyncResult>;
  batchUpsertContacts(contacts: SyncContact[]): Promise<BatchSyncResult>;
  verifyConnection(): Promise<{ success: boolean; error?: string }>;
}

interface SyncContact {
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;           // student | instructor | admin
  tags: string[];          // e.g., ['student', 'course-js-101', 'completed-js-101']
  customFields?: Record<string, string>;
}

interface SyncResult {
  success: boolean;
  externalId?: string;    // Mailchimp subscriber_hash or Brevo contact ID
  error?: string;
}

interface BatchSyncResult {
  total: number;
  succeeded: number;
  failed: number;
  errors: { email: string; error: string }[];
}
```

### 2.4 Integration Points (No Coupling)

The `contact-sync` module does NOT import or depend on `emails` module. They are independent:
- `emails/` = transactional email sending (SMTP/Resend)
- `contact-sync/` = marketing contact list management (Mailchimp/Brevo)

---

## 3. Data Model

### 3.1 New Prisma Model: ContactSyncLog

Tracks individual sync operations for debugging and admin visibility.

```prisma
model ContactSyncLog {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String?   @map("user_id") @db.Uuid
  email       String
  provider    String                          // "mailchimp" | "brevo"
  operation   String                          // "upsert" | "delete" | "add_tags" | "remove_tags" | "batch"
  trigger     String                          // "register" | "enroll" | "profile_update" | "completion" | "bulk_sync" | "webhook"
  status      String    @default("pending")   // "pending" | "success" | "failed"
  errorMessage String?  @map("error_message") @db.Text
  payload     Json?                           // request payload for debugging
  externalId  String?   @map("external_id")   // provider-side ID
  createdAt   DateTime  @default(now()) @map("created_at")

  @@index([userId])
  @@index([status])
  @@index([provider])
  @@index([createdAt])
  @@schema("public")
  @@map("contact_sync_logs")
}
```

### 3.2 New Settings Keys

Category: `contact_sync`

| Key | Type | Default | Secret | Description |
|-----|------|---------|--------|-------------|
| `contact_sync_provider` | string | `none` | no | `none` / `mailchimp` / `brevo` |
| `contact_sync_enabled` | boolean | `false` | no | Master toggle |
| `mailchimp_api_key` | string | `` | yes | Mailchimp API key (format: `key-dc`) |
| `mailchimp_list_id` | string | `` | no | Mailchimp audience/list ID |
| `mailchimp_webhook_secret` | string | `` | yes | Webhook verification secret |
| `brevo_api_key` | string | `` | yes | Brevo API key |
| `brevo_list_id` | string | `` | no | Brevo contact list ID |
| `brevo_webhook_secret` | string | `` | yes | Webhook verification |

---

## 4. Phases

### Phase 1: Core Module + Provider Interface + Mailchimp Provider — ✅ COMPLETED
See [phase-01-core-mailchimp.md](./phase-01-core-mailchimp.md)

- Install `@nestjs/event-emitter` and `@mailchimp/mailchimp_marketing`
- Create `contact-sync` module skeleton with provider interface
- Implement Mailchimp provider (upsert, tags, batch, verify)
- Add `ContactSyncLog` Prisma model
- Add settings keys + seed defaults
- Create `ContactSyncService` orchestrator
- Basic admin API: GET config status, POST verify connection
- Unit tests for Mailchimp provider

### Phase 2: Brevo Provider + Event-Driven Sync Triggers — ✅ COMPLETED
See [phase-02-brevo-events.md](./phase-02-brevo-events.md)

- Install `@getbrevo/brevo`
- Implement Brevo provider
- Add `EventEmitterModule` to `AppModule`
- Add event emits to: AuthService, EnrollmentsService, UsersService, ProgressService/CertificatesService
- Create `ContactSyncEventsService` with `@OnEvent()` listeners
- Build tag strategy (role tags, course tags, completion tags)
- Unit tests for Brevo provider + event listeners

### Phase 3: Webhook Handling + Admin UI Settings — ✅ COMPLETED
See [phase-03-webhooks-admin.md](./phase-03-webhooks-admin.md)

- Create `ContactSyncWebhookController` (public endpoint, no auth guard)
- Handle Mailchimp webhooks: unsubscribe, cleaned (bounce)
- Handle Brevo webhooks: unsubscribed, hard_bounce
- Webhook payload verification (secret-based)
- Frontend: new admin settings tab `/admin/settings/contact-sync`
- UI: provider selector, API key inputs, list ID, test connection button
- Sync log viewer (table with status, provider, trigger, timestamp)

### Phase 4: Bulk Sync + Manual Re-Sync — ✅ COMPLETED
See [phase-04-bulk-sync.md](./phase-04-bulk-sync.md)

- Admin API endpoint: POST `/contact-sync/bulk-sync` (triggers full user sync)
- Batch processing: chunk users into groups of 500 (Mailchimp batch limit)
- Progress tracking: return job status with succeeded/failed counts
- Manual re-sync button in admin UI
- Re-sync individual user from admin panel
- Handle rate limiting (10 concurrent for Mailchimp, 100 req/sec for Brevo)

---

## 5. File Structure

```
backend/src/modules/contact-sync/
├── providers/
│   ├── contact-sync-provider.interface.ts
│   ├── mailchimp.provider.ts
│   └── brevo.provider.ts
├── dto/
│   ├── sync-contact.dto.ts
│   ├── bulk-sync.dto.ts
│   └── webhook-payload.dto.ts
├── contact-sync.module.ts
├── contact-sync.service.ts
├── contact-sync.controller.ts
├── contact-sync-events.service.ts
├── contact-sync-webhook.controller.ts
└── contact-sync-log.service.ts
```

Frontend additions:
```
frontend/app/admin/settings/contact-sync/
├── page.tsx                    # Provider config + test connection
└── logs/
    └── page.tsx                # Sync log viewer
```

---

## 6. API Endpoints

### Admin Endpoints (JwtAuthGuard + Role.ADMIN)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/contact-sync/status` | Current provider config status + last sync info |
| POST | `/contact-sync/verify` | Test API key + list ID connectivity |
| POST | `/contact-sync/bulk-sync` | Trigger full user sync to provider |
| GET | `/contact-sync/logs` | Paginated sync logs (filter by status, provider, trigger) |
| POST | `/contact-sync/sync-user/:userId` | Re-sync single user |

### Webhook Endpoints (Public, no auth guard — verified by provider secret)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/contact-sync/webhooks/mailchimp` | Mailchimp webhook receiver |
| GET | `/contact-sync/webhooks/mailchimp` | Mailchimp webhook URL verification (returns 200) |
| POST | `/contact-sync/webhooks/brevo` | Brevo webhook receiver |

---

## 7. Event Triggers

| LMS Event | Event Name | Payload | Sync Action |
|-----------|------------|---------|-------------|
| User registers | `user.registered` | `{ userId }` | Upsert contact + tag `role:student` |
| User enrolls in course | `enrollment.created` | `{ userId, courseId }` | Add tag `enrolled:course-slug` |
| Profile updated | `profile.updated` | `{ userId }` | Upsert contact (name, email changes) |
| Course completed | `course.completed` | `{ userId, courseId }` | Add tag `completed:course-slug`, remove tag `enrolled:course-slug` |

### Event Emit Locations

```
backend/src/modules/auth/auth.service.ts           -> register()
backend/src/modules/enrollments/enrollments.service.ts -> enroll(), bulkEnroll()
backend/src/modules/users/users.service.ts          -> updateProfile()
backend/src/modules/certificates/certificates.service.ts -> create() (proxy for course completion)
```

### Tag Naming Convention

- Role: `role:student`, `role:instructor`, `role:admin`
- Enrolled: `enrolled:course-slug` (e.g., `enrolled:javascript-101`)
- Completed: `completed:course-slug`

---

## 8. Settings Keys Summary

All under category `contact_sync`:

```typescript
const CONTACT_SYNC_SETTINGS = [
  { key: 'contact_sync_provider', value: 'none', type: 'string', category: 'contact_sync' },
  { key: 'contact_sync_enabled', value: 'false', type: 'boolean', category: 'contact_sync' },
  { key: 'mailchimp_api_key', value: '', type: 'string', category: 'contact_sync', isSecret: true },
  { key: 'mailchimp_list_id', value: '', type: 'string', category: 'contact_sync' },
  { key: 'mailchimp_webhook_secret', value: '', type: 'string', category: 'contact_sync', isSecret: true },
  { key: 'brevo_api_key', value: '', type: 'string', category: 'contact_sync', isSecret: true },
  { key: 'brevo_list_id', value: '', type: 'string', category: 'contact_sync' },
  { key: 'brevo_webhook_secret', value: '', type: 'string', category: 'contact_sync', isSecret: true },
];
```

---

## 9. Testing Strategy

### Unit Tests (Jest)

- **Mailchimp provider**: mock `@mailchimp/mailchimp_marketing` SDK, test upsert/tags/batch/verify
- **Brevo provider**: mock `@getbrevo/brevo` SDK, test upsert/tags/batch/verify
- **ContactSyncService**: mock provider + SettingsService, test provider selection logic, enabled/disabled toggle
- **ContactSyncEventsService**: mock ContactSyncService, verify correct sync calls per event type
- **ContactSyncWebhookController**: test payload parsing, secret verification, unsubscribe handling
- **ContactSyncLogService**: mock PrismaService, test CRUD + filtering

### Integration Tests

- Verify event emission from AuthService/EnrollmentsService reaches ContactSyncEventsService
- Verify full flow: register -> event -> provider.upsertContact called with correct tags
- Webhook endpoint returns correct HTTP status for valid/invalid payloads

### Test Files

```
backend/src/modules/contact-sync/providers/mailchimp.provider.spec.ts
backend/src/modules/contact-sync/providers/brevo.provider.spec.ts
backend/src/modules/contact-sync/contact-sync.service.spec.ts
backend/src/modules/contact-sync/contact-sync-events.service.spec.ts
backend/src/modules/contact-sync/contact-sync-webhook.controller.spec.ts
```

---

## 10. Dependencies (New npm Packages)

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/event-emitter` | ^3.x | Event bus for decoupled sync triggers |
| `@mailchimp/mailchimp_marketing` | ^3.x | Mailchimp Marketing API SDK |
| `@getbrevo/brevo` | ^2.x | Brevo (Sendinblue) API SDK |

---

## 11. Risk & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mailchimp rate limit (10 concurrent) | Bulk sync fails | Chunk batches of 500, sequential processing with delay |
| Provider API down during event | Contact not synced | Log as failed, no retry (admin can re-sync manually) |
| Webhook spoofing | Fake unsubscribe events | Verify webhook secret/signature |
| API key leaked in logs | Security breach | Settings `isSecret: true`, masked in admin GET responses |
| Event emitter adds overhead to hot paths | Register/enroll slower | Events are async (fire-and-forget), no blocking |

---

## Unresolved Questions

1. **Should failed syncs auto-retry?** Current plan: no auto-retry, admin can re-sync manually. A queue-based retry (e.g., BullMQ) is YAGNI for now but could be added later.
2. **Merge fields vs. tags for Mailchimp?** Plan uses both: merge fields for structured data (FNAME, LNAME, ROLE) and tags for dynamic segmentation (enrollment, completion). Confirm with product.
3. **Double opt-in?** Mailchimp supports `status_if_new: 'pending'` for double opt-in. Current plan uses `subscribed` (single opt-in) since LMS users already consented at registration. May need GDPR review.
