# PLAN: Quiz-Course Structure — Business Rule Refactor

**Task slug:** `20260228-quiz-course-refactor`
**Ngày:** 2026-02-28
**Agent:** `@backend-specialist` + `@frontend-specialist`
**Status:** ⚠️ CODE COMPLETE — DB migration pending (requires Supabase access + Node 24)

---

## 🎯 Mục tiêu

Enforce 3 business rules:

1. **Quiz bắt buộc thuộc** cấu trúc `Course → Section → Lesson`  (không còn standalone)
2. **1 Lesson chỉ có tối đa 1 Quiz** — muốn dùng lại → Clone Quiz
3. Khi **Clone Course**, có option xử lý bài kiểm tra theo 3 mode

---

## ⚠️ Breaking Changes

> [!WARNING]
> **Database Migration bắt buộc**: Thêm `section_id NOT NULL` và `UNIQUE(lesson_id)` vào bảng `quizzes`. Data hiện có cần xử lý trước khi add NOT NULL constraint.
> → File: `backend/prisma/migrations/quiz_enforce_lesson_section_hierarchy.sql`

> [!IMPORTANT]
> **Route cũ bị xóa**: `POST /quizzes` → 404. Thay bằng `POST /lessons/:lessonId/quizzes`.

> [!IMPORTANT]
> **Prisma generate cần Node 24**: `nvm use 24 && npx prisma generate` (Node 18/20 lỗi ESM với Prisma 7.x `zeptomatch`).

---

## 📐 Database Changes

**File:** `backend/prisma/schema.prisma`

```diff
model Quiz {
-  courseId  String?   @map("course_id")  // optional
-  lessonId  String?   @map("lesson_id")  // optional, no constraint
+  courseId  String    @map("course_id")  // NOT NULL
+  sectionId String    @map("section_id") // [NEW] NOT NULL
+  lessonId  String    @unique @map("lesson_id")  // NOT NULL + UNIQUE
+  section   Section   @relation(fields: [sectionId], references: [id])
}

model Section {
+  quizzes  Quiz[]  // [NEW] reverse relation
}
```

**Migration SQL** (áp dụng thủ công qua Supabase Dashboard → SQL Editor):

```sql
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS section_id UUID;
ALTER TABLE public.quizzes ADD CONSTRAINT quizzes_section_id_fkey
  FOREIGN KEY (section_id) REFERENCES public.sections(id);
ALTER TABLE public.quizzes ALTER COLUMN course_id SET NOT NULL;
ALTER TABLE public.quizzes ADD CONSTRAINT quizzes_lesson_id_key UNIQUE (lesson_id);
-- Xem comment trong file SQL trước khi chạy ALTER COLUMN NOT NULL
ALTER TABLE public.quizzes ALTER COLUMN lesson_id SET NOT NULL;
ALTER TABLE public.quizzes ALTER COLUMN section_id SET NOT NULL;
```

---

## 🔌 API Routes (thực tế đã implement)

| Method | Route | Controller | Mô tả |
|--------|-------|-----------|-------|
| `POST` | `/lessons/:lessonId/quizzes` | `LessonQuizzesController` | **[NEW]** Tạo quiz cho lesson |
| `GET`  | `/lessons/:lessonId/quizzes` | `LessonQuizzesController` | **[NEW]** Get quiz của lesson (null nếu chưa có) |
| `GET`  | `/quizzes` | `QuizzesController` | List quizzes (filter: `?courseId=` `?sectionId=`) |
| `GET`  | `/quizzes/:id` | `QuizzesController` | Get quiz by ID |
| `PUT`  | `/quizzes/:id` | `QuizzesController` | Update quiz |
| `DELETE` | `/quizzes/:id` | `QuizzesController` | Delete quiz |
| `POST` | `/quizzes/:id/clone` | `QuizzesController` | **[NEW]** Clone quiz sang lesson khác |
| `GET`  | `/quizzes/:id/questions` | `QuizzesController` | Get questions |
| `POST` | `/quizzes/:id/questions` | `QuizzesController` | Add question |
| `DELETE` | `/quizzes/:id/questions/:quizQuestionId` | `QuizzesController` | Remove question |
| `GET`  | `/quizzes/:id/leaderboard` | `QuizzesController` | Leaderboard |
| `POST` | `/courses/:id/clone` | `CoursesController` | **[NEW]** Clone course |
| ~~`POST`~~ | ~~`/quizzes`~~ | — | **Removed** |

---

## 🏗️ Backend Implementation

### `quiz.dto.ts` — `backend/src/modules/quizzes/dto/`

| DTO | Thay đổi |
|-----|---------|
| `CreateQuizDto` | Removed `courseId` (derived từ lessonId) |
| `UpdateQuizDto` | Không đổi |
| `CloneQuizDto` | **[NEW]** `{ targetLessonId: string }` |
| `AddQuizQuestionDto` | Không đổi |
| `CloneCourseDto` | **[NEW]** ở file này (dùng `@IsIn`) — xem thêm course.dto.ts |

### `course.dto.ts` — `backend/src/modules/courses/dto/`

| DTO | Thay đổi |
|-----|---------|
| `CloneCourseDto` | **[NEW]** `{ title, description?, importQuizMode, importFromQuizIds? }` (dùng `@IsEnum`) |

> **Note:** `CloneCourseDto` tồn tại ở cả 2 file. `CoursesController` import từ `course.dto.ts`.

### `quizzes.service.ts`

| Method | Logic |
|--------|-------|
| `create(userId, lessonId, dto)` | Lookup lesson → auto courseId/sectionId, ForbiddenException nếu không phải owner, ConflictException nếu lesson đã có quiz |
| `findAll(courseId?, sectionId?)` | Filter optional, include course + section + _count |
| `findByLesson(lessonId)` | `findUnique({ where: { lessonId } })` — trả null nếu chưa có quiz |
| `findById(id)` | Include course, section, questions, _count |
| `update(id, userId, dto)` | ForbiddenException nếu không phải owner |
| `delete(id, userId)` | ForbiddenException nếu không phải owner |
| `clone(quizId, userId, dto)` | Validate target lesson + ownership + unique; deep copy quiz metadata + QuizQuestion[]; isPublished = false |
| `addQuestion(id, userId, dto)` | ForbiddenException check; auto orderIndex = lastIndex + 1 |
| `removeQuestion(quizId, quizQuestionId, userId)` | ForbiddenException check |
| `getQuestions(quizId)` | Include question.options, bank |
| `getLeaderboard(id, limit)` | Order by totalScore DESC, timeSpent ASC |

### `quizzes.controller.ts` — Split thành 2 controller

```
LessonQuizzesController  @Controller('lessons/:lessonId/quizzes')
  POST /                 → create()
  GET  /                 → findByLesson()

QuizzesController        @Controller('quizzes')
  GET    /               → findAll()
  GET    /:id            → findById()
  PUT    /:id            → update()
  DELETE /:id            → delete()
  POST   /:id/clone      → clone()
  GET    /:id/questions  → getQuestions()
  POST   /:id/questions  → addQuestion()
  DELETE /:id/questions/:quizQuestionId → removeQuestion()
  GET    /:id/leaderboard → getLeaderboard()
```

### `quizzes.module.ts`

```typescript
controllers: [QuizzesController, LessonQuizzesController]
providers:   [QuizzesService, PrismaService]
```

### `courses.service.ts`

| Method | Logic |
|--------|-------|
| `clone(courseId, userId, dto)` | Verify ownership; clone course → sections → lessons; xử lý quiz theo `importQuizMode` |
| `cloneAllQuizzes()` | Prisma: `quiz.findMany({ where: { courseId } })` → create per lesson via `lessonIdMap` |
| `importQuestionsFromQuizzes()` | Load questions từ `sourceQuizIds`, tạo 1 quiz ở lesson available đầu tiên |

**`importQuizMode` values:**

| Mode | Hành động |
|------|-----------|
| `none` | Chỉ clone structure (sections + lessons), bỏ qua quiz |
| `clone_all` | Clone 1:1 toàn bộ quiz theo lesson mapping |
| `import_from_quizzes` | Import questions từ quiz IDs được chọn → tạo 1 quiz tổng hợp ở lesson đầu tiên available |

### `courses.module.ts`

```typescript
providers: [CoursesService, SupabaseService, PrismaService]
```

> `CoursesService` dùng **Supabase client** cho CRUD thông thường, dùng **Prisma** riêng cho clone quiz (vì quiz data ở Prisma/PostgreSQL).

---

## 🖥️ Frontend Implementation

### `/instructor/courses` — Courses List

- Nút **⎘ Clone** → `CloneCourseModal` (2 bước):
  - **Bước 1**: Đặt tên khóa học mới
  - **Bước 2**: Radio chọn `importQuizMode` (3 options)
- Gọi `POST /courses/:id/clone`
- Status labels tiếng Việt

### `/instructor/courses/[id]` — Course Editor

- Stats bar: `X phần · Y bài học · Z quiz`
- Expandable accordion section
- Lesson row (hover):
  - Nếu **chưa có quiz**: nút `+ Tạo Quiz` → `QuizCreateModal`
  - Nếu **đã có quiz**: badge màu (xanh = published, vàng = draft) + số câu `(NQ)` → click ra `/instructor/quizzes/:id`; nút `⎘` → `CloneQuizModal`
- `QuizCreateModal`: submit → `POST /lessons/:lessonId/quizzes`
- `CloneQuizModal`: chọn lesson đích (chỉ show lesson chưa có quiz) → `POST /quizzes/:id/clone`
- Course info loading: song song fetch quiz cho từng lesson qua `GET /lessons/:lessonId/quizzes`

### `/instructor/quizzes/create` — Deprecated

- Hiển thị notice redirect: "Quiz phải tạo từ trong bài học"
- Link nhanh về `/instructor/courses`

---

## 📁 Files Changed

| File | Type | Ghi chú |
|------|------|---------|
| `backend/prisma/schema.prisma` | MODIFY | sectionId, unique lessonId, Section.quizzes[] |
| `backend/prisma/migrations/quiz_enforce_lesson_section_hierarchy.sql` | NEW | Áp dụng thủ công qua Supabase |
| `backend/src/modules/quizzes/dto/quiz.dto.ts` | MODIFY | rm courseId, add CloneQuizDto, CloneCourseDto |
| `backend/src/modules/quizzes/quizzes.service.ts` | MODIFY | Rewrite toàn bộ, thêm clone() |
| `backend/src/modules/quizzes/quizzes.controller.ts` | MODIFY | Split 2 controller |
| `backend/src/modules/quizzes/quizzes.module.ts` | MODIFY | Register LessonQuizzesController |
| `backend/src/modules/courses/dto/course.dto.ts` | MODIFY | Add CloneCourseDto |
| `backend/src/modules/courses/courses.service.ts` | MODIFY | Add clone(), cloneAllQuizzes(), importQuestionsFromQuizzes() |
| `backend/src/modules/courses/courses.controller.ts` | MODIFY | Add POST /:id/clone |
| `backend/src/modules/courses/courses.module.ts` | MODIFY | Add PrismaService |
| `frontend/app/instructor/courses/page.tsx` | MODIFY | Clone Course modal 2-step |
| `frontend/app/instructor/courses/[id]/page.tsx` | MODIFY | Quiz badge, QuizCreateModal, CloneQuizModal |
| `frontend/app/instructor/quizzes/create/page.tsx` | MODIFY | Redirect notice |

---

## ✅ Verification Results

| Check | Kết quả | Ghi chú |
|-------|---------|---------|
| Backend `tsc --noEmit` | ✅ 0 errors | Node 20 |
| Frontend `tsc --noEmit` | ✅ 0 errors | Node 20 |
| Prisma client regenerated | ✅ | Node 24 required |

---

## 📋 Manual Test Checklist

> **Chú thích:** ✅ = verified qua code · ⏳ = cần runtime/DB để verify

- [x] ✅ **Migration SQL file tồn tại** — `prisma/migrations/quiz_enforce_lesson_section_hierarchy.sql`
- [ ] ⏳ **DB migration đã apply** — Chạy SQL qua Supabase Dashboard → SQL Editor
- [x] ✅ **`QuizCreateModal` component tồn tại** — `courses/[id]/page.tsx` line 54; POST `/lessons/:lessonId/quizzes`
- [x] ✅ **`CloneQuizModal` component tồn tại** — `courses/[id]/page.tsx`; POST `/quizzes/:id/clone`
- [x] ✅ **Quiz badge per lesson** — `LessonRow` component với hover trigger
- [x] ✅ **ConflictException nếu lesson đã có quiz** — `quizzes.service.ts` line 34
- [x] ✅ **ConflictException khi clone vào lesson đã có quiz** — `quizzes.service.ts` line 213
- [x] ✅ **Clone course `clone_all`** — `courses.service.ts` line 329, `cloneAllQuizzes()` method
- [x] ✅ **Clone course `none`** — logic skip (else branch) trong `clone()`
- [x] ✅ **Clone course `import_from_quizzes`** — `courses.service.ts` line 331, `importQuestionsFromQuizzes()` method
- [x] ✅ **`/instructor/quizzes/create` redirect notice** — `quizzes/create/page.tsx` line 17
- [x] ✅ **`CloneCourseModal` 2-step UI** — `courses/page.tsx` với radio buttons
- [ ] ⏳ **E2E: Tạo quiz từ lesson accordion** — Cần runtime test
- [ ] ⏳ **E2E: Clone quiz sang lesson khác** — Cần runtime test
- [ ] ⏳ **E2E: Clone course các mode** — Cần runtime test

---

## 🗒️ Known Limitations & Future Work

| Item | Mô tả |
|------|-------|
| `import_from_quizzes` mode | Hiện tạo **1 quiz duy nhất** ở lesson đầu tiên available với tất cả câu hỏi được import. Có thể extend: phân phối câu hỏi thành nhiều quiz theo lesson |
| Clone Course modal | Bước 2 chưa có multi-select picker cho `import_from_quizzes` — user cần nhập `importFromQuizIds` thủ công (hoặc mặc định bỏ qua) |
| `CloneCourseDto` duplicate | Tồn tại ở cả `quiz.dto.ts` và `course.dto.ts`. Nên consolidate về `course.dto.ts` và remove khỏi `quiz.dto.ts` |
| Node version | Frontend/backend dùng Node 20; `prisma generate` cần Node 24 |
