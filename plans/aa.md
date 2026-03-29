# Course Outline Page – Task Checklist

## Planning
- [x] Research project structure, docs, and existing code
- [x] Analyze current Course Editor page (`[id]/page.tsx`)
- [x] Review Prisma schema and API endpoints
- [x] Generate design mockup
- [x] Write implementation plan
- [x] Get user approval on plan

## Execution – Frontend
- [x] Create new route `/instructor/courses/[id]/outline/page.tsx`
- [x] Build `SectionCard` component (numbered modules, expand/collapse)
- [x] Build `LessonItem` component (activity icons, quiz/flashcard badges, hover actions)
- [x] Build `AddLessonForm` inline component (title + type select)
- [x] Add lesson CRUD mutations (create via API, delete via `lessonsApi.delete`)
- [x] Add section inline rename (`SectionRenameInput` + `sectionsApi.update`)
- [x] Add "Add activity" action bar per section (+ Thêm bài học, Upload, Import, ✨ AI)
- [x] Wire up expand/collapse all sections (`expandAll` / `collapseAll`)
- [x] Add tab navigation to Course Editor (Thông tin | Course Outline)
- [x] Polish styling: numbered modules (01/02), icons, spacing, hover states
- [ ] **Fix `[id]/page.tsx` parse error** — run: `python3 fix_page.py` from project root

## Execution – Backend
- [x] `POST /courses/:courseId/sections` — create section ✅
- [x] `PUT /sections/:id` — rename section ✅
- [x] `DELETE /sections/:id` — delete section ✅
- [x] `POST /sections/:sectionId/lessons` — create lesson ✅
- [x] `DELETE /lessons/:id` — delete lesson ✅
- [x] `GET /lessons/:lessonId/quizzes` — fetch quiz ✅
- [x] `GET /lessons/:lessonId/flash-cards` — fetch flashcards ✅
- [x] No new backend endpoints needed

## Verification
- [ ] Fix build blocker first: `python3 /home/trung/Desktop/Projects/private/tiny-lms/fix_page.py`
- [ ] Build passes (dev server hot-reload, no error overlay)
- [ ] Browser test: Navigate to `/instructor/courses/[id]/outline`
- [ ] Browser test: Add/edit/delete sections
- [ ] Browser test: Add/edit/delete lessons
- [ ] Browser test: Expand/collapse sections
- [ ] Browser test: Tab nav (Thông tin ↔ Course Outline)