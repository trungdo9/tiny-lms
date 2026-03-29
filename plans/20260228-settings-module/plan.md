# Settings Module Plan

**Date:** 2026-02-28

## Overview

Create settings module for application configuration including email settings and white label branding.

## Implementation Phases

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Settings Model & API | ✅ Completed |
| Phase 2 | Settings Service | ✅ Completed |
| Phase 3 | White Label Configuration | ✅ Completed |
| Phase 4 | Frontend Settings Pages | ✅ Completed |

## Database Schema

```prisma
model Setting {
  id        String   @id @default(uuid()) @db.Uuid
  key       String   @unique
  value     String   @db.Text
  type      String   @default("string") // string, number, boolean, json
  category  String   @default("general")
  isSecret  Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([category])
}
```

## Settings Categories

### 1. General Settings
| Key | Type | Default |
|-----|------|---------|
| site_name | string | Tiny LMS |
| site_url | string | |
| site_description | string | |

### 2. Email Settings
| Key | Type | Default |
|-----|------|---------|
| email_provider | string | smtp |
| email_smtp_host | string | smtp.gmail.com |
| email_smtp_port | number | 587 |
| email_smtp_user | string | |
| email_smtp_pass | string (secret) | |
| email_from_name | string | Tiny LMS |
| email_from_email | string | noreply@tinylms.com |
| resend_api_key | string (secret) | |

### 3. White Label Settings
| Key | Type | Default |
|-----|------|---------|
| brand_name | string | Tiny LMS |
| brand_logo | string (url) | |
| brand_favicon | string (url) | |
| brand_primary_color | string | #3b82f6 |
| brand_secondary_color | string | #8b5cf6 |
| brand_accent_color | string | #10b981 |
| brand_text_color | string | #1f2937 |
| brand_background_color | string | #ffffff |
| brand_login_image | string (url) | |
| brand_login_bg_color | string | #f8fafc |
| brand_og_image | string (url) | |
| brand_dark_mode | boolean | false |
| brand_login_message | string | |
| brand_footer_text | string | © 2024 Tiny LMS |
| brand_terms_url | string | |
| brand_privacy_url | string | |
| brand_facebook_url | string | |
| brand_twitter_url | string | |
| brand_instagram_url | string | |
| brand_youtube_url | string | |
| brand_custom_css | text | |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /settings | List all settings |
| GET | /settings/:category | List by category |
| GET | /settings/public | Public settings (no auth) |
| PUT | /settings/:key | Update setting |

## White Label Usage

Frontend applies branding dynamically:
```typescript
// Get settings on app init
const settings = await fetch('/settings/public');

// Apply to CSS variables
document.documentElement.style.setProperty('--primary', settings.brand_primary_color);
```

## Frontend Pages

```
frontend/app/
└── (admin)/
    └── admin/
        └── settings/
            ├── page.tsx           # General
            ├── email/
            │   └── page.tsx       # Email config
            └── branding/
                └── page.tsx       # White label
```

## Status: ✅ Completed
