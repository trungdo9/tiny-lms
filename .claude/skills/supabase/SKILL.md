---
name: supabase
description: Supabase integration for TypeScript/Node.js - auth, database, realtime, storage, edge functions. Use when adding Supabase features to NestJS apps, setting up RLS policies, implementing realtime subscriptions, or designing Supabase-compatible database schemas.
version: 1.0.0
---

# Supabase Skill

Supabase is an open-source Firebase alternative providing PostgreSQL database, authentication, realtime subscriptions, file storage, and edge functions.

## When to Use

- Setting up Supabase client in NestJS backend
- Adding Supabase Auth (vs Better Auth comparison)
- Designing PostgreSQL schemas with RLS (Row Level Security)
- Implementing realtime subscriptions for live updates
- File/media storage with Supabase Storage
- Writing Edge Functions for serverless logic
- Integrating Supabase with existing Prisma setup

## Quick Start

### Installation

```bash
npm install @supabase/supabase-js
```

### Environment Setup

See `.env.example`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Client Initialization

**Pattern for Tiny LMS (NestJS):**

```typescript
// backend/src/common/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL!;
    const anonKey = process.env.SUPABASE_ANON_KEY!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    this.client = createClient(url, anonKey);
    this.adminClient = createClient(url, serviceKey);
  }

  get client(): SupabaseClient {
    return this.client;
  }

  get admin(): SupabaseClient {
    return this.adminClient;
  }
}
```

## Feature Selection Matrix

| Feature | Use Case | Reference |
|---------|----------|-----------|
| Auth | User authentication | references/auth-comparison.md |
| Database | PostgreSQL via Prisma | references/database-prisma.md |
| RLS Policies | Row-level security | references/database-prisma.md |
| Realtime | Live subscriptions | references/realtime.md |
| Storage | File/media storage | references/storage.md |
| Edge Functions | Serverless logic | references/edge-functions.md |
| NestJS Integration | NestJS + Supabase | references/nestjs-integration.md |

## Auth: Supabase vs Better Auth

Tiny LMS currently uses Better Auth for authentication. Below is guidance on when to use each.

### Use Supabase Auth when:
- Need built-in SSO, SAML support (Enterprise)
- Using Supabase Storage, Realtime heavily
- Want unified Supabase ecosystem
- Need extensive OAuth provider support
- Migrating away from Better Auth (significant effort)

### Use Better Auth when:
- Already implemented (current Tiny LMS pattern)
- Need simpler, framework-agnostic auth
- Custom auth requirements
- Lighter auth needs
- Want to avoid vendor lock-in

## Supabase Auth Providers

| Provider | Supabase | Better Auth |
|----------|---------|------------|
| Email/Password | Yes | Yes |
| OAuth (Google, GitHub) | Yes | Yes |
| Magic Link | Yes | Yes (plugin) |
| SAML/SSO | Yes (Enterprise) | No |
| 2FA/TOTP | Yes | Yes (plugin) |
| Passkeys/WebAuthn | Yes | Yes (plugin) |

## RLS (Row Level Security)

Supabase provides built-in RLS for PostgreSQL. RLS policies filter rows based on user authentication.

```sql
-- Example: Users can only read their own profiles
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Example: Users can only update their own data
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
```

See: references/database-prisma.md

## Realtime Subscriptions

Enable realtime on tables for live updates:

```typescript
const subscription = supabase
  .channel('table-db-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log('Change received:', payload);
  })
  .subscribe();
```

See: references/realtime.md

## Storage

Supabase Storage for files/media:

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-123/avatar.jpg', fileBuffer);

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-123/avatar.jpg');
```

See: references/storage.md

## Edge Functions

Serverless Deno functions:

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { email, subject } = await req.json();
  // Send email logic
  return new Response(JSON.stringify({ success: true }));
});
```

See: references/edge-functions.md

## Integration Checklist

- [ ] Environment variables configured in `.env`
- [ ] SupabaseService created/updated in NestJS
- [ ] Auth guard adapted if using Supabase Auth (current SupabaseAuthGuard handles JWT)
- [ ] RLS policies designed for sensitive tables
- [ ] Realtime enabled per table if needed
- [ ] Storage buckets configured (avatars, course-media, etc.)
- [ ] Edge Functions deployed if needed
- [ ] TypeScript types generated with `npx supabase gen types typescript`

## Resources

- Docs: https://supabase.com/docs
- GitHub: https://github.com/supabase/supabase
- JS Client: https://supabase.com/docs/guides/client
- Supabase Auth: https://supabase.com/docs/guides/auth
- Realtime: https://supabase.com/docs/guides/realtime
- Storage: https://supabase.com/docs/guides/storage
- Edge Functions: https://supabase.com/docs/guides/edge-functions
