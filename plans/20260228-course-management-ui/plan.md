# PLAN: Course Management — UI Improvement

**Task slug:** `course-management-ui`
**Agent:** `@frontend-specialist`
**Depends on:** `20260228-course-management-infra` (must be done first)
**Status:** 🟡 Ready for Review

---

## 🎯 Context & Goal

Rebuild the visual layer of `/instructor/courses` into a premium, data-dense admin UI.
Toàn bộ **data logic** (TanStack Query, URL params, filter state) đã được handle ở 2 plan trước.
Plan này chỉ làm **UI/visual layer thuần túy**.

> ⚠️ **Ranh giới rõ ràng:**
> - `tanstack-query-migration` → data fetching + mutations
> - `course-management-infra` → URL filter state, Course interface
> - **Plan này** → render UI: layout, components, animations, states

---

## 🎨 DESIGN COMMITMENT

> **Style:** Sharp-Edge Admin — "Data-First"
> Audience: Instructors (B2B mindset → trust, efficiency, clarity)

| Decision | Choice | Why |
|----------|--------|-----|
| **Geometry** | 0px radius rows, 2px borders | Professional, not "rounded SaaS" |
| **Primary Palette** | `slate-900` / `white` / `amber-400` accent | High contrast, editorial authority |
| **Actions** | Hidden behind `···` kebab menu | Reduces cognitive load vs 3 inline buttons |
| **Animations** | Stagger rows `translateY(-8px) → 0`, 50ms delay | Alive, not static |
| **Empty state** | Icon + contextual message + CTA | Clear guidance for new instructors |
| **Purple Ban ✅** | No indigo/violet/purple | Agent rule |

---

## 📋 Task Breakdown

### Phase 1 — Header & Stats Bar

- [ ] **1.1** Page header: `My Courses` (h1) + `+ Create Course` button (amber-400 CTA)
- [ ] **1.2** Stats chips — derive từ `courses` data (TanStack Query đã có):
  ```ts
  const total = courses.length;
  const published = courses.filter(c => c.status === 'published').length;
  const draft = courses.filter(c => c.status === 'draft').length;
  ```
  → Render: `Total: 9 · Published: 5 · Draft: 4`  
  → Mỗi chip clickable → update URL param `?status=...` (dùng router từ infra plan)

### Phase 2 — Filter Bar UI

> Logic URL params đã có từ `course-management-infra`. Phase này chỉ render UI.

- [ ] **2.1** Search input UI — bind value từ `searchParams.get('q')`, onChange gọi debounced router push (đã implement ở infra)
- [ ] **2.2** Status filter tabs UI: `All | Draft | Published | Archived` — active state từ `searchParams.get('status')`
- [ ] **2.3** `× Clear` button — chỉ render khi `q || status` có giá trị, onClick reset cả 2 params
- [ ] **2.4** Results count chip: `"9 courses"` / `"3 results for 'marketing'"`  

### Phase 3 — Course List

- [ ] **3.1** `CourseRow` component (co-located trong file):
  - Left: thumbnail 60×40 (CSS gradient placeholder nếu `thumbnailUrl` null)
  - Middle: title + `category.name` badge + `level` pill
  - Right: status badge (color theo `published`/`draft`/`archived`) + sections count + students count
  - Far right: `···` kebab dropdown → Edit / Clone / Delete
- [ ] **3.2** Skeleton loading state: 5 animated placeholder rows (`animate-pulse`)
- [ ] **3.3** Empty state: icon + contextual message + Create Course CTA
  - Message thay đổi theo context: "No courses yet" vs "No courses match your filters"
- [ ] **3.4** Stagger entrance animation: rows enter `translateY(-8px) opacity-0 → 0 opacity-100`, 50ms delay/row
- [ ] **3.5** Inline delete confirm: row expand animation + "Confirm delete?" + Yes/Cancel (no `window.confirm()`)

---

## 📁 Files to Change

| File | Change |
|------|--------|
| `frontend/app/instructor/courses/page.tsx` | Rewrite visual layer |

---

## ✅ Verification Plan

### Prerequisite check

`course-management-infra` hoàn thành: URL params + extended `Course` interface đã có.

### Manual Testing

1. **Stats chips**: Numbers đúng, click "Draft" → `?status=draft`
2. **Search**: Gõ → list filter real-time, URL update sau 300ms
3. **Status tabs**: Active tab highlight đúng theo URL
4. **Clear**: Chỉ xuất hiện khi có filter, click → reset về `/instructor/courses`
5. **Thumbnail**: Course có ảnh → hiện ảnh, không có → hiện gradient placeholder
6. **Category + Level badge**: Hiện đúng data từ extended interface
7. **Kebab menu**: `···` → dropdown xuất hiện, click ngoài → đóng
8. **Delete inline**: Click Delete → row expand confirm, Confirm → xoá + row fade out
9. **Skeleton**: Hard refresh → 5 skeleton rows animate-pulse
10. **Empty (no data)**: Xoá hết courses → "No courses yet" + Create CTA
11. **Empty (filter)**: Filter không có kết quả → "No courses match..." message khác
12. **Stagger**: Reload → rows enter lần lượt từ trên xuống

### Lint & Type Check

```bash
cd frontend && npm run lint && npx tsc --noEmit
```
