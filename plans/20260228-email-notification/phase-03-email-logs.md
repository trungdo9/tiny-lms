# Phase 3: Email Log Module

## Overview

**Date:** 2026-02-28
**Priority:** Medium
**Status:** Pending

Create module to log all sent emails.

## Context

- Related: Phase 1 (Email Service)
- Dependencies: Phase 1

## Requirements

1. EmailLog model in database
2. Auto-log every sent email
3. Query logs (admin)
4. Track delivery status

## Database Schema

```prisma
model EmailLog {
  id            String    @id @default(uuid()) @db.Uuid
  to            String
  subject       String
  body          String?   @db.Text
  templateId    String?   @map("template_id") @db.Uuid
  status        String    @default("sent") // sent, failed, opened, clicked
  errorMessage  String?   @map("error_message")
  metadata      Json?     // extra data
  sentAt        DateTime  @default(now()) @map("sent_at")
  openedAt      DateTime? @map("opened_at")
  clickedAt     DateTime? @map("clicked_at")

  template      EmailTemplate? @relation(fields: [templateId], references: [id])

  @@index([to])
  @@index([status])
  @@index([sentAt])
}
```

## Files to Modify

- `backend/src/modules/email/email.service.ts` - Add logging

## Log Flow

```
1. EmailService.send() called
2. Create EmailLog with status "sending"
3. Send email via provider
4. Update EmailLog with status "sent" or "failed"
5. If failed, save error message
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /email-logs | List logs (admin) |
| GET | /email-logs/:id | Get log detail |
| GET | /email-logs/user/:userId | Logs for user |

## Implementation Steps

1. Add EmailLog model to schema
2. Update EmailService to log before/after send
3. Add query methods to EmailLogService

## Success Criteria

- [ ] Every email logged
- [ ] Can query logs
- [ ] Error tracking

## Security Considerations

- Don't log email body (privacy)
- Admin-only access to logs
