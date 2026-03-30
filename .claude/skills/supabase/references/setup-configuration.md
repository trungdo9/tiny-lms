# Supabase Setup & Configuration

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

| Variable | Purpose | Exposure |
|----------|---------|----------|
| `SUPABASE_URL` | Project endpoint | Safe to expose |
| `SUPABASE_ANON_KEY` | Client-side API key | Safe to expose (RLS protects) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin access | **Never expose to client** |

## Client Initialization

### Anon Client (client-side)
```typescript
const supabase = createClient(url, anonKey);
// Respects RLS policies based on authenticated user
```

### Admin Client (server-side only)
```typescript
const supabaseAdmin = createClient(url, serviceKey);
// Bypasses RLS - use only for trusted operations
```

## TypeScript Types

Generate types from your Supabase schema:

```bash
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

## NestJS Integration Pattern

```typescript
// backend/src/common/supabase.service.ts
@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;
  private readonly admin: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    this.admin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  get client(): SupabaseClient {
    return this.client;
  }

  get admin(): SupabaseClient {
    return this.admin;
  }
}
```

## Connection Pooling

For serverless environments, Supabase handles connection pooling automatically via PgBouncer.

For long-running processes (NestJS), you may need:
```typescript
// Add to connection string for PgBouncer
?pgbouncer=true
```

## See also
- auth-comparison.md
- nestjs-integration.md
