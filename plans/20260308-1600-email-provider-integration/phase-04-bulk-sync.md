# Phase 4: Bulk Sync + Manual Re-Sync

## Goal
Enable admin to sync all existing users to the configured marketing provider and re-sync individual users on demand.

---

## Step 1: Bulk Sync Endpoint

File: `backend/src/modules/contact-sync/contact-sync.controller.ts`

Add:
```typescript
@Post('bulk-sync')
@Roles(Role.ADMIN)
async bulkSync(): Promise<BatchSyncResult> { ... }
```

---

## Step 2: Bulk Sync Service Method

File: `backend/src/modules/contact-sync/contact-sync.service.ts`

```typescript
async bulkSync(): Promise<BatchSyncResult> {
  const provider = await this.getProvider();
  if (!provider) return { total: 0, succeeded: 0, failed: 0, errors: [] };

  // 1. Load all active users with email
  const users = await this.prisma.profile.findMany({
    where: { isActive: true, email: { not: null } },
    select: { id: true, email: true, fullName: true, role: true },
  });

  // 2. For each user, build SyncContact with tags
  const contacts = await Promise.all(
    users.map(user => this.buildSyncContact(user))
  );

  // 3. Chunk into batches of 500 (Mailchimp limit)
  const BATCH_SIZE = 500;
  const batches = chunk(contacts, BATCH_SIZE);

  // 4. Process batches sequentially to respect rate limits
  let totalSucceeded = 0;
  let totalFailed = 0;
  const allErrors: { email: string; error: string }[] = [];

  for (const batch of batches) {
    const result = await provider.batchUpsertContacts(batch);
    totalSucceeded += result.succeeded;
    totalFailed += result.failed;
    allErrors.push(...result.errors);
  }

  // 5. Create summary log entry
  await this.logService.create({
    email: 'bulk-sync',
    provider: await this.getProviderName(),
    operation: 'batch',
    trigger: 'bulk_sync',
    status: totalFailed === 0 ? 'success' : 'failed',
    payload: { total: users.length, succeeded: totalSucceeded, failed: totalFailed },
  });

  return { total: users.length, succeeded: totalSucceeded, failed: totalFailed, errors: allErrors };
}
```

### Helper: buildSyncContact

```typescript
private async buildSyncContact(user: { id: string; email: string; fullName?: string; role: string }): Promise<SyncContact> {
  // Split fullName into first/last
  const [firstName, ...rest] = (user.fullName || '').split(' ');
  const lastName = rest.join(' ');

  // Get enrolled course slugs
  const enrollments = await this.prisma.enrollment.findMany({
    where: { userId: user.id, completedAt: null },
    include: { course: { select: { slug: true } } },
  });

  // Get completed course slugs
  const completions = await this.prisma.enrollment.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    include: { course: { select: { slug: true } } },
  });

  const tags = [
    `role:${user.role}`,
    ...enrollments.map(e => `enrolled:${e.course.slug}`),
    ...completions.map(e => `completed:${e.course.slug}`),
  ];

  return { email: user.email, firstName, lastName, role: user.role, tags };
}
```

### Helper: chunk utility

```typescript
function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
```

---

## Step 3: Optimize Bulk Sync for Large User Bases

For databases with 10k+ users, loading all enrollments per user is N+1. Optimize:

```typescript
// Batch load all enrollments and completions in 2 queries
const allEnrollments = await this.prisma.enrollment.findMany({
  where: { userId: { in: userIds } },
  include: { course: { select: { slug: true } } },
});

// Group by userId
const enrollmentsByUser = groupBy(allEnrollments, 'userId');
```

This reduces query count from N+2 to 3 (users + enrollments + completions grouped).

---

## Step 4: Rate Limiting

Mailchimp: max 10 concurrent connections. Process batches sequentially with no parallelism.

Brevo: 100 req/sec burst. Batch import endpoint handles this internally, so no client-side throttling needed.

Add a configurable delay between batches as safety margin:

```typescript
const BATCH_DELAY_MS = 1000; // 1 second between batches
for (const batch of batches) {
  const result = await provider.batchUpsertContacts(batch);
  // ...accumulate results
  if (batches.indexOf(batch) < batches.length - 1) {
    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
  }
}
```

---

## Step 5: Frontend — Bulk Sync Button

File: `frontend/app/admin/settings/contact-sync/page.tsx`

Add to the status card section:

- "Sync All Users" button (primary, with confirmation dialog)
- Shows loading spinner during sync
- Displays result: "Synced X users, Y failed" toast notification
- Button disabled when provider is `none` or sync is disabled

Add single-user re-sync:
- In the sync logs page, add a "Re-sync" action button per log row (calls POST `/contact-sync/sync-user/:userId`)

---

## Step 6: Frontend API

File: `frontend/lib/api.ts` — add:
```typescript
bulkSync: () => fetchApi('/contact-sync/bulk-sync', { method: 'POST' }),
```

File: `frontend/lib/query-keys.ts` — already covered by `contactSync.status()` invalidation after bulk sync.

---

## Step 7: Tests

File: `backend/src/modules/contact-sync/contact-sync.service.spec.ts` — add:

- `bulkSync()` loads all active users and calls `batchUpsertContacts` in chunks of 500
- `bulkSync()` creates summary log entry
- `bulkSync()` returns null result when provider disabled
- `buildSyncContact()` correctly splits fullName and builds tags
- Handles users with no enrollments (empty tags array)
- Handles users with null email (skipped)

---

## Deliverables Checklist

- [x] POST `/contact-sync/bulk-sync` endpoint
- [x] `bulkSync()` method with batching, rate limit handling
- [x] `buildSyncContact()` helper with optimized enrollment loading
- [x] Summary log entry for bulk sync operations
- [x] Frontend: "Sync All Users" button with confirmation + result toast
- [x] Frontend: single-user re-sync action in logs table
- [x] Unit tests for bulk sync logic
