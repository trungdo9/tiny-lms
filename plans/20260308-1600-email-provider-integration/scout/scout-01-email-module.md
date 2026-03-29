# Scout Report: Email Module Architecture

## Directory Structure
```
backend/src/modules/emails/
├── providers/
│   ├── email-provider.interface.ts
│   ├── smtp.provider.ts
│   └── resend.provider.ts
├── templates/
│   └── email-templates.service.ts
├── logs/
│   └── email-logs.service.ts
├── emails.service.ts
├── emails.controller.ts
└── emails.module.ts
```

## Core Interface
```typescript
// providers/email-provider.interface.ts
export interface EmailProvider {
  send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}
```

## Provider Selection (emails.service.ts)
- `getProvider()` reads `email_provider` setting from Settings table
- Values: 'smtp' | 'resend' (defaults to smtp)
- Creates fresh provider instance on every call (no caching)
- Reads provider-specific config from SettingsService

## Settings Keys
- `email_provider`: 'smtp' | 'resend'
- `email_smtp_host/port/user/pass/secure`: SMTP config
- `resend_api_key`: Resend API key
- `email_from_name`, `email_from_email`: Sender info

## SmtpProvider
- Uses Nodemailer transporter
- Config: host, port, user, pass, secure, fromName, fromEmail

## ResendProvider
- Uses Resend SDK client
- Config: apiKey, fromName, fromEmail

## EmailTemplatesService
- Model: slug (unique), name, subject, body (HTML), isActive
- Default templates: welcome, enrollment, certificate, quiz_result
- `render()`: regex-based `{{variable}}` placeholder replacement

## EmailLogsService
- Model: to, subject, body, status (pending|sent|failed), messageId, errorMessage, sentAt
- Methods: create(), markAsSent(), markAsFailed(), findAll(), getStats()

## API Controller (ADMIN only)
- Template CRUD: GET/POST/PUT/DELETE /emails/templates/:slug
- Template actions: preview, duplicate, test
- Logs: GET /emails/logs, GET /emails/logs/stats
- Test: POST /emails/test

## Webhook Handling
**Not implemented** — no existing webhook routes for email providers.

## How New Providers Plug In
1. Create class implementing `EmailProvider` interface
2. Add conditional branch in `getProvider()`
3. Add setting keys for provider config
4. No other changes needed — clean adapter pattern

## Note for Contact Sync Feature
The current email module handles **transactional email sending only**. Contact sync (Mailchimp/Brevo) is a **separate concern** — it should be a new module (`contact-sync` or `email-marketing`) that:
- Listens to user events (register, enroll, profile update)
- Syncs contacts to external marketing platforms
- Does NOT replace the existing transactional email flow
