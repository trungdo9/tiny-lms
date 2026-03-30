# Phase 1: Skill structure and main SKILL.md

**Owner:** Claude
**Status:** ✅ Complete

## Outcome
`.claude/skills/supabase/SKILL.md` created with comprehensive skill documentation.

## Tasks

### 1. Create directory structure
```
.claude/skills/supabase/
  SKILL.md
  .env.example
  references/
    setup-configuration.md
    auth-comparison.md
    database-prisma.md
    realtime.md
    storage.md
    edge-functions.md
    nestjs-integration.md
```

### 2. Create SKILL.md
SKILL.md structure:
- **Frontmatter**: name, description, license, version
- **When to Use**: list Supabase use cases
- **Quick Start**: installation, env setup, basic client creation
- **Feature Selection Matrix**: table mapping features to reference docs
- **Auth Comparison**: when to use Supabase Auth vs Better Auth
- **Integration Checklist**: NestJS + Supabase integration steps
- **Resources**: links to Supabase docs

### 3. Create .env.example
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. SKILL.md Content outline

```markdown
---
name: supabase
description: Supabase integration for TypeScript/Node.js - auth, database, realtime, storage, edge functions. Use when adding Supabase features to NestJS apps, setting up RLS policies, implementing realtime subscriptions, or designing Supabase-compatible database schemas.
version: 1.0.0
---

# Supabase Skill

## When to Use
- Setting up Supabase client in NestJS backend
- Adding Supabase Auth (vs Better Auth comparison)
- Designing PostgreSQL schemas with RLS
- Implementing realtime subscriptions
- File/media storage with Supabase Storage
- Writing Edge Functions
- Integrating Supabase with existing Prisma setup

## Quick Start

### Installation
```bash
npm install @supabase/supabase-js
```

### Environment Setup
See `.env.example`

### Client Initialization
```ts
// backend/src/common/supabase.service.ts (existing pattern)
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const supabase = createClient(url, anonKey);
export const supabaseAdmin = createClient(url, serviceKey);
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

**Use Supabase Auth when:**
- Need built-in SSO, SAML support
- Using Supabase Storage, Realtime heavily
- Want unified Supabase ecosystem
- Need extensive OAuth provider support

**Use Better Auth when:**
- Already implemented (current Tiny LMS pattern)
- Need simpler, framework-agnostic auth
- Custom auth requirements
- Lighter auth needs

## Integration Checklist

- [ ] Environment variables configured
- [ ] SupabaseService created/updated in NestJS
- [ ] Auth guard adapted (SupabaseAuthGuard exists)
- [ ] RLS policies designed for tables
- [ ] Realtime enabled per table if needed
- [ ] Storage buckets configured
- [ ] Edge Functions deployed if needed

## Resources
- Docs: https://supabase.com/docs
- GitHub: https://github.com/supabase/supabase
- JS Client: https://supabase.com/docs/guides/client
```

## Acceptance
- SKILL.md follows better-auth pattern
- .env.example matches project env structure
- references/ directory placeholder created
