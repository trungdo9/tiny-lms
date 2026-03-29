# Tiny-LMS Plan Status Audit — 2026-03-27

## Scope
Reviewed plans:
- `20260227-instructor-management`
- `20260228-course-management-ui`
- `20260228-course-management-infra`
- `20260228-quiz-course-refactor`
- `20260303-course-outline-dnd`

---

## Summary Table

| Plan | Status | Notes |
|---|---|---|
| `20260227-instructor-management` | review-needed | Core implementation largely present; checklist is stale in parts. Instructor quiz clone flow was improved, but plan file still contains old unchecked items. |
| `20260228-course-management-ui` | review-needed | Major UI improvements are in place on instructor courses page, but the checklist is outdated and needs line-by-line reconciliation. |
| `20260228-course-management-infra` | review-needed | URL/search/status filter behavior exists in code, but the plan still shows unchecked items that appear to be checklist drift rather than missing implementation. |
| `20260228-quiz-course-refactor` | qa-needed | Backend and frontend refactor gaps were materially reduced. Remaining work is to verify the latest clone/import/create flows and confirm review findings are closed. |
| `20260303-course-outline-dnd` | qa-needed | DnD implementation exists (DndContext, SortableContext, DragOverlay, reorder API calls). Remaining open items are verification/testing, not core implementation. |

---

## Detailed Notes

### 1) 20260227-instructor-management
**Current judgment:** `review-needed`

Why:
- Plan claims completion, but still has stale unchecked checklist items.
- Instructor quiz clone behavior was improved so the instructor lane now routes through outline flow instead of fake-cloning directly from the list page.
- Needs a final pass to reconcile plan text with actual code reality.

### 2) 20260228-course-management-ui
**Current judgment:** `review-needed`

Why:
- `/frontend/app/instructor/courses/page.tsx` now includes meaningful UI upgrades:
  - status summary chips
  - filter improvements
  - clear-filter affordance
  - result count chip
  - skeleton loading state
  - category badge tone cleanup
- Plan still has many unchecked boxes that may no longer reflect current implementation state.
- Needs checklist reconciliation and possibly small polish-only fixes.

### 3) 20260228-course-management-infra
**Current judgment:** `review-needed`

Why:
- Search/status filtering behavior and query-key structure exist.
- Plan still shows unchecked items that look partially stale.
- Needs a review pass specifically focused on URL-state + infra expectations.

### 4) 20260228-quiz-course-refactor
**Current judgment:** `review-needed → qa-needed after runtime pass`

Recent completed work:
- capped quiz leaderboard limit in controller
- removed dead clone-service guard/check noise
- improved instructor quiz clone UX to route through outline flow
- wired clone/import course flow into both instructor and admin course-create pages using `/courses/:id/clone`
- wired lesson-level quiz create/clone controls into `frontend/app/instructor/courses/[id]/page.tsx`, closing the main instructor/admin parity gap called out in review

What has effectively been resolved from review:
- `removeQuestion` now verifies the question belongs to the target quiz before delete
- leaderboard limit is capped
- migration file now includes the quiz lesson unique constraint step
- `import_from_quizzes` is no longer a silent no-op in the instructor clone modal; the UI surfaces it as not-ready there instead of pretending success

Why not marked done yet:
- runtime QA is still needed for create quiz from lesson, clone quiz to another lesson, and course clone modes against a live DB
- DB migration still needs environment-level confirmation where applicable
- remaining closeout is now mainly verification, not core implementation

Additional closeout note:
- frontend strict TypeScript is now clean after adding `@playwright/test` for the existing e2e spec, so the plan no longer carries unrelated frontend type-check noise.

### 5) 20260303-course-outline-dnd
**Current judgment:** `qa-needed`

Why:
- The implementation is materially present in code:
  - `DndContext`
  - `SortableContext`
  - `DragOverlay`
  - `handleDragEnd`
  - `sectionsApi.reorder`
  - `lessonsApi.reorder`
- Remaining unchecked items appear to be validation/test-oriented, not core implementation gaps.

---

## Recommended Close-out Order
1. `20260228-quiz-course-refactor` → QA verify and close
2. `20260303-course-outline-dnd` → QA verify and close
3. `20260228-course-management-ui` → review reconcile and close
4. `20260228-course-management-infra` → review reconcile and close
5. `20260227-instructor-management` → final review reconcile and close

---

## Important Pattern
Several plans are not truly "unfinished" in code; they are **out of sync with reality**.
That means the close-out work is now a mix of:
- final verification
- checklist reconciliation
- selective polish fixes

not a full implementation sprint from zero.
