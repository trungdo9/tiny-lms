# Phase 5: Frontend - Admin Email Management

## Overview

**Date:** 2026-02-28
**Priority:** Medium
**Status:** Pending

Create frontend pages for admin to manage email templates and view email logs.

## Context

- Related: Phase 2, 3 (Backend)
- Dependencies: Phase 1, 2, 3

## Requirements

1. Admin-only access to email management
2. Email templates management UI
3. Email logs viewer
4. Settings for email configuration

## Route Structure

```
frontend/app/
└── (admin)/
    └── admin/
        ├── email/
        │   ├── templates/
        │   │   ├── page.tsx         # List templates
        │   │   └── [id]/
        │   │       └── page.tsx    # Edit template
        │   └── logs/
        │       └── page.tsx         # View email logs
        └── settings/
            └── page.tsx             # Email config settings
```

## Access Control

- All routes require admin role
- Use RolesGuard on backend
- Check role on frontend before rendering

## Components

```typescript
// email-templates-list.tsx
- Table listing all templates
- Status indicator (active/inactive)
- Edit/Delete actions

// email-template-editor.tsx
- Subject input
- HTML body editor
- Preview button
- Variable help tooltip

// email-logs-table.tsx
- Filterable table
- Status filter (sent, failed)
- Date range filter
- Search by email

// email-settings-form.tsx
- Provider selection (Resend/SMTP)
- API key input (masked)
- SMTP configuration
- Test email button
```

## Implementation Steps

1. Create admin email routes
2. Create email templates list page
3. Create email template editor page
4. Create email logs page
5. Create email settings page
6. Add access control (admin only)

## API Integration

```typescript
// frontend/lib/api.ts additions
export const emailTemplatesApi = {
  list: () => fetchApi('/email-templates'),
  get: (id) => fetchApi(`/email-templates/${id}`),
  create: (data) => fetchApi('/email-templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchApi(`/email-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchApi(`/email-templates/${id}`, { method: 'DELETE' }),
};

export const emailLogsApi = {
  list: (params) => fetchApi(`/email-logs?${new URLSearchParams(params)}`),
  get: (id) => fetchApi(`/email-logs/${id}`),
};

export const settingsApi = {
  get: () => fetchApi('/settings/email'),
  update: (data) => fetchApi('/settings/email', { method: 'PUT', body: JSON.stringify(data) }),
};
```

## Success Criteria

- [ ] Admin can view/manage email templates
- [ ] Admin can view email logs
- [ ] Admin can configure email settings
- [ ] Non-admin users cannot access

## Security Considerations

- Server-side role validation (cannot trust frontend)
- API keys stored securely (masked in UI)
- Audit log for admin actions
