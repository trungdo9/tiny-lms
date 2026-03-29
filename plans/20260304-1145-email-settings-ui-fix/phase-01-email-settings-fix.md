# Phase 01 — Fix & Improve Email Settings Page

**Ref:** [plan.md](./plan.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Fix labels, add Send Test Email, improve secret field UX, add SMTP secure toggle, update design |
| Priority | High |
| Status | ✅ Completed |

---

## Key Insights

- Core logic (provider switching, field show/hide, onBlur save) is **correct** — do NOT refactor it
- `formatLabel()` regex-based label generation is fragile; replace with an explicit label map
- Secret fields: backend returns `***` for configured secrets. Frontend should detect this and show a distinct "Configured — click to change" state rather than displaying `***` as a value
- `emailsApi.sendTestEmail(to: string)` exists in `api.ts` — just need a UI button + email input
- `email_smtp_secure` is missing from both DB seed and UI. Add it: boolean, default `false`, controls SSL/TLS on port 465
- Design: existing page uses plain Tailwind. Check if `admin/settings/branding/page.tsx` uses neobrutalist — if yes, match that style

---

## Requirements

1. **Fix labels** — explicit label map in `EmailSettingField`
2. **Secret field UX** — detect `***` value → show "Configured — click to update" placeholder
3. **Add "Send Test Email"** — email input + button at bottom of page
4. **Add `email_smtp_secure` toggle** — boolean setting for SSL/TLS (SMTP only)
5. **Add SMTP help text/placeholders** — hints per field
6. **Consistent design** — match admin branding/settings page style

---

## Architecture

### Fix 1 — Label map in `email-setting-field.tsx`

Replace fragile `formatLabel()` regex with an explicit map:

```typescript
const LABEL_MAP: Record<string, string> = {
  email_smtp_host:    'SMTP Host',
  email_smtp_port:    'SMTP Port',
  email_smtp_user:    'SMTP Username',
  email_smtp_pass:    'SMTP Password',
  email_smtp_secure:  'Use SSL/TLS (port 465)',
  email_from_name:    'From Name',
  email_from_email:   'From Email Address',
  resend_api_key:     'Resend API Key',
};
const formatLabel = (key: string) =>
  LABEL_MAP[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
```

Add `PLACEHOLDER_MAP`:
```typescript
const PLACEHOLDER_MAP: Record<string, string> = {
  email_smtp_host:  'e.g. smtp.gmail.com',
  email_smtp_port:  '587 (TLS) or 465 (SSL)',
  email_smtp_user:  'your@email.com',
  email_smtp_pass:  'Enter password',
  email_from_name:  'Tiny LMS',
  email_from_email: 'noreply@yourdomain.com',
  resend_api_key:   're_xxxxxxxxxxxx',
};
```

### Fix 2 — Secret field configured state

When `strValue === '***'` (backend masked value), show a different UI:
```typescript
const isConfigured = strValue === '***';

// In password field render:
{isConfigured && !isEditing ? (
  <div
    className="... cursor-pointer flex items-center gap-2"
    onClick={() => setIsEditing(true)}
  >
    <span className="text-green-700 font-medium text-sm">✓ Configured</span>
    <span className="text-gray-400 text-xs">— click to update</span>
  </div>
) : (
  <input ... placeholder={PLACEHOLDER_MAP[setting.key]} />
)}
```

Add `isEditing` local state (default `false`). When `isEditing` becomes `true`, show empty input (not `***`). `defaultValue=""` so admin types fresh value. On blur: if empty, cancel edit (no save). If non-empty, save.

### Fix 3 — Send Test Email

Add to bottom of `page.tsx`:

```typescript
const [testEmail, setTestEmail] = useState('');
const [testing, setTesting] = useState(false);

const handleTestEmail = async () => {
  if (!testEmail) return;
  setTesting(true);
  try {
    await emailsApi.sendTestEmail(testEmail);
    setMessage({ type: 'success', text: `Test email sent to ${testEmail}` });
  } catch (err: any) {
    setMessage({ type: 'error', text: err.message || 'Failed to send test email' });
  } finally {
    setTesting(false);
  }
};
```

JSX (inside the `!isEmpty` block, at the very bottom):
```tsx
{/* Send Test Email */}
<div className="px-6 py-6 border-t border-gray-200">
  <h3 className="text-sm font-medium text-gray-900 mb-4">Test Configuration</h3>
  <div className="flex gap-2">
    <input
      type="email"
      placeholder="Send test to..."
      value={testEmail}
      onChange={e => setTestEmail(e.target.value)}
      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
    />
    <button
      onClick={handleTestEmail}
      disabled={testing || !testEmail || saving !== null}
      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50"
    >
      {testing ? 'Sending...' : 'Send Test'}
    </button>
  </div>
</div>
```

### Fix 4 — Add `email_smtp_secure` setting

**Backend `settings.service.ts`** — add to `seedDefaults()`:
```typescript
{
  key: 'email_smtp_secure',
  value: 'false',
  type: 'boolean',
  category: 'email',
  description: 'Enable SSL/TLS for SMTP (use with port 465)',
}
```

**Frontend** — in `page.tsx`:
```typescript
const smtpFields = settings.filter(s =>
  s.key.startsWith('email_smtp_') || s.key === 'email_smtp_secure'
);
```
The `EmailSettingField` component handles boolean type: add a checkbox render path when `setting.type === 'boolean'`.

### Fix 5 — Boolean field rendering in `EmailSettingField`

Add a new render branch:
```typescript
if (setting.type === 'boolean') {
  const checked = setting.value === true || setting.value === 'true';
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">
        {formatLabel(setting.key)}
      </label>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onSave(setting.key, e.target.checked, 'boolean')}
        disabled={saving}
        className="h-4 w-4 rounded border-gray-300 text-blue-600"
      />
    </div>
  );
}
```

---

## Related Code Files

| File | Change |
|------|--------|
| `frontend/app/admin/settings/email/page.tsx` | Add test email UI, import `emailsApi`, add `email_smtp_secure` to smtpFields filter |
| `frontend/app/admin/settings/email/email-setting-field.tsx` | Add label map, placeholder map, secret configured state, boolean field renderer |
| `backend/src/modules/settings/settings.service.ts` | Add `email_smtp_secure` to `seedDefaults()` |

---

## Implementation Steps

1. Update `email-setting-field.tsx`:
   - Add `LABEL_MAP` + `PLACEHOLDER_MAP`
   - Add `isEditing` state for secret fields
   - Add boolean field render branch
   - Add placeholder attr to all inputs
2. Update `email/page.tsx`:
   - Add `testEmail` + `testing` state
   - Add `handleTestEmail` handler
   - Add import `emailsApi`
   - Add "Send Test Email" section JSX
   - Update `smtpFields` filter to include `email_smtp_secure`
3. Update `backend/src/modules/settings/settings.service.ts`: add `email_smtp_secure` to seed
4. Call `POST /settings/seed` to add new setting to DB
5. `npm run build` (backend) + `npx tsc --noEmit` (frontend) both pass

---

## Todo List

- [x] Add `LABEL_MAP` + `PLACEHOLDER_MAP` to `email-setting-field.tsx`
- [x] Add `isEditing` state for secret configured state UX
- [x] Add boolean field renderer in `EmailSettingField`
- [x] Add `testEmail` state + `handleTestEmail` to `page.tsx`
- [x] Add "Send Test Email" section to page JSX
- [x] Update `smtpFields` filter to include `email_smtp_secure`
- [x] Add `email_smtp_secure` to backend `seedDefaults()`
- [x] Backend build passes
- [x] Frontend tsc passes

---

## Success Criteria

- SMTP fields: all labels are clear (e.g., "SMTP Password" not "Pass")
- Configured secrets show "✓ Configured — click to update" instead of `***`
- Clicking configured secret shows an empty input for fresh entry; blur without typing = cancel
- Admin can type an email address and click "Send Test" to verify configuration
- `email_smtp_secure` checkbox appears in SMTP section
- Provider toggle still works: selecting SMTP shows SMTP fields, selecting Resend shows API key only
- No TypeScript errors

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Saving `email_smtp_secure = false` as string `'false'` instead of boolean | Medium | Low | Always cast via `setting.type === 'boolean'` check in renderer |
| `emailsApi.sendTestEmail` fails if no `to` param or email not configured | Low | Low | Disable button when input empty; catch error and show message |
| `isEditing` secret field: if admin opens edit but blurs empty → accidental overwrite | Low | High | Only call `onSave` if `e.target.value !== ''` in configured-field edit mode |

---

## Security Considerations

- "Send Test Email" requires admin auth (existing `SupabaseAuthGuard` on the endpoint)
- Clicking "Show" on a password field reveals the real value only when NOT configured (when admin is typing fresh value); for `***` state, clicking "edit" shows an empty input — the actual stored secret is never sent back to frontend

---

## Unresolved Questions

1. Does `emailsApi.sendTestEmail(to)` require the email settings to be saved first, or does it use the current in-DB settings? (Yes — it reads from DB, so admin must save settings before testing.)
2. Should the design be updated to neobrutalist style? Check `admin/settings/branding/page.tsx` for reference — if it uses standard Tailwind, keep the current style. If it uses neobrutalist, update email page to match.
