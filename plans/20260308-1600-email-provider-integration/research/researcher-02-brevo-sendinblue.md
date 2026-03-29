# Brevo (Sendinblue) API v3 — Integration Research

## 1. API Overview
Brevo (formerly Sendinblue) provides REST API v3 for transactional email, SMS, marketing automation, and CRM. Supports batch sending, personalization, templates, attachments, delivery tracking via webhooks.

## 2. Official NPM Package
**`@getbrevo/brevo`** — Official TypeScript/JavaScript SDK.
```bash
npm install @getbrevo/brevo
```
Full TypeScript support with generated types. Replaces deprecated `sib-api-v3-sdk`.

## 3. Authentication
API key-based. Header: `api-key: <YOUR_API_KEY>`. Generated in Brevo dashboard. No OAuth needed for transactional emails.

## 4. Key API Endpoints
- **Send transactional email**: `POST /smtp/email` — single email with attachments, personalization
- **Send template email**: `POST /smtp/email` with `templateId` parameter
- **Email status**: `GET /smtp/email-events` — delivery tracking
- **Contact management**: `POST /contacts`, `PUT /contacts/{id}`, `DELETE /contacts/{id}`
- **Contact lists**: `POST /contacts/lists`, manage list membership
- **Webhooks**: `POST /webhooks` — register webhook URLs

## 5. Sending Transactional Emails (NestJS Example)
```typescript
import { SendSmtpEmail, TransactionalEmailsApi } from "@getbrevo/brevo";

const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(
  TransactionalEmailsApi.authentications['api-key'],
  process.env.BREVO_API_KEY!
);

const sendSmtpEmail = new SendSmtpEmail();
sendSmtpEmail.subject = "Reset Password";
sendSmtpEmail.htmlContent = "<h1>Reset your password</h1>";
sendSmtpEmail.sender = { name: "Support", email: "noreply@example.com" };
sendSmtpEmail.to = [{ email: "user@example.com", name: "John" }];

const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
// result.messageId for tracking
```

## 6. Contact List Management
- Add/update/remove contacts with custom attributes
- List-based segmentation
- Bulk operations via batch endpoints
- `POST /contacts` to create, `PUT /contacts/{email}` to update

## 7. Webhook Events
Events: `delivered`, `bounced`, `clicked`, `opened`, `unsubscribed`, `complaint`, `invalid_email`.
JSON POST payloads include: messageId, email, timestamp, event type, click URL.

## 8. Rate Limits & Pricing
- **Free tier**: 300 emails/day, unlimited contacts, ~5 req/sec API limit
- **Paid**: up to 100k+ emails/month, 100 req/sec burst
- Good for development/testing with free tier

## 9. NestJS Adapter Pattern
- Implement shared `EmailProvider` interface with `send()`, `sendTemplate()` methods
- Wrap `TransactionalEmailsApi` in a Brevo-specific provider class
- Use `ContactsApi` for subscriber sync functionality
- Register webhooks via API or dashboard configuration
