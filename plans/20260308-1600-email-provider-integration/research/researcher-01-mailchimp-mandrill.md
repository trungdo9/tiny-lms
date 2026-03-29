# Mailchimp Marketing API v3 — Contact Sync Research

## 1. API Overview
Mailchimp Marketing API v3 is a REST API for managing audiences (lists), contacts, segments, tags, and campaigns. For LMS contact sync, we use the **Marketing API** (not Mandrill/Transactional).

## 2. NPM Package
**`@mailchimp/mailchimp_marketing`** — Official SDK.
```bash
npm install @mailchimp/mailchimp_marketing
```

## 3. Authentication
API key-based. Format: `<key>-<dc>` where `dc` is the data center (e.g., `us21`).
```typescript
import mailchimp from '@mailchimp/mailchimp_marketing';
mailchimp.setConfig({ apiKey: 'YOUR_API_KEY', server: 'us21' });
```

## 4. Key API Endpoints for Contact Sync
- **Add/Update member**: `PUT /lists/{list_id}/members/{subscriber_hash}` (upsert)
- **Batch operations**: `POST /batches` for bulk sync
- **Tags**: `POST /lists/{list_id}/members/{subscriber_hash}/tags`
- **Segments**: `POST /lists/{list_id}/segments`
- **Get member info**: `GET /lists/{list_id}/members/{subscriber_hash}`
- **Delete member**: `DELETE /lists/{list_id}/members/{subscriber_hash}`

## 5. Adding/Updating Contacts (NestJS Example)
```typescript
import mailchimp from '@mailchimp/mailchimp_marketing';
import crypto from 'crypto';

const subscriberHash = crypto.createHash('md5')
  .update(email.toLowerCase()).digest('hex');

await mailchimp.lists.setListMember(listId, subscriberHash, {
  email_address: email,
  status_if_new: 'subscribed',
  merge_fields: {
    FNAME: firstName,
    LNAME: lastName,
    ROLE: 'student',
  },
  tags: ['enrolled', 'course-javascript-101'],
});
```

## 6. Tag Management
Tags are used to segment contacts by behavior:
- `POST /lists/{list_id}/members/{hash}/tags` — add/remove tags
- Tags: role (student/instructor), course enrollment, completion status

```typescript
await mailchimp.lists.updateListMemberTags(listId, subscriberHash, {
  tags: [
    { name: 'student', status: 'active' },
    { name: 'course-js-101', status: 'active' },
  ],
});
```

## 7. Webhook Events (Incoming)
Mailchimp sends webhooks for:
- `subscribe` / `unsubscribe` — member joins/leaves list
- `profile` — member updates profile
- `cleaned` — email bounced/invalid
- `campaign` — campaign events

Payload is form-encoded POST. Must verify with webhook secret.

## 8. Rate Limits
- 10 concurrent connections max
- Batch API for bulk operations (up to 500 operations per batch)
- No hard per-minute limit, but throttled if excessive

## 9. Pricing
- Free: 500 contacts, 1,000 sends/month
- Standard: starts at $13/month for 500 contacts
- API access available on all plans

## 10. Best Practices for NestJS Integration
- Use `PUT` (upsert) for idempotent contact sync
- MD5 hash of lowercase email as subscriber_hash
- Use batch API for initial/bulk sync
- Store Mailchimp list_id in Settings table
- Use tags for dynamic segmentation (not static segments)
- Handle webhook for bi-directional sync (unsubscribe)
