# Realtime Subscriptions

## Overview

Supabase Realtime broadcasts database changes to connected clients via WebSocket connections.

## Enable Realtime on Table

In Supabase Dashboard:
1. Go to Database → Tables
2. Select table → Replication
3. Enable "Enable Replication"

Or via SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

## Client Subscription Pattern

```typescript
const subscription = supabase
  .channel('table-changes')
  .on(
    'postgres_changes',
    {
      event: '*',  // INSERT, UPDATE, DELETE, or '*'
      schema: 'public',
      table: 'messages'
    },
    (payload) => {
      console.log('Change received:', payload);
    }
  )
  .subscribe();

// Cleanup on unmount
() => supabase.removeChannel(subscription);
```

## Event Types

| Event | Use Case |
|-------|----------|
| `INSERT` | New record created |
| `UPDATE` | Record modified |
| `DELETE` | Record deleted |
| `*` | All changes |

## Channel Management

```typescript
// Subscribe to multiple tables
const channel = supabase
  .channel('multi-table')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, handleCourseChange)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, handleLessonChange)
  .subscribe();

// Unsubscribe
supabase.removeChannel(channel);
```

## Presence (Collaborative Features)

For collaborative features (cursors, typing indicators):

```typescript
const channel = supabase.channel('room-1')

// Track presence
channel.track({ user_id: '123', online_at: new Date().toISOString() })

// Listen to presence changes
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  console.log('Online users:', state)
})
```

## Broadcast (Custom Events)

For low-latency messaging not tied to database:

```typescript
// Send event
channel.send({
  type: 'broadcast',
  event: 'cursor_move',
  payload: { x: 100, y: 200 }
});

// Receive event
channel.on('broadcast', { event: 'cursor_move' }, (payload) => {
  console.log('Cursor moved:', payload.payload)
})
```

## NestJS Integration

```typescript
@Injectable()
export class RealtimeService {
  constructor(private supabaseService: SupabaseService) {}

  subscribeToCourseChanges(courseId: string, callback: (payload: any) => void) {
    return this.supabaseService.client
      .channel(`course-${courseId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lessons',
        filter: `courseId=eq.${courseId}`
      }, callback)
      .subscribe();
  }
}
```

## See also
- database-prisma.md
- nestjs-integration.md
