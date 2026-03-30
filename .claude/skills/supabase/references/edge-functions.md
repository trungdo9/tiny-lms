# Edge Functions

## Overview

Supabase Edge Functions are serverless Deno functions that run close to your users for low-latency responses.

## When to Use

- Webhook handlers (payment processors)
- Email sending (via third-party APIs)
- Image/video processing
- API integrations
- Lightweight auth flows

## Deno Runtime

Edge Functions use Deno, not Node.js:
- No `require()`, use ES modules
- Global `Deno` object instead of `process`
- Standard Web APIs (fetch, etc.)

## Basic Function

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { userId, title, body } = await req.json();

  // Send push notification, email, etc.
  // await sendPushNotification(userId, title, body);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

## Request Handling

```typescript
serve(async (req) => {
  const method = req.method;

  if (method === 'POST') {
    const body = await req.json();
    // Handle POST
  }

  return new Response('Method not allowed', { status: 405 });
});
```

## Database Access from Edge

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data } = await supabase.from('users').select();
  return new Response(JSON.stringify(data));
});
```

## Auth in Edge Functions

```typescript
serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verify token with Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return new Response('Invalid token', { status: 401 });
  }

  // Process with user context
});
```

## Local Development

```bash
# Login to Supabase CLI
supabase login

# Start local development
supabase functions serve send-notification --env-file .env.local

# Test
curl -X POST http://localhost:54321/functions/v1/send-notification \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","title":"Hi","body":"Hello"}'
```

## Deployment

```bash
supabase functions deploy send-notification
```

## Cold Starts

Edge Functions have cold starts (~200-500ms). For latency-critical paths, consider:
- Keeping functions warm
- Using persistent connections
- Edge caching

## See also
- nestjs-integration.md
- storage.md
