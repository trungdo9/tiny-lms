# Supabase Storage

## Overview

Supabase Storage provides file storage with access control, image transformations, and CDN integration.

## Bucket Structure

Recommended buckets for Tiny LMS:
- `avatars` - User profile pictures
- `course-media` - Course thumbnails, images
- `lesson-content` - Video, PDFs for lessons
- `quiz-assets` - Images used in questions

## Create Bucket (SQL)

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);
```

## Upload Files

### Server-side Upload
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`users/${userId}/avatar.jpg`, fileBuffer, {
    contentType: 'image/jpeg',
    upsert: true
  });
```

### Client-side with Signed URL
```typescript
// Get signed upload URL (server-side)
const { data: { signedUrl } } = await supabase.storage
  .from('avatars')
  .createSignedUploadUrl(`users/${userId}/avatar.jpg`);

// Client uploads directly to signed URL
await fetch(signedUrl, {
  method: 'PUT',
  body: fileBuffer,
  headers: { 'Content-Type': 'image/jpeg' }
});
```

## Public URLs

```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`users/${userId}/avatar.jpg`);
// Returns: https://xxx.supabase.co/storage/v1/object/public/avatars/users/...
```

## Signed URLs (Time-limited Access)

```typescript
// Create signed URL (expires in 60 seconds)
const { data } = await supabase.storage
  .from('course-media')
  .createSignedUrl('video.mp4', 60);

// Download using signed URL
const response = await fetch(data.signedUrl);
```

## Storage Policies

```sql
-- Allow public read of avatars
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Image Transformations

Supabase can resize images on-the-fly:

```
https://xxx.supabase.co/storage/v1/object/public/avatars/photo.jpg?width=200&height=200
```

Parameters:
- `width` / `height` - Resize dimensions
- `quality` - Image quality (1-100)
- `format` - webp, avif, original

## File Size Limits

Default limits:
- Free tier: 50MB per file
- Pro tier: 5GB per file

## See also
- nestjs-integration.md
- auth-comparison.md
