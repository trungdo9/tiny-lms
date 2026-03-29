# Plan: Unified Quiz Pages for All Roles

**Date:** 2026-02-27

---

## Current State

- Quiz pages exist in `(student)` route group
- Only students can access via that layout
- Instructors/admins cannot access quiz pages

---

## Solution

Move quiz pages to root level (`/app/quizzes/`) to make them accessible to all authenticated users.

---

## Implementation Steps

### Step 1: Move Quiz Pages to Root

```
Current:                           Target:
(app)/quizzes/page.tsx        →    app/quizzes/page.tsx
(app)/quizzes/[id]/page.tsx       app/quizzes/[id]/page.tsx
(app)/quizzes/[id]/attempt/        app/quizzes/[id]/attempt/
(app)/quizzes/[id]/result/         app/quizzes/[id]/result/
```

### Step 2: Create Shared Layout

Create `app/quizzes/layout.tsx` with:
- Header (already included via root layout)
- Authentication check
- No role restriction

### Step 3: Update Navigation Links

- Header links already point to `/quizzes` - no changes needed
- Instructor quiz creation stays at `/instructor/quizzes`

---

## Files to Move

1. `app/(student)/quizzes/page.tsx` → `app/quizzes/page.tsx`
2. `app/(student)/quizzes/[id]/page.tsx` → `app/quizzes/[id]/page.tsx`
3. `app/(student)/quizzes/[id]/attempt/` → `app/quizzes/[id]/attempt/`
4. `app/(student)/quizzes/[id]/result/` → `app/quizzes/[id]/result/`

---

## Success Criteria

- [x] Quiz list accessible to all roles
- [x] Quiz intro accessible to all roles
- [x] Quiz attempt accessible to all roles
- [x] Quiz results accessible to all roles
- [x] Instructors can create quizzes at /instructor/quizzes

---

## Status: ✅ COMPLETED
