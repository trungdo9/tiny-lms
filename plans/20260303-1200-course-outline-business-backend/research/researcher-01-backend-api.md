# Backend API Research - Course Outline Business

**Date**: 2026-03-03
**Files Analyzed**: lessons, sections, courses modules (controller + service)

---

## Key Findings

### GET /lessons/:id/quizzes Endpoint
**Status**: DOES NOT EXIST

- No endpoint for retrieving quizzes associated with a lesson
- Lessons controller has: `GET /lessons/:id`, `GET /lessons/:id/learn`, but no quizzes endpoint
- Implication: Quiz data is not exposed at lesson level via REST API

---

### GET /courses/:id Response Structure
**Status**: INCOMPLETE NESTING

Current behavior:
- Returns basic course data (title, description, level, price, instructor, category)
- Returns instructor object with (id, full_name, avatar_url)
- Returns category object with (id, name, slug)
- **DOES NOT** include sections or nested lessons

Service code (line 43-48):
```
select(`
  *,
  instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url),
  category:categories(id, name, slug),
  sections(id)
`)
```

Only returns section IDs, not full section + lesson structure.

**Implication**: Frontend must make separate calls to fetch sections and lessons

---

### Quiz/Flashcard Info in Lessons
**Status**: NOT INCLUDED

Lessons endpoint (`GET /lessons/:id`) returns:
- Basic lesson fields: title, type, content, video_url, pdf_url, duration_mins, etc.
- Section relationship (id, title, course_id)
- **MISSING**: Quiz count, flashcard count, quiz IDs, flashcard IDs

---

### Section Endpoints Available

**GET** `/courses/:courseId/sections` - List all sections in course
**GET** `/sections/:id` - Get single section
**POST** `/courses/:courseId/sections` - Create section
**PUT** `/sections/:id` - Update section
**DELETE** `/sections/:id` - Delete section
**PUT** `/courses/:courseId/sections/reorder` - Reorder sections

**Limitation**: Sections endpoint does NOT return nested lessons in response

---

## Architecture Summary

| Resource | List Endpoint | Get Detail | Nesting Support |
|----------|--------------|-----------|-----------------|
| Courses | GET /courses | GET /courses/:id | Sections (IDs only) |
| Sections | GET /courses/:id/sections | GET /sections/:id | None |
| Lessons | GET /sections/:id/lessons | GET /lessons/:id | Section info |

**Pattern**: Hierarchical endpoints but **no deep nesting in responses**. Each level requires separate API calls.

---

## Implications for Course Outline UI

1. **Must make 3 API calls** to build complete course tree:
   - `GET /courses/:id` → course + section IDs
   - `GET /courses/:id/sections` → section details
   - `GET /sections/:id/lessons` → lessons (or loop per section)

2. **No quiz/flashcard metadata** at lesson level - separate queries needed

3. **Client-side composition** required to build nested structures

---

## Unresolved Questions

- Does lessons service have hidden quiz/flashcard relationship queries?
- Are quiz/flashcard endpoints in separate modules not reviewed?
