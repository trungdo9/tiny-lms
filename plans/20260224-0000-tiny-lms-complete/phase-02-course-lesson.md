# Phase 2: Course & Lesson

**Date:** Week 3
**Priority:** P0 - Critical
**Status:** Completed
**Depends On:** Phase 1 (Foundation)

## Implementation Notes (2026-02-25)
- Prisma schema updated with all Phase 2 models
- Database migration pending (Supabase DB paused)
- Backend modules created: Courses, Sections, Lessons, Enrollments, Progress
- Frontend pages created: Course list, Course detail, Lesson viewer
- Note: `npm run start:dev` works, but `npx prisma db push` failed due to unreachable database

## Overview
Implement course management, section organization, lesson types (video, text, PDF), and progress tracking.

## Requirements

### Functional
1. **Course Management**
   - CRUD courses (instructor/admin)
   - Course details: title, description, thumbnail, level, price
   - Course status: draft, published, archived
   - Course categories

2. **Section Management**
   - Create/update/delete sections within course
   - Reorder sections (drag & drop)

3. **Lesson Management**
   - CRUD lessons within sections
   - Lesson types: video, text, PDF, quiz
   - Video providers: YouTube, Vimeo, S3
   - Preview lessons (free without enrollment)

4. **Enrollment**
   - Student enroll in course
   - Check enrollment status
   - View enrolled courses

5. **Progress Tracking**
   - Mark lesson as complete
   - Track video playback position
   - Calculate course completion percentage

### Non-Functional
- Video player with seek position memory
- PDF viewer with page tracking
- Optimistic UI updates

---

## Architecture

### Database Schema
```sql
-- Categories
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  parent_id   UUID REFERENCES categories(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Courses
CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id   UUID REFERENCES profiles(id),
  category_id     UUID REFERENCES categories(id),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  thumbnail_url   TEXT,
  level           TEXT CHECK (level IN ('beginner','intermediate','advanced')),
  status          TEXT CHECK (status IN ('draft','published','archived')) DEFAULT 'draft',
  is_free         BOOLEAN DEFAULT false,
  price           NUMERIC(10,2),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Sections
CREATE TABLE sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Lessons
CREATE TABLE lessons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      UUID REFERENCES sections(id) ON DELETE CASCADE,
  course_id       UUID REFERENCES courses(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  type            TEXT CHECK (type IN ('video','text','pdf','quiz')),
  content         TEXT,
  video_url       TEXT,
  video_provider  TEXT CHECK (video_provider IN ('youtube','vimeo','s3','upload')),
  pdf_url         TEXT,
  duration_mins   INT,
  order_index     INT NOT NULL DEFAULT 0,
  is_preview      BOOLEAN DEFAULT false,
  is_published    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Enrollments
CREATE TABLE enrollments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id),
  course_id     UUID REFERENCES courses(id),
  enrolled_at   TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- Lesson Progress
CREATE TABLE lesson_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id),
  lesson_id       UUID REFERENCES lessons(id),
  course_id       UUID REFERENCES courses(id),
  is_completed    BOOLEAN DEFAULT false,
  last_position   INT DEFAULT 0,
  completed_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
```

### API Endpoints
```
# Course
GET    /courses                   - List (filter, search, pagination)
POST   /courses                   - Create (instructor)
GET    /courses/:id
PUT    /courses/:id               - Update
DELETE /courses/:id               - Delete

# Enrollment
POST   /courses/:id/enroll        - Enroll student
GET    /courses/:id/enrollments  - List enrolled students

# Section
GET    /courses/:id/sections
POST   /courses/:id/sections      - Create section
PUT    /sections/:id              - Update section
DELETE /sections/:id              - Delete section

# Lesson
GET    /sections/:id/lessons
POST   /sections/:id/lessons      - Create lesson
GET    /lessons/:id
PUT    /lessons/:id                - Update lesson
DELETE /lessons/:id               - Delete lesson

# Progress
POST   /lessons/:id/complete      - Mark complete
PUT    /lessons/:id/progress      - Save position
GET    /courses/:id/progress      - Get progress
```

---

## Implementation Steps

### Step 2.1: Course Module (Backend)
- [ ] Create courses module with CRUD
- [ ] Add slug generation
- [ ] Add category relationship
- [ ] Add instructor relationship
- [ ] Add RLS policies

### Step 2.2: Section & Lesson Module
- [ ] Create sections CRUD
- [ ] Create lessons CRUD with all types
- [ ] Add video URL parsing (YouTube/Vimeo)
- [ ] Add PDF URL handling

### Step 2.3: Enrollment Module
- [ ] Create enrollment endpoint
- [ ] Check enrollment before lesson access
- [ ] Auto-enroll if course is free

### Step 2.4: Progress Module
- [ ] Create lesson progress tracking
- [ ] Add video position save
- [ ] Calculate course completion %

### Step 2.5: Frontend - Course List
- [ ] Create course listing page
- [ ] Add search and filter
- [ ] Add pagination
- [ ] Add course card components

### Step 2.6: Frontend - Course Detail
- [ ] Course info display
- [ ] Curriculum accordion
- [ ] Enrollment button
- [ ] Preview lessons (if is_preview=true)

### Step 2.7: Frontend - Lesson Viewer
- [ ] Video player with custom controls
- [ ] Text/Markdown renderer
- [ ] PDF viewer
- [ ] Auto-save video position every 10s

---

## Related Code Files

### Backend
```
backend/src/modules/courses/
├── courses.module.ts
├── courses.controller.ts
├── courses.service.ts
├── dto/
│   ├── create-course.dto.ts
│   └── update-course.dto.ts

backend/src/modules/sections/
├── sections.module.ts
├── sections.controller.ts
└── sections.service.ts

backend/src/modules/lessons/
├── lessons.module.ts
├── lessons.controller.ts
└── lessons.service.ts

backend/src/modules/enrollments/
├── enrollments.module.ts
├── enrollments.controller.ts
└── enrollments.service.ts

backend/src/modules/progress/
├── progress.module.ts
├── progress.controller.ts
└── progress.service.ts
```

### Frontend
```
frontend/app/(student)/courses/
├── page.tsx                    # Course list
└── [slug]/
    ├── page.tsx                # Course detail
    └── learn/
        ├── layout.tsx          # Sidebar + content
        └── [lessonId]/
            └── page.tsx        # Lesson viewer

frontend/components/
├── course-card.tsx
├── lesson-sidebar.tsx
├── video-player.tsx
├── pdf-viewer.tsx
└── markdown-renderer.tsx
```

---

## Success Criteria

- [ ] Instructor can create/edit courses
- [ ] Student can browse and enroll
- [ ] Video lessons play with position memory
- [ ] PDF viewer works
- [ ] Progress is tracked and persisted

---

## Security Considerations

1. **RLS:** Student can only view published courses
2. **Enrollment Check:** Verify enrollment before lesson access
3. **Instructor:** Only course owner can edit

---

## Next Steps

1. Proceed to Phase 3: Quiz Core
2. Dependencies: Course structure needed for quiz integration
