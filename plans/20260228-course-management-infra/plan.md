# PLAN: Course Management — Infrastructure Refactor

**Task slug:** `course-management-infra`
**Agent:** `@frontend-specialist`
**Status:** ✅ VERIFIED COMPLETE (2026-03-31)
**Depends on:** `20260228-tanstack-query-migration` _(Phase 3 — Batch C, task 3.1 phải hoàn thành trước)_

---

## 🎯 Context & Goal

Sau khi `tanstack-query-migration` xong, trang `instructor/courses/page.tsx` đã dùng TanStack Query cho fetch/delete/clone. Plan này bổ sung thêm:

1. **URL-based filter state** — thêm mới `search` + `status` filter với URL params (không có sẵn trong code hiện tại)
2. **Mở rộng `Course` interface** — bổ sung fields còn thiếu để chuẩn bị cho UI redesign

> ⚠️ **Không** bao gồm migration sang `useQuery` (đã handle trong `tanstack-query-migration` plan)  
> ⚠️ **Không** bao gồm UI redesign (handle trong `course-management-ui` plan)

---

## 🔍 Trạng thái code hiện tại

```ts
// instructor/courses/page.tsx — hiện tại
interface Course {
  id: string;
  title: string;
  description?: string;
  status: string;
  thumbnailUrl?: string;
  _count?: { sections: number; enrollments: number };
  // ❌ Thiếu: level, isFree, price, category
}

// Filter state: ❌ Chưa có — trang này không có search/filter nào
// URL params:   ❌ Chưa có
```

---

## 📋 Task Breakdown

### 1.1 — Extend Course Interface

- [ ] Bổ sung các fields còn thiếu vào type `Course`:

```ts
interface Course {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  thumbnailUrl?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  isFree?: boolean;
  price?: number;
  category?: { id: string; name: string; slug: string };
  _count?: { sections: number; enrollments: number };
}
```

### 1.2 — Thêm URL-Based Filter State (mới hoàn toàn)

> ⚠️ `useSearchParams` trong Next.js App Router yêu cầu component phải wrap trong `<Suspense>`. Xem note bên dưới.

- [ ] Thêm `useSearchParams` + `useRouter` từ `next/navigation`
- [ ] Đọc initial values từ URL params khi page load:
  ```ts
  const searchParams = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? '';
  ```
- [ ] Search input với debounce 300ms → push `?q=...` lên URL
- [ ] Status filter (All / Draft / Published / Archived) → push `?status=...` lên URL
- [ ] TanStack Query key phải include params:
  ```ts
  useQuery(queryKeys.courses.instructor({ search, status }), ...)
  ```
  *(queryKeys đã được định nghĩa trong tanstack-query-migration)*
- [ ] Wrap page component (hoặc export default) trong `<Suspense>` để tránh lỗi Next.js:
  ```tsx
  export default function Page() {
    return <Suspense><CoursesPageContent /></Suspense>;
  }
  ```

---

## 📁 Files to Change

| File | Change |
|------|--------|
| `frontend/app/instructor/courses/page.tsx` | Extend interface + thêm URL filter state |

---

## ✅ Verification Plan

### Prerequisite check

Trước khi bắt đầu, xác nhận `tanstack-query-migration` task 3.1 đã xong:
- `instructor/courses/page.tsx` đang dùng `useQuery` + `useMutation` (không còn raw `fetch` + `useEffect`)

### Manual Testing

1. Load `/instructor/courses` → page render bình thường, data load qua React Query
2. Gõ tên khoá học → URL cập nhật `?q=...` sau ~300ms, list filter theo
3. Click filter status → URL: `?status=draft`, chỉ hiện course draft
4. Kết hợp: `?q=marketing&status=published` → cả 2 filter cùng active
5. Copy URL → mở tab mới → filter được áp dụng ngay (không reset về default)
6. Xoá text search → URL xoá param `q`, list trở về full

### Type & Lint

```bash
cd frontend && npx tsc --noEmit && npm run lint
```
