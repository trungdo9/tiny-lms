# Phase 2: Email Templates Module

## Overview

**Date:** 2026-02-28
**Priority:** High
**Status:** Pending

Create module to manage email templates.

## Context

- Related: Phase 1 (Email Service)
- Dependencies: Phase 1

## Requirements

1. EmailTemplate model in database
2. CRUD endpoints for templates
3. Variable substitution (handlebars-style)
4. Default templates (welcome, enrollment, certificate)

## Database Schema

```prisma
model EmailTemplate {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique // welcome, enrollment, certificate, etc.
  subject     String
  body        String   @db.Text // HTML with {{variable}} placeholders
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
}
```

## Default Templates

| Name | Subject | Variables |
|------|---------|-----------|
| welcome | Welcome to Tiny LMS | {{name}}, {{email}} |
| enrollment | You're enrolled in {{courseName}} | {{name}}, {{courseName}} |
| certificate | Your certificate is ready | {{name}}, {{certificateUrl}} |
| password_reset | Reset your password | {{name}}, {{resetUrl}} |

## Files to Create

```
backend/src/modules/email-templates/
├── email-templates.module.ts
├── email-templates.controller.ts
├── email-templates.service.ts
└── dto/
    ├── create-template.dto.ts
    └── update-template.dto.ts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /email-templates | List templates |
| GET | /email-templates/:id | Get template |
| POST | /email-templates | Create template |
| PUT | /email-templates/:id | Update template |
| DELETE | /email-templates/:id | Delete template |

## Implementation Steps

1. Add EmailTemplate model to schema
2. Create email-templates module
3. Create CRUD endpoints
4. Add default templates seeding

## Success Criteria

- [ ] Can create/update/delete templates
- [ ] Templates support variable substitution
- [ ] Default templates seeded

## Risk Assessment

- Template injection risk - sanitize variables
