# Research: Backend Settings API & Database

**Date:** 2026-03-19
**Focus:** Detailed analysis of backend implementation patterns for settings

---

## Current Backend Settings Flow

### Service Implementation Details

**File:** `backend/src/modules/settings/settings.service.ts`

**Current seedDefaults() structure:**

```typescript
const defaults = [
  // General
  { key: 'site_name', value: 'Tiny LMS', type: 'string', category: 'general' },
  // ... more settings
  // Auth
  { key: 'auth.require_email_verification', value: 'false', type: 'boolean', category: 'auth' },
];

for (const s of defaults) {
  await this.prisma.setting.upsert({
    where: { key: s.key },
    create: { key: s.key, value: s.value, type: s.type, category: s.category, isSecret: s.isSecret || false },
    update: {},
  });
}
```

**Key Pattern:** Uses upsert to idempotently seed defaults. If key exists, skips update.

### Type Conversion Logic

**parseValue() implementation:**

```typescript
private parseValue(setting: { key: string; value: string | null; type: string; isSecret?: boolean }) {
  let value: unknown = setting.value;
  if (setting.type === 'number') {
    value = Number(setting.value);
  } else if (setting.type === 'boolean') {
    value = setting.value === 'true';
  } else if (setting.type === 'json') {
    try {
      value = JSON.parse(setting.value || '{}');
    } catch {
      value = {};
    }
  }
  return { key: setting.key, value, type: setting.type, isSecret: setting.isSecret };
}
```

**Implication:** All values stored as strings in DB, converted on retrieval. Safe for GA code (always string).

### Public Endpoint (used by frontend)

**getPublic() returns:**
- Only settings with `category='branding'`
- Only settings with `isSecret=false`
- Returns raw key-value pairs (no wrapper)

**Used in:** Frontend layout to fetch branding colors, logos, etc.

---

## Controller Route Patterns

**File:** `backend/src/modules/settings/settings.controller.ts`

**PUT /settings/:key implementation:**

```typescript
@Put(':key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
update(@Param('key') key: string, @Body() body: { value: unknown; type?: string }) {
  const { value, type = 'string' } = body;
  return this.settingsService.set(key, value, type);
}
```

**Pattern:**
1. Body accepts `{value, type}` object
2. Type defaults to 'string' if not provided
3. Service handles stringify and upsert

**How it works:**
- `key` is URL param (e.g., `analytics_ga_code`)
- `value` is from JSON body
- Service converts to string before storage

---

## Authorization Pattern

**JwtAuthGuard:** Validates JWT token from `Authorization: Bearer <token>` header
- If invalid/missing: returns 401
- Extracts user info into `req.user`

**RolesGuard:** Checks `req.user.role` matches decorator
- `@Roles(Role.ADMIN)` requires role='admin'
- Returns 403 if role mismatch

**Pattern is consistent across all admin routes**

---

## Database Considerations

### No Migration Needed
- Setting model already exists
- Adding GA code is just a row insert in seedDefaults()
- Backward compatible (no schema changes)

### Indexing
- `@@index([category])` means querying by category is fast
- GA code queries will hit this index

### Value Field
- `value String? @db.Text` — can store large strings
- GA ID is max ~50 chars, plenty of room

---

## Validation Strategy

**Current pattern in codebase:**
- Backend uses class-validator decorators on DTOs
- Controllers accept typed bodies
- Service doesn't validate beyond type conversion

**For GA code:**
- Could add regex validation to service
- Or add custom DTO + decorator
- KISS: Validate in service.set() with simple regex

**GA4 Format:** `G-XXXXXXXXXX` (G- prefix + 10 alphanumeric chars)

---

## Error Handling Patterns

From existing code:
- Service throws `NotFoundException` when key not found
- Service throws standard exceptions (BadRequestException, ConflictException)
- Controller catches and returns HTTP error responses (NestJS auto-converts)

**For GA code validation:**
- Could throw `BadRequestException` if regex fails
- Or silently accept and store (KISS approach)

---

## Dependencies

**Service uses:**
- `PrismaService` — injected, wraps Prisma client
- No external APIs

**Controller uses:**
- `SettingsService` — injected
- `JwtAuthGuard` — imported from common guards
- `RolesGuard` — imported from common guards
- `Roles` decorator — imported from common decorators

---

## Seeding Mechanics

**Triggered by:** `POST /settings/seed` endpoint (admin only)

**Does not run automatically on startup**
- Must be manually invoked via API
- Or can be added to app bootstrap if needed

**Idempotent:** Upsert means multiple calls are safe

---

## Frontend API Client Pattern

**settingsApi object structure:**

```typescript
export const settingsApi = {
  getByCategory: (category: string) => 
    fetchApi(`/settings/category/${category}`),
  
  update: (key: string, data: { value: unknown; type?: string }) =>
    fetchApi(`/settings/${key}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
};
```

**fetchApi wrapper:**
- Adds JWT token from Supabase session
- Handles auth headers
- Parses JSON responses
- Throws on non-2xx status

---

## Key Decisions for GA Code Backend

1. **Add to analytics category** — new category, clean separation
2. **Key name:** `analytics_ga_code` — clear, follows snake_case pattern
3. **Type:** `string` — GA ID is always a string
4. **isSecret:** `false` — GA code is public info (not API key)
5. **Validation:** Simple regex in service, throw BadRequestException on mismatch
6. **Default value:** Empty string (admin must configure)
7. **Seeding:** Add to seedDefaults() array

---

## Implementation Checklist for Backend

- [ ] Add `{ key: 'analytics_ga_code', value: '', type: 'string', category: 'analytics', isSecret: false }` to seedDefaults()
- [ ] Optional: Add GA code validation regex in SettingsService.set()
- [ ] Optional: Add GA code DTO with @IsString() + @Matches(gaIdRegex)
- [ ] Test: POST /settings/seed → verify GA code is created
- [ ] Test: PUT /settings/analytics_ga_code → update works
- [ ] Test: GET /settings/category/analytics → returns GA code

---

## Next Phase: Frontend

After backend is seeded, frontend:
1. Layout calls `settingsApi.getByCategory('analytics')`
2. Extracts `analytics_ga_code` value
3. Falls back to env var
4. Renders GA script tag with effective ID
