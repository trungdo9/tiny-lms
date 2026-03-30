# Phase 2: Reference documentation

**Owner:** Claude
**Status:** ✅ Complete

## Outcome
All reference documents created in `.claude/skills/supabase/references/`.

## Tasks

### 1. references/setup-configuration.md
**Content:**
- Environment variables explanation
- Client initialization patterns (anon vs admin)
- Service role key usage (server-side only)
- TypeScript type generation with Supabase CLI
- Connection pooling notes for PostgreSQL

### 2. references/auth-comparison.md
**Content:**
- Supabase Auth vs Better Auth feature matrix
- Tiny LMS current auth flow (Better Auth + JWT via Supabase tokens)
- Supabase Auth providers (email, OAuth, magic link, SAML)
- Session management patterns
- JWT structure and claims
- RLS auth helpers (`auth.uid()`, `auth.role()`)
- Migration considerations (not action items, just documentation)

### 3. references/database-prisma.md
**Content:**
- Prisma + Supabase PostgreSQL patterns
- RLS policy examples for common operations
- Using `auth.uid()` in RLS
- Combining Prisma queries with RLS
- Migration considerations
- Index recommendations for Supabase/PostgreSQL

### 4. references/realtime.md
**Content:**
- Enabling realtime per table
- Realtime architecture (PostgreSQL → Supabase → client)
- Client subscription patterns
- Channel management
- Presence vs Broadcast
- NestJS integration with realtime
- Unsubscribe patterns

### 5. references/storage.md
**Content:**
- Storage bucket configuration
- Upload patterns (server-side vs signed URLs)
- File size limits
- MIME type restrictions
- Image transformations
- CDN integration notes
- Security patterns (signed URLs vs public buckets)

### 6. references/edge-functions.md
**Content:**
- When to use Edge Functions
- Deno runtime basics
- Request/response patterns
- Database access from Edge
- Auth in Edge Functions
- Cold start considerations
- Local development with Supabase CLI
- Deployment patterns

### 7. references/nestjs-integration.md
**Content:**
- NestJS module pattern for SupabaseService (already exists)
- Injecting SupabaseService into controllers/services
- Auth guard adaptation (SupabaseAuthGuard pattern)
- Using Supabase client for specific features
- Admin client for privileged operations
- Error handling patterns
- Testing Supabase integrations

## Reference file structure (example: auth-comparison.md)

```markdown
# Supabase Auth: Comparison with Better Auth

## Feature Matrix

| Feature | Supabase Auth | Better Auth |
|---------|--------------|-------------|
| Email/Password | Yes | Yes |
| OAuth (Google, GitHub, etc.) | Yes | Yes |
| Magic Link | Yes | Yes (plugin) |
| SAML/SSO | Yes (Enterprise) | No |
| 2FA/TOTP | Yes | Yes (plugin) |
| Passkeys/WebAuthn | Yes | Yes (plugin) |
| Session Management | Yes | Yes |
| RLS Integration | Built-in | Via adapter |
| JWT Tokens | Yes | Yes |

## Tiny LMS Current Pattern

Current auth flow:
1. Better Auth handles session/auth
2. Supabase JWT tokens generated for API access
3. SupabaseAuthGuard validates tokens
4. Prisma queries via PostgreSQL (not Supabase client)

## Supabase Auth Integration

### Server-side (NestJS)
```ts
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});
```

### Client-side
```ts
const { data } = await supabase.auth.getSession();
```

## RLS Auth Helpers

Supabase provides auth helpers for RLS:
```sql
-- Current user ID
auth.uid()

-- User role
auth.role()

-- Check if user is authenticated
auth.authenticated()
```

## See also
- setup-configuration.md
- nestjs-integration.md
```

## Acceptance
- All 7 reference files created
- Each reference is ~40-80 lines
- Code examples are specific to Tiny LMS context
- Consistent markdown structure across files
