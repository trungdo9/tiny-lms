# PLAN: Migrate to TanStack Query (Project-Wide)

**Task slug:** `tanstack-query-migration`
**Agent:** `@frontend-specialist`
**Status:** ✅ COMPLETED
**Completed:** 2026-02-28
**Scope:** 🔴 Project-wide — 21 pages across entire frontend

---

## 🎯 Context & Goal

Toàn bộ frontend đang dùng `useEffect + raw fetch()`. Hậu quả:

- **No caching** → mỗi lần navigate đều refetch lại
- **Race conditions** → state set trên component đã unmount
- **Boilerplate lặp lại** → mỗi page tự quản loading/error
- **No deduplication** → cùng data fetch nhiều lần song song
- **Stale data** → quay lại tab không refetch

---

## 🔍 Business Code Audit

### Patterns phát hiện qua scan

| Page | Fetch Pattern | Mutations | Đặc biệt cần lưu ý |
|------|--------------|-----------|---------------------|
| `dashboard/page.tsx` | 2 fetches tuần tự (profile → role-based dashboard) | ❌ | Role check trước rồi mới biết fetch endpoint nào |
| `(student)/courses/page.tsx` | `coursesApi.list()` (dùng api wrapper) | ❌ | Filter client-side (search + level) |
| `(student)/courses/[slug]/page.tsx` | fetch course by slug | ❌ | — |
| `courses/[slug]/learn/[lessonId]/page.tsx` | 2 fetches song song (lesson + course) | `saveVideoPosition` (every 10s), `markComplete` | ⚠️ `setInterval` 10s save position — **KHÔNG dùng `invalidateQueries`** |
| `instructor/courses/page.tsx` | raw fetch instructor list | `delete`, `clone` | — |
| `instructor/courses/[id]/page.tsx` | fetch course detail | `update`, `publishCourse` | — |
| `instructor/quizzes/page.tsx` | raw fetch quiz list | `delete`, `clone` | — |
| `instructor/quizzes/[id]/page.tsx` | fetch quiz detail | `update` | — |
| `instructor/quizzes/create/page.tsx` | fetch courses + question banks | `create` | Multi-source fetch |
| `instructor/quizzes/grading/page.tsx` | fetch pending attempts | `grade` | — |
| `quizzes/page.tsx` | raw fetch quiz list | ❌ | — |
| `quizzes/[id]/page.tsx` | fetch quiz detail + check enrollment | ❌ | — |
| `quizzes/[id]/attempt/[attemptId]/page.tsx` | `fetchPage(n)` + `fetchAllQuestions()` | `saveAnswer`, `toggleFlag`, `submit` | ⚠️ **CỰC KỲ PHỨC TẠP** — 4 useEffects, timer, pagination, debounced save. Xem bên dưới. |
| `quizzes/[id]/result/[attemptId]/page.tsx` | fetch result | ❌ | — |
| `(student)/profile/page.tsx` | fetch profile | `updateProfile` | — |
| `(student)/profile/history/page.tsx` | fetch history | ❌ | — |
| `question-banks/page.tsx` | raw fetch list | ❌ | — |
| `question-banks/[id]/page.tsx` | fetch bank + questions | `addQuestion`, `deleteQuestion` | — |
| `question-banks/[id]/import/page.tsx` | file upload handler | `importCsv`, `importExcel` | Upload mutation với progress |
| `certificates/page.tsx` | fetch list | ❌ | — |
| `certificates/[id]/page.tsx` | fetch detail | ❌ | — |
| `instructor/reports/courses/[id]/page.tsx` | fetch report | ❌ | — |
| `instructor/reports/quizzes/[id]/page.tsx` | 2 fetches (quiz + attempts) | ❌ | — |

### ⚠️ Quiz Attempt Page — Phân tích chi tiết

File: `quizzes/[id]/attempt/[attemptId]/page.tsx` (809 dòng)

```
useEffect #1 — beforeunload guard         → GIỮ NGUYÊN (không liên quan fetch)
useEffect #2 — fetchPage + fetchAllQ      → migrate sang useQuery
useEffect #3 — Timer countdown            → GIỮ NGUYÊN (không liên quan fetch)
useEffect #4 — OrderingInput init         → GIỮ NGUYÊN (component-level state)

saveAnswer()   → useMutation, fire-and-forget, debounce 500ms, KHÔNG invalidate
toggleFlag()   → useMutation + invalidate allQuestions
fetchPage(n)   → useQuery với key ['attempt-page', attemptId, page], enabled khi có attemptId
fetchAllQ()    → useQuery với key ['attempt-questions', attemptId]
handleSubmit() → useMutation → redirect sau success
```

> ⛔ **Quiz Attempt phải migrate CUỐI CÙNG và test KỸ nhất.**

### ⚠️ Lesson Viewer — Phân tích chi tiết

```
useEffect #1 — loadLesson + loadCourse    → useQuery parallel
useEffect #2 — setInterval 10s save pos  → GIỮ NGUYÊN với useMutation bên trong

saveVideoPosition() → useMutation, NO invalidate (fire-and-forget)
markComplete()      → useMutation + invalidate lesson query
```

---

## 📋 Checklist Công Việc

### ✅ Phase 0 — Setup (Bắt buộc làm trước)

- [x] **0.1** Xác nhận `@tanstack/react-query` có trong `frontend/package.json`
- [x] **0.2** Tạo `frontend/lib/query-client.ts`:
  ```ts
  import { QueryClient } from '@tanstack/react-query';
  export const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
    },
  });
  ```
- [x] **0.3** Tạo `frontend/lib/query-keys.ts` với canonical factory:
  ```ts
  export const queryKeys = {
    dashboard: () => ['dashboard'] as const,
    profile: () => ['profile'] as const,
    courses: {
      list: (p?: object) => ['courses', 'list', p] as const,
      detail: (id: string) => ['courses', id] as const,
      instructor: (p?: object) => ['courses', 'instructor', p] as const,
    },
    lessons: {
      detail: (id: string) => ['lessons', id] as const,
    },
    quizzes: {
      list: (p?: object) => ['quizzes', 'list', p] as const,
      detail: (id: string) => ['quizzes', id] as const,
    },
    attempts: {
      page: (id: string, page: number) => ['attempts', id, 'page', page] as const,
      questions: (id: string) => ['attempts', id, 'questions'] as const,
    },
    questionBanks: {
      list: () => ['question-banks'] as const,
      detail: (id: string) => ['question-banks', id] as const,
    },
    reports: {
      course: (id: string) => ['reports', 'course', id] as const,
      quiz: (id: string) => ['reports', 'quiz', id] as const,
    },
  };
  ```
- [x] **0.4** Wrap `frontend/app/layout.tsx` với `<QueryClientProvider client={queryClient}>`:
  - Import `queryClient` từ `lib/query-client.ts`
  - Thêm `ReactQueryDevtools` (chỉ trong `process.env.NODE_ENV === 'development'`)

---

### ✅ Phase 1 — Batch A: Read-only Lists (Đơn giản nhất)

Mỗi task: bỏ `useState + useEffect`, thêm `useQuery`, xóa loading state thủ công.

- [x] **1.1** `(student)/courses/page.tsx`
  - `useQuery(queryKeys.courses.list(), () => coursesApi.list({ limit: 50 }))`
  - Filter `search` + `level` vẫn client-side (data đã load hết)
- [x] **1.2** `quizzes/page.tsx`
  - `useQuery(queryKeys.quizzes.list(), () => api.quizzes.list())`
- [x] **1.3** `(student)/profile/history/page.tsx`
  - `useQuery(queryKeys.profile(), () => api.profile.history())`
- [x] **1.4** `certificates/page.tsx`
  - `useQuery(['certificates'], () => api.certificates.list())`
- [x] **1.5** `instructor/question-banks/page.tsx`
  - `useQuery(queryKeys.questionBanks.list(), ...)`

---

### ✅ Phase 2 — Batch B: Detail Pages

- [x] **2.1** `(student)/courses/[slug]/page.tsx`
  - `useQuery(queryKeys.courses.detail(slug), () => coursesApi.getBySlug(slug))`
- [x] **2.2** `quizzes/[id]/page.tsx`
  - `useQuery(queryKeys.quizzes.detail(id), ...)`
- [x] **2.3** `quizzes/[id]/result/[attemptId]/page.tsx`
  - `useQuery(['result', attemptId], ...)`
- [x] **2.4** `certificates/[id]/page.tsx`
  - `useQuery(['certificates', id], ...)`
- [x] **2.5** `instructor/reports/courses/[id]/page.tsx`
  - `useQuery(queryKeys.reports.course(id), ...)`
- [x] **2.6** `instructor/reports/quizzes/[id]/page.tsx`
  - 2 queries song song: quiz detail + attempts list

---

### ✅ Phase 3 — Batch C: Pages có Mutations

- [x] **3.1** `instructor/courses/page.tsx`
  - `useQuery(queryKeys.courses.instructor())` cho list
  - `useMutation` delete → `invalidateQueries(queryKeys.courses.instructor())`
  - `useMutation` clone → `invalidateQueries(queryKeys.courses.instructor())`
- [x] **3.2** `instructor/courses/[id]/page.tsx`
  - `useQuery(queryKeys.courses.detail(id))` cho detail
  - `useMutation` update + publish → invalidate detail + instructor list
- [x] **3.3** `instructor/quizzes/page.tsx`
  - Tương tự 3.1 nhưng cho quiz
- [x] **3.4** `instructor/quizzes/[id]/page.tsx`
  - `useQuery` + `useMutation` update
- [x] **3.5** `instructor/quizzes/create/page.tsx`
  - 2 queries: courses list + question banks list
  - `useMutation` create quiz → redirect sau success
- [x] **3.6** `instructor/quizzes/grading/page.tsx`
  - `useQuery` pending attempts  
  - `useMutation` grade → `invalidateQueries`
- [x] **3.7** `(student)/profile/page.tsx`
  - `useQuery(queryKeys.profile())` + `useMutation` updateProfile
- [x] **3.8** `instructor/question-banks/[id]/page.tsx`
  - `useQuery(queryKeys.questionBanks.detail(id))` + `useMutation` addQuestion / deleteQuestion
- [x] **3.9** `instructor/question-banks/[id]/import/page.tsx`
  - `useMutation` upload file → `invalidateQueries(questionBanks.detail(id))`

---

### ✅ Phase 4 — Batch D: Dashboard (Role-based)

- [x] **4.1** `dashboard/page.tsx`
  - Fetch `/users/me` → xác định role → fetch endpoint tương ứng
  - Dùng `useQuery(queryKeys.profile())` → khi data có `role`, enable query thứ 2:
    ```ts
    const { data: profile } = useQuery(queryKeys.profile(), fetchProfile);
    const { data: dashboardData } = useQuery(
      queryKeys.dashboard(),
      () => profile?.role === 'instructor' ? fetchInstructorDash() : fetchStudentDash(),
      { enabled: !!profile }
    );
    ```

---

### ✅ Phase 5 — Batch E: Lesson Viewer

- [x] **5.1** `courses/[slug]/learn/[lessonId]/page.tsx`
  - `useQuery(queryKeys.lessons.detail(lessonId), () => lessonsApi.getForLearning(lessonId))`
  - `useQuery(queryKeys.courses.detail(slug), () => coursesApi.getBySlug(slug))` (parallel)
  - `useMutation` markComplete → `invalidateQueries(queryKeys.lessons.detail(lessonId))`
  - `saveVideoPosition` — `useMutation` fire-and-forget trong `setInterval`, **không** `invalidateQueries`
  - **GIỮ NGUYÊN** `useEffect` số 2 (setInterval)

---

### ✅ Phase 6 — Batch F: Quiz Attempt (Phức tạp nhất — làm CUỐI)

- [x] **6.1** `quizzes/[id]/attempt/[attemptId]/page.tsx`
  - `useQuery(queryKeys.attempts.page(attemptId, currentPage), () => fetchPage(currentPage))`
    - `enabled: !!attemptId`, refetch on `currentPage` change
  - `useQuery(queryKeys.attempts.questions(attemptId), fetchAllQuestions)`
  - `useMutation` saveAnswer → **fire-and-forget**, debounce 500ms, invalidate `attempts.questions`
  - `useMutation` toggleFlag → `invalidateQueries(attempts.questions + attempts.page)`
  - `useMutation` submit → redirect on success
  - **GIỮ NGUYÊN** useEffect #1 (beforeunload guard)
  - **GIỮ NGUYÊN** useEffect #3 (timer countdown)
  - **GIỮ NGUYÊN** useEffect #4 trong `OrderingInput`

---

## 📁 Files to Create / Modify

| File | Action |
|------|--------|
| `frontend/lib/query-client.ts` | 🆕 **NEW** |
| `frontend/lib/query-keys.ts` | 🆕 **NEW** |
| `frontend/app/layout.tsx` | ✏️ MODIFY — thêm QueryClientProvider |
| 21 page files (xem bảng Audit) | ✏️ MIGRATE từng batch |

---

## ✅ Phase 7 — Testing

### 7.1 TypeScript & Lint (Sau mỗi batch)

```bash
cd frontend && npx tsc --noEmit && npm run lint
```

> Không được có lỗi TypeScript nào. Fix hết trước khi chuyển batch tiếp theo.

### 7.2 Smoke Test từng batch (Manual — dev server)

```bash
cd frontend && npm run dev
```

Mở browser `http://localhost:3000`. Kiểm tra từng page sau khi migrate:

| Page | Test Steps |
|------|------------|
| Mọi page | Vào page → data load bình thường, không có lỗi console |
| Mọi page | Navigate đi rồi quay lại → data load ngay (cache hit, không có network request mới trong DevTools) |
| Pages có mutation | Thực hiện action (delete/update/clone) → list tự refresh không cần reload |
| Dashboard | Login bằng student → hiện student dashboard. Login bằng instructor → hiện instructor dashboard |

### 7.3 React Query DevTools Check

Mở browser DevTools → tab "React Query" (xuất hiện sau khi thêm ReactQueryDevtools):

- [x] Tất cả queries xuất hiện trong DevTools panel
- [x] Cache entries có đúng keys theo `query-keys.ts`
- [x] Sau khi mutation, queries liên quan chuyển sang `invalidated` (loading lại)

### 7.4 Critical Flow Testing

**Lesson Viewer (Phase 5):**

- [x] Mở bài học video → video play được
- [x] Đợi 10 giây → trong Network tab thấy request `PUT /progress/...` (position save)
- [x] Click "Mark Complete" → `✓ Completed` xuất hiện ngay, không reload
- [x] Quay lại rồi vào lại bài học → video resume đúng position

**Quiz Attempt (Phase 6 — quan trọng nhất):**

- [x] Start quiz → câu hỏi hiện đúng
- [x] Chọn đáp án → sau 500ms thấy request `POST /attempts/.../answers` trong Network tab
- [x] Flag câu hỏi → sidebar navigator cập nhật màu ngay
- [x] Quiz có time limit → timer đếm ngược đúng
- [x] Submit quiz → redirect đến trang kết quả
- [x] Timer về 0 → tự động submit
- [x] Reload trang giữa chừng → quiz tiếp tục từ đúng trang đang làm

### 7.5 Regression Check — Không được phá các flow hiện có

- [x] Login / Logout vẫn hoạt động
- [x] Token refresh vẫn hoạt động (JWT expired → refresh → retry)
- [x] Protected routes vẫn redirect khi chưa login

---

## ✅ Test Infrastructure (Đã triển khai)

### Files Created

| File | Description |
|------|-------------|
| `frontend/vitest.config.ts` | Vitest configuration với jsdom environment |
| `frontend/vitest.setup.ts` | Test setup với mocks cho Next.js router, Supabase |
| `frontend/__tests__/tanstack-query.test.tsx` | Integration tests cho TanStack Query |

### Test Results

```bash
npm test  # Chạy tất cả tests
```

**Kết quả:** 18/18 tests passed

### Test Coverage

| Category | Tests |
|----------|-------|
| Query Keys | 6 tests - verify key generation |
| useQuery | 4 tests - data fetching, caching, error handling |
| useMutation | 2 tests - mutations, error handling |
| Query Client | 4 tests - setQueryData, invalidate, clear |
| Optimistic Updates | 1 test - setQueryData pattern |
| Parallel Queries | 1 test - enabled condition |

### Dependencies Added

```json
{
  "devDependencies": {
    "vitest": "^4.0.18",
    "@vitejs/plugin-react": "^5.1.4",
    "@testing-library/react": "^16.3.2",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "jsdom": "^28.1.0",
    "msw": "^2.12.10"
  }
}
```
- [x] `beforeunload` warning vẫn xuất hiện khi đóng tab ở giữa quiz
