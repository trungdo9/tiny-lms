# Phase 1: Core Module + Provider Interface + Mailchimp Provider

## Goal
Stand up the `contact-sync` module skeleton, define the provider interface, implement Mailchimp, add the Prisma model, and expose basic admin API endpoints.

---

## Step 1: Install Dependencies

```bash
cd backend
npm install @nestjs/event-emitter @mailchimp/mailchimp_marketing
npm install -D @types/mailchimp__mailchimp_marketing
```

Note: `@nestjs/event-emitter` installed here but `EventEmitterModule` registration deferred to Phase 2.

---

## Step 2: Prisma Schema — Add ContactSyncLog

File: `backend/prisma/schema.prisma`

Add after the `EmailLog` model:

```prisma
model ContactSyncLog {
  id            String    @id @default(uuid()) @db.Uuid
  userId        String?   @map("user_id") @db.Uuid
  email         String
  provider      String                          // "mailchimp" | "brevo"
  operation     String                          // "upsert" | "delete" | "add_tags" | "remove_tags" | "batch"
  trigger       String                          // "register" | "enroll" | "profile_update" | "completion" | "bulk_sync" | "webhook"
  status        String    @default("pending")   // "pending" | "success" | "failed"
  errorMessage  String?   @map("error_message") @db.Text
  payload       Json?
  externalId    String?   @map("external_id")
  createdAt     DateTime  @default(now()) @map("created_at")

  @@index([userId])
  @@index([status])
  @@index([provider])
  @@index([createdAt])
  @@schema("public")
  @@map("contact_sync_logs")
}
```

Run: `npx prisma db push && npx prisma generate`

---

## Step 3: Seed Default Settings

File: `backend/src/modules/settings/settings.service.ts`

Add to `seedDefaults()` array:

```typescript
// Contact Sync
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

## Step 4: Create Provider Interface

File: `backend/src/modules/contact-sync/providers/contact-sync-provider.interface.ts`

```typescript
export interface SyncContact {
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  tags: string[];
  customFields?: Record<string, string>;
}

export interface SyncResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface BatchSyncResult {
  total: number;
  succeeded: number;
  failed: number;
  errors: { email: string; error: string }[];
}

export interface ContactSyncProvider {
  upsertContact(contact: SyncContact): Promise<SyncResult>;
  deleteContact(email: string): Promise<SyncResult>;
  addTags(email: string, tags: string[]): Promise<SyncResult>;
  removeTags(email: string, tags: string[]): Promise<SyncResult>;
  batchUpsertContacts(contacts: SyncContact[]): Promise<BatchSyncResult>;
  verifyConnection(): Promise<{ success: boolean; error?: string }>;
}
```

---

## Step 5: Implement Mailchimp Provider

File: `backend/src/modules/contact-sync/providers/mailchimp.provider.ts`

Key implementation details:
- Import `@mailchimp/mailchimp_marketing` and configure with API key + server prefix (extracted from key format `key-dc`)
- `subscriberHash`: MD5 of lowercase email
- `upsertContact()`: `PUT /lists/{list_id}/members/{hash}` with `status_if_new: 'subscribed'`, merge fields (FNAME, LNAME, ROLE), tags
- `addTags()` / `removeTags()`: `POST /lists/{list_id}/members/{hash}/tags` with `status: 'active'` or `'inactive'`
- `batchUpsertContacts()`: `POST /batches` with operations array (max 500 per batch)
- `verifyConnection()`: `GET /ping` to validate API key, then `GET /lists/{list_id}` to validate list
- `deleteContact()`: `DELETE /lists/{list_id}/members/{hash}`
- Constructor takes: `{ apiKey: string; listId: string }`

```typescript
export interface MailchimpConfig {
  apiKey: string;
  listId: string;
}
```

---

## Step 6: Create ContactSyncLogService

File: `backend/src/modules/contact-sync/contact-sync-log.service.ts`

Methods:
- `create(data)`: create log entry with status `pending`
- `markSuccess(id, externalId?)`: update status to `success`
- `markFailed(id, errorMessage)`: update status to `failed`
- `findAll(query)`: paginated list with filters (status, provider, trigger, dateRange)
- `getStats()`: count by status + provider

Follows same pattern as `EmailLogsService`.

---

## Step 7: Create ContactSyncService (Orchestrator)

File: `backend/src/modules/contact-sync/contact-sync.service.ts`

```typescript
@Injectable()
export class ContactSyncService {
  constructor(
    private settingsService: SettingsService,
    private logService: ContactSyncLogService,
    private prisma: PrismaService,
  ) {}

  private async getProvider(): Promise<ContactSyncProvider | null> { ... }
  async isEnabled(): Promise<boolean> { ... }
  async syncUser(userId: string, trigger: string): Promise<SyncResult | null> { ... }
  async addUserTags(userId: string, tags: string[], trigger: string): Promise<SyncResult | null> { ... }
  async removeUserTags(userId: string, tags: string[], trigger: string): Promise<SyncResult | null> { ... }
  async verifyConnection(): Promise<{ success: boolean; error?: string }> { ... }
  async getStatus(): Promise<{ provider: string; enabled: boolean; lastSync?: Date }> { ... }
}
```

Key behavior of `getProvider()`:
1. Read `contact_sync_enabled` — if false, return null
2. Read `contact_sync_provider` — if `none`, return null
3. If `mailchimp`: read `mailchimp_api_key` + `mailchimp_list_id`, return `new MailchimpProvider(config)`
4. If `brevo`: read `brevo_api_key` + `brevo_list_id`, return `new BrevoProvider(config)` (Phase 2)

Key behavior of `syncUser()`:
1. Get provider (return null if disabled)
2. Load user profile from Prisma (email, fullName, role)
3. Load enrolled courses (for tags)
4. Load completed courses (for tags)
5. Build `SyncContact` with tags
6. Create log entry
7. Call `provider.upsertContact(contact)`
8. Update log entry (success/failed)

---

## Step 8: Create Admin Controller

File: `backend/src/modules/contact-sync/contact-sync.controller.ts`

```typescript
@Controller('contact-sync')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ContactSyncController {
  @Get('status')
  async getStatus() { ... }

  @Post('verify')
  async verifyConnection() { ... }

  @Get('logs')
  async getLogs(@Query() query: PaginationQueryDto) { ... }

  @Post('sync-user/:userId')
  async syncUser(@Param('userId') userId: string) { ... }
}
```

Bulk sync endpoint deferred to Phase 4.

---

## Step 9: Create Module

File: `backend/src/modules/contact-sync/contact-sync.module.ts`

```typescript
@Module({
  imports: [SettingsModule],
  controllers: [ContactSyncController],
  providers: [ContactSyncService, ContactSyncLogService, PrismaService],
  exports: [ContactSyncService],
})
export class ContactSyncModule {}
```

Register in `app.module.ts`:
```typescript
import { ContactSyncModule } from './modules/contact-sync/contact-sync.module';
// Add to imports array
```

---

## Step 10: Unit Tests

File: `backend/src/modules/contact-sync/providers/mailchimp.provider.spec.ts`

Test cases:
- `upsertContact()` calls `lists.setListMember` with correct hash, merge fields, tags
- `addTags()` calls `lists.updateListMemberTags` with `status: 'active'`
- `removeTags()` calls `lists.updateListMemberTags` with `status: 'inactive'`
- `verifyConnection()` calls `ping.get()` and `lists.getList()`
- `deleteContact()` calls `lists.deleteListMember`
- Error handling: SDK throws -> returns `{ success: false, error: '...' }`

File: `backend/src/modules/contact-sync/contact-sync.service.spec.ts`

Test cases:
- Returns null when `contact_sync_enabled` is false
- Returns null when provider is `none`
- Calls MailchimpProvider when provider is `mailchimp`
- `syncUser()` builds correct tags from enrollments/completions
- Creates log entry and updates status on success/failure

---

## Deliverables Checklist

- [x] `@mailchimp/mailchimp_marketing` and `@nestjs/event-emitter` installed
- [x] `ContactSyncLog` model in Prisma schema, migration applied
- [x] Settings seed defaults for `contact_sync` category
- [x] `ContactSyncProvider` interface defined
- [x] `MailchimpProvider` implemented and tested
- [x] `ContactSyncLogService` implemented
- [x] `ContactSyncService` orchestrator implemented and tested
- [x] `ContactSyncController` with GET /status, POST /verify, GET /logs, POST /sync-user/:userId
- [x] `ContactSyncModule` registered in `AppModule`
- [x] Unit tests passing
