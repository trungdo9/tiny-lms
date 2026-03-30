# Supabase Auth: Comparison with Better Auth

## Feature Matrix

| Feature | Supabase Auth | Better Auth |
|---------|--------------|-------------|
| Email/Password | Yes | Yes |
| OAuth (Google, GitHub) | Yes | Yes |
| Magic Link | Yes | Yes (plugin) |
| SAML/SSO | Yes (Enterprise) | No |
| 2FA/TOTP | Yes | Yes (plugin) |
| Passkeys/WebAuthn | Yes | Yes (plugin) |
| Session Management | Yes | Yes |
| RLS Integration | Built-in | Via adapter |
| JWT Tokens | Yes | Yes |
| Framework-agnostic | Yes | Yes |

## Tiny LMS Current Pattern

**Current auth flow:**
1. Better Auth handles session/authentication
2. Supabase JWT tokens generated for API access
3. `SupabaseAuthGuard` validates tokens
4. Prisma queries via PostgreSQL (not Supabase client)

**Existing SupabaseAuthGuard:**
```typescript
// Validates JWT from Authorization header
// Uses SUPABASE_SERVICE_ROLE_KEY to verify tokens
```

## Supabase Auth Integration

### Server-side (NestJS)
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});
```

### Client-side
```typescript
const { data } = await supabase.auth.getSession();
// Access token: data.session.access_token
```

## RLS Auth Helpers

Supabase provides auth helpers for RLS policies:

```sql
-- Current user ID
auth.uid()

-- User role (authenticated, anon)
auth.role()

-- Check if user is authenticated
auth.authenticated()
```

## Migration Considerations

**From Better Auth to Supabase Auth would require:**
- User table schema changes
- Session management rewrite
- Auth guard updates
- Token refresh logic changes
- Email verification flow changes

**Not recommended unless there's a strong business reason.**

## When to Use Each

| Use Case | Recommendation |
|----------|----------------|
| Need SAML/SSO | Supabase Auth |
| Simple email/password | Either (Better Auth simpler) |
| Already using Better Auth | Keep Better Auth |
| Need heavy Supabase ecosystem | Supabase Auth |
| Custom auth logic needed | Better Auth |

## See also
- setup-configuration.md
- nestjs-integration.md
- database-prisma.md
