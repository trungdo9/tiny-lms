# Phase 3: Webhook Handling + Admin UI Settings

## Goal
Receive unsubscribe/bounce webhooks from Mailchimp and Brevo. Build admin settings UI for provider configuration and sync log viewing.

---

## Step 1: Webhook Controller

File: `backend/src/modules/contact-sync/contact-sync-webhook.controller.ts`

```typescript
@Controller('contact-sync/webhooks')
export class ContactSyncWebhookController {
  // No auth guard — public endpoints verified by provider secret

  @Get('mailchimp')   // Mailchimp sends GET to verify webhook URL
  verifyMailchimp(): string { return 'OK'; }

  @Post('mailchimp')
  async handleMailchimp(@Body() body: any, @Req() req: Request): Promise<void> { ... }

  @Post('brevo')
  async handleBrevo(@Body() body: any, @Headers('x-brevo-signature') signature: string): Promise<void> { ... }
}
```

### Mailchimp Webhook Handling

Payload is form-encoded. Key fields: `type`, `data.email`, `data.reason`.

Events to handle:
- `unsubscribe`: log event, optionally update a local flag (no profile changes, just log)
- `cleaned`: email bounced/invalid, log event

Verification: compare webhook secret from Settings with request parameter or custom header. Mailchimp webhooks include a `X-Mailchimp-Webhook-Secret` if configured, or validate by checking the source URL contains a secret token as query param.

**Approach:** register webhook URL as `https://domain.com/contact-sync/webhooks/mailchimp?secret=<webhook_secret>`. Validate `req.query.secret` against stored `mailchimp_webhook_secret`.

### Brevo Webhook Handling

Payload is JSON. Key fields: `event`, `email`, `reason`.

Events to handle:
- `unsubscribed`: contact unsubscribed
- `hard_bounce`: permanent delivery failure

Verification: Brevo sends signature in header. Validate using HMAC-SHA256 of request body with `brevo_webhook_secret`.

### Webhook Processing Logic

For both providers, on unsubscribe/bounce:
1. Verify secret/signature
2. Create `ContactSyncLog` entry with `trigger: 'webhook'`, `operation: 'webhook_event'`
3. Log the event type and email — no automatic profile changes in LMS
4. Return 200 immediately (providers expect fast response)

---

## Step 2: Register Webhook Controller

File: `backend/src/modules/contact-sync/contact-sync.module.ts`

Add `ContactSyncWebhookController` to controllers array.

---

## Step 3: Frontend — Admin Settings Page

File: `frontend/app/admin/settings/contact-sync/page.tsx`

UI sections:

**Provider Selection**
- Radio group: None / Mailchimp / Brevo
- Saves to `contact_sync_provider` setting

**Enable/Disable Toggle**
- Switch component bound to `contact_sync_enabled`

**Mailchimp Configuration** (shown when provider = mailchimp)
- API Key input (password field)
- List/Audience ID input
- Webhook Secret input (password field)
- Webhook URL display (read-only, shows the URL to configure in Mailchimp dashboard)
- "Test Connection" button -> POST `/contact-sync/verify`

**Brevo Configuration** (shown when provider = brevo)
- API Key input (password field)
- List ID input
- Webhook Secret input (password field)
- Webhook URL display
- "Test Connection" button

**Status Card**
- Current provider, enabled status
- Last successful sync timestamp
- Total synced / failed counts (from GET `/contact-sync/status`)

Pattern: follow existing `frontend/app/admin/settings/email/page.tsx` layout with `email-setting-field.tsx` component pattern for consistent field rendering.

---

## Step 4: Frontend — Sync Logs Page

File: `frontend/app/admin/settings/contact-sync/logs/page.tsx`

- Table with columns: Timestamp, Email, Provider, Operation, Trigger, Status
- Status badges: green (success), red (failed), yellow (pending)
- Filters: status dropdown, provider dropdown, date range
- Pagination using existing `{ data, meta }` response format
- Uses `queryKeys.contactSync.logs()` from query-keys factory

---

## Step 5: Frontend API + Query Keys

File: `frontend/lib/api.ts` — add:
```typescript
export const contactSyncApi = {
  getStatus: () => fetchApi('/contact-sync/status'),
  verify: () => fetchApi('/contact-sync/verify', { method: 'POST' }),
  getLogs: (params) => fetchApi('/contact-sync/logs', { params }),
  syncUser: (userId) => fetchApi(`/contact-sync/sync-user/${userId}`, { method: 'POST' }),
};
```

File: `frontend/lib/query-keys.ts` — add:
```typescript
contactSync: {
  status: () => ['contact-sync', 'status'],
  logs: (filters?) => ['contact-sync', 'logs', filters],
},
```

---

## Step 6: Admin Settings Navigation

File: update admin settings layout/navigation to include new tab:

| Tab | Path |
|-----|------|
| Contact Sync | `/admin/settings/contact-sync` |
| Sync Logs | `/admin/settings/contact-sync/logs` |

---

## Step 7: Tests

**Backend unit tests:**

File: `backend/src/modules/contact-sync/contact-sync-webhook.controller.spec.ts`

- Mailchimp GET verification returns 200
- Mailchimp POST with valid secret creates log entry
- Mailchimp POST with invalid secret returns 401
- Brevo POST with valid HMAC signature creates log entry
- Brevo POST with invalid signature returns 401
- Unknown event types are logged but not processed

---

## Deliverables Checklist

- [x] `ContactSyncWebhookController` with Mailchimp and Brevo handlers
- [x] Webhook secret verification for both providers
- [x] Webhook controller registered in module
- [x] Frontend: `/admin/settings/contact-sync` page with provider config UI
- [x] Frontend: `/admin/settings/contact-sync/logs` page with sync log table
- [x] `contactSyncApi` functions in `frontend/lib/api.ts`
- [x] Query keys added to `frontend/lib/query-keys.ts`
- [x] Admin navigation updated with Contact Sync tab
- [x] Webhook controller unit tests
