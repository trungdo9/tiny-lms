# Phase 1: Email Service (SMTP/Resend)

## Overview

**Date:** 2026-02-28
**Priority:** High
**Status:** Pending

Create email service with SMTP or Resend provider.

## Context

- Related: NestJS email sending
- Dependencies: None

## Requirements

1. Install email package (nodemailer or @resend/resend-react)
2. Create EmailService with send method
3. Support both SMTP and Resend providers
4. Configuration via environment variables

## Architecture

```typescript
// EmailService
@Injectable()
export class EmailService {
  async send(to: string, subject: string, html: string): Promise<void>
  async sendTemplate(templateId: string, to: string, data: object): Promise<void>
}
```

## Files to Create

```
backend/src/modules/email/
├── email.module.ts
├── email.service.ts
├── providers/
│   ├── smtp.provider.ts
│   └── resend.provider.ts
└── interfaces/
    └── email.interface.ts
```

## Configuration

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxx
# OR
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=user@gmail.com
SMTP_PASS=app_password
```

## Implementation Steps

1. Install nodemailer package
2. Create email module
3. Create SMTP provider
4. Create Resend provider
5. Create EmailService with send method

## Success Criteria

- [ ] Can send email via SMTP
- [ ] Can send email via Resend
- [ ] Configuration via env vars

## Security Considerations

- Store API keys in environment variables
- Don't log sensitive data
