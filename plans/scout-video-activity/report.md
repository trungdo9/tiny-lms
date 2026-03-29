# Video Activity Feature - Codebase Scout Report

**Report Date**: 2026-03-21  
**Search Scope**: Video activity feature across full stack  
**Status**: Complete

---

## Executive Summary

The "video activity" feature in this LMS is distributed across database schema, backend API, frontend components, and utility functions. Videos are supported in two places:

1. **Lesson-level videos** — Embedded directly on Lesson model with `videoUrl` and `videoProvider`
2. **Activity-type videos** — Stored as Activity records with `activityType='video'`, `contentUrl`, and `contentType`

Both support multiple providers: YouTube, Vimeo, S3 uploads, and direct uploads.

---

## 1. Database Schema Files

### Primary Schema Definition
**File**: `/home/trung/workspace/project/private/tiny-lms/backend/prisma/schema.prisma`

Key video-related models:

#### Activity Model (Lines 122-145)
```prisma
model Activity {
  id            String    @id @default(uuid()) @db.Uuid
  lessonId      String    @map("lesson_id") @db.Uuid
  activityType  String    @map("activity_type") // quiz, flashcard, video, file, assignment
  title         String
  orderIndex    Int       @default(0) @map("order_index")
  isPublished   Boolean   @default(false) @map("is_published")

  // Video/File content (for activityType = video or file)
  contentUrl    String?   @map("content_url")
  contentType   String?   @map("content_type") // youtube, vimeo, upload, pdf, doc, etc.

  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  lesson        Lesson          @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  quiz          Quiz?
  flashCardDeck FlashCardDeck?
  assignment    Assignment?

  @@schema("public")
  @@map("activities")
}
```

#### Lesson Model (Lines 147-181) - Video Fields
```prisma
model Lesson {
  // ... other fields ...
  videoUrl             String?   @map("video_url")
  videoProvider        String?   @map("video_provider")
  // ... other fields ...
}
```

**Key Insights**:
- Activities can have type "video" with `contentUrl` and `contentType` for provider identification
- Lessons have dedicated `videoUrl` and `videoProvider` fields for lesson-level videos
- `contentType` values: youtube, vimeo, s3, upload
- `videoProvider` values: youtube, vimeo, s3, upload
- Both are optional and self-contained (no separate Video entity)

---

## 2. Backend API Routes & Controllers

### Activities Controller
**File**: `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/activities/activities.controller.ts`

Routes:
- `GET /lessons/:lessonId/activities` — Fetch all activities for a lesson
- `POST /lessons/:lessonId/activities` — Create activity (including video type)
- `GET /activities/:id` — Get activity by ID
- `PUT /activities/:id` — Update activity (video URL, provider, etc.)
- `DELETE /activities/:id` — Delete activity
- `PUT /lessons/:lessonId/activities/reorder` — Reorder activities

### Activities Service
**File**: `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/activities/activities.service.ts`

Key methods:
- `create(userId, lessonId, dto)` — Creates Activity with video fields
- `findByLesson(lessonId)` — Returns activities with counts for related entities
- `findById(activityId)` — Full activity details including quiz/flashcard relations
- `update(userId, activityId, dto)` — Updates contentUrl, contentType, title, published status
- `delete(userId, activityId)` — Cascades delete to quiz/flashcard/assignment
- `reorder(userId, lessonId, activityIds)` — Reorders activities by orderIndex

### Activity DTOs
**File**: `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/activities/dto/activity.dto.ts`

```typescript
export class CreateActivityDto {
  @IsString()
  activityType: 'quiz' | 'flashcard' | 'video' | 'file';

  @IsString()
  title: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  // For video/file types
  @IsString()
  @IsOptional()
  contentUrl?: string;

  @IsString()
  @IsOptional()
  contentType?: string;
}

export class UpdateActivityDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  contentUrl?: string;

  @IsString()
  @IsOptional()
  contentType?: string;
}
```

### Lesson DTOs
**File**: `/home/trung/workspace/project/private/tiny-lms/backend/src/modules/lessons/dto/lesson.dto.ts`

```typescript
export class CreateLessonDto {
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsEnum(['youtube', 'vimeo', 's3', 'upload'])
  @IsOptional()
  videoProvider?: string;
  // ... other fields ...
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsEnum(['youtube', 'vimeo', 's3', 'upload'])
  @IsOptional()
  videoProvider?: string;
  // ... other fields ...
}
```

---

## 3. Frontend API Client

**File**: `/home/trung/workspace/project/private/tiny-lms/frontend/lib/api.ts` (Lines 329-347)

```typescript
export const activitiesApi = {
  getByLesson: (lessonId: string) =>
    fetchApi(`/lessons/${lessonId}/activities`),

  create: (lessonId: string, data: { 
    activityType: string; 
    title: string; 
    isPublished?: boolean; 
    contentUrl?: string; 
    contentType?: string 
  }) =>
    fetchApi(`/lessons/${lessonId}/activities`, { method: 'POST', body: JSON.stringify(data) }),

  update: (activityId: string, data: { 
    title?: string; 
    isPublished?: boolean; 
    contentUrl?: string; 
    contentType?: string 
  }) =>
    fetchApi(`/activities/${activityId}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (activityId: string) =>
    fetchApi(`/activities/${activityId}`, { method: 'DELETE' }),

  reorder: (lessonId: string, activityIds: string[]) =>
    fetchApi(`/lessons/${lessonId}/activities/reorder`, { method: 'PUT', body: JSON.stringify({ activityIds }) }),

  getById: (activityId: string) =>
    fetchApi(`/activities/${activityId}`),
};
```

---

## 4. Frontend Components

### ActivityList Component
**File**: `/home/trung/workspace/project/private/tiny-lms/frontend/components/activity/ActivityList.tsx`

Features:
- Displays activities by type (quiz, flashcard, video, file) with icons
- Create form for new activities with type selector
- Conditional fields for video/file activities: contentUrl and contentType input
- Activity info display: video type or file type info
- Delete, edit, publish/draft status toggle
- Click handlers: quiz routes to quiz editor, flashcard to flashcard editor, video/file opens URL in new tab

Key code snippet (Activity interface):
```typescript
interface Activity {
  id: string;
  activity_type: 'quiz' | 'flashcard' | 'video' | 'file';
  title: string;
  is_published: boolean;
  content_url?: string;
  content_type?: string;
  quiz?: {
    id: string;
    _count?: { questions: number };
  };
  flash_card_deck?: {
    id: string;
    _count?: { cards: number };
  };
}
```

Activity type icons:
```typescript
const activityIcons: Record<string, string> = {
  quiz: '📝',
  flashcard: '📇',
  video: '🎬',
  file: '📄',
};
```

### LessonContent Component
**File**: `/home/trung/workspace/project/private/tiny-lms/frontend/app/(student)/courses/[slug]/learn/[lessonId]/lesson-content.tsx`

Handles lesson-level video playback:

**Video provider detection** (Lines 20-31):
```typescript
function getVideoEmbedUrl(url: string, provider: string) {
  if (!url) return null;
  if (provider === 'youtube') {
    const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return id ? `https://www.youtube.com/embed/${id[1]}` : null;
  }
  if (provider === 'vimeo') {
    const id = url.match(/vimeo\.com\/(\d+)/);
    return id ? `https://player.vimeo.com/video/${id[1]}` : null;
  }
  return url;
}
```

**Video rendering** (Lines 60-81):
```typescript
{lesson.type === 'video' && lesson.video_url && (
  <div className="max-w-5xl mx-auto border-[4px] border-black shadow-[8px_8px_0px_0px_#000] bg-black mb-10 overflow-hidden">
    <div className="aspect-video w-full">
      {lesson.video_provider === 'youtube' || lesson.video_provider === 'vimeo' ? (
        <iframe
          src={getVideoEmbedUrl(lesson.video_url, lesson.video_provider) || ''}
          className="w-full h-full"
          allowFullScreen
        />
      ) : (
        <video
          ref={videoRef}
          src={lesson.video_url}
          controls
          onTimeUpdate={onVideoTimeUpdate}
          onEnded={onVideoEnded}
          className="w-full h-full"
        />
      )}
    </div>
  </div>
)}
```

**Activities section** (Lines 130-140):
```typescript
{activities && activities.length > 0 && (
  <div className="max-w-4xl mx-auto p-8 mb-10 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000]">
    <h3 className="text-2xl font-black mb-6 border-b-[3px] border-black pb-4 text-black">
      Additional Materials
    </h3>
    <ActivityList lessonId={lessonId} activities={activities} isInstructor={false} />
  </div>
)}
```

### Lesson Page
**File**: `/home/trung/workspace/project/private/tiny-lms/frontend/app/(student)/courses/[slug]/learn/[lessonId]/page.tsx`

- Fetches lesson data (including video_url, video_provider)
- Fetches activities for the lesson
- Fetches flash card deck
- Passes all to LessonContent component
- Video position tracking: saves position every 10 seconds for resume functionality

---

## 5. Documentation

### Course Content & Activities Documentation
**File**: `/home/trung/workspace/project/private/tiny-lms/docs/course-content-and-activities.md`

Key details on video activities:

```
| activityType | Linked Entity | Content Storage |
|-------------|---------------|-----------------|
| `video` | None (self-contained) | `contentUrl` + `contentType` (youtube/vimeo/upload) |
| `file` | None (self-contained) | `contentUrl` + `contentType` (pdf/doc/etc.) |
```

Activity lifecycle:
1. Instructor creates Activity with activityType='video' + title
2. Content stored directly on Activity (contentUrl, contentType)
3. Activities ordered within lesson via orderIndex
4. Deleting Activity cascades: removes linked quiz/flashcard/assignment

### Database Schema Reference
**File**: `/home/trung/workspace/project/private/tiny-lms/docs/database-schema-reference.md`

Activity model entry:
```
| Activity | `activities` | lessonId, activityType (`quiz`/`flashcard`/`video`/`file`/`assignment`), contentUrl, isPublished |
```

---

## 6. Data Structure Summary

### Video Activity Data Structure

**When stored as Activity (activityType='video')**:
```json
{
  "id": "uuid",
  "lessonId": "uuid",
  "activityType": "video",
  "title": "Introduction to TypeScript",
  "orderIndex": 0,
  "isPublished": true,
  "contentUrl": "https://www.youtube.com/watch?v=d56mHvsdrVE",
  "contentType": "youtube",
  "createdAt": "2026-03-21T10:00:00Z",
  "updatedAt": "2026-03-21T10:00:00Z"
}
```

**When stored as Lesson (type='video')**:
```json
{
  "id": "uuid",
  "sectionId": "uuid",
  "courseId": "uuid",
  "title": "Module 1: Basics",
  "type": "video",
  "videoUrl": "https://www.youtube.com/watch?v=d56mHvsdrVE",
  "videoProvider": "youtube",
  "isPublished": true,
  "isPreview": false,
  "durationMins": 45,
  "createdAt": "2026-03-21T10:00:00Z",
  "updatedAt": "2026-03-21T10:00:00Z"
}
```

---

## 7. Video Provider Support

### Supported Providers

| Provider | URL Pattern | Embed Approach |
|----------|------------|-----------------|
| **YouTube** | `youtube.com/watch?v=ID` or `youtu.be/ID` | iframe to `youtube.com/embed/ID` |
| **Vimeo** | `vimeo.com/ID` | iframe to `player.vimeo.com/video/ID` |
| **Direct Upload** | S3 or server URL (e.g., `.mp4`) | Native HTML5 `<video>` element |
| **S3** | S3 signed URL | Native HTML5 `<video>` element |

### Video URL Parsing (in LessonContent.tsx)

YouTube regex: `/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/`  
Vimeo regex: `/vimeo\.com\/(\d+)/`  
Default: Return URL as-is for direct playback

---

## 8. Current Video Activity Flow

### Instructor Workflow

1. **Create Activity**
   - POST `/lessons/:lessonId/activities`
   - Payload: `{ activityType: 'video', title: '...', contentUrl: '...', contentType: 'youtube' }`
   - Backend creates Activity record with contentUrl and contentType

2. **Update Activity**
   - PUT `/activities/:activityId`
   - Can update title, contentUrl, contentType, or publish status

3. **Delete Activity**
   - DELETE `/activities/:activityId`
   - Cascades to delete any quiz/flashcard/assignment linked to it

4. **Manage Activities in Lesson**
   - View all activities in ActivityList
   - Reorder activities with PUT `/lessons/:lessonId/activities/reorder`

### Student Workflow

1. **View Lesson**
   - GET `/lessons/:lessonId/learning`
   - Receives lesson with activities array

2. **Watch Video Activity**
   - ActivityList shows video activity with 🎬 icon
   - Click "View" button to open contentUrl in new tab

3. **Watch Lesson-Level Video**
   - If lesson.type === 'video', display embedded iframe or HTML5 player
   - Player tracks position every 10 seconds

---

## 9. Files Summary

### Complete File List

**Backend**:
- `/backend/prisma/schema.prisma` — DB schema (Activity, Lesson models)
- `/backend/src/modules/activities/activities.controller.ts` — API endpoints
- `/backend/src/modules/activities/activities.service.ts` — Business logic
- `/backend/src/modules/activities/activities.module.ts` — Module config
- `/backend/src/modules/activities/dto/activity.dto.ts` — Request/response schemas
- `/backend/src/modules/lessons/dto/lesson.dto.ts` — Lesson DTOs with video fields

**Frontend**:
- `/frontend/lib/api.ts` — API client for activities
- `/frontend/components/activity/ActivityList.tsx` — Activity component with video support
- `/frontend/app/(student)/courses/[slug]/learn/[lessonId]/lesson-content.tsx` — Video renderer
- `/frontend/app/(student)/courses/[slug]/learn/[lessonId]/page.tsx` — Lesson page with activity fetching

**Documentation**:
- `/docs/course-content-and-activities.md` — Feature documentation
- `/docs/database-schema-reference.md` — Schema reference

---

## 10. Key Features & Capabilities

✓ Multiple video provider support (YouTube, Vimeo, Direct Upload)  
✓ Activity-type videos (self-contained, no linked entity)  
✓ Lesson-level videos (primary content of lesson)  
✓ Video position tracking (saves every 10s for resume)  
✓ Activity ordering (orderIndex)  
✓ Activity publishing control  
✓ Cascade delete (activity deletion removes related data)  
✓ Frontend video embedding with provider detection  
✓ CRUD operations for video activities  

---

## 11. Integration Points

- **Quiz Activities**: Activities can link to Quiz entities (one-to-one via activityId)
- **FlashCard Activities**: Activities can link to FlashCardDeck entities
- **Assignment Activities**: Activities can link to Assignment entities
- **Lesson Progression**: Video completion tracked via lessonProgress.isCompleted
- **Navigation**: Next/previous lesson navigation on lesson page
- **Flash Cards**: Flash card deck display below activities in lesson view

---

*Report completed: 2026-03-21*
