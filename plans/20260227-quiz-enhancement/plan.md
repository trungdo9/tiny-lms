# Plan: Quiz Random Question Pool & Leaderboard

**Date:** 2026-02-27
**Status:** ✅ COMPLETED — Commit `1a19782`

---

## Summary

- Random question pool cho quiz attempts (chọn ngẫu nhiên từ question bank theo `pickCount`)
- Leaderboard hiển thị top scores (rank, student name, score, date)
- Quiz scheduling (`availableFrom` / `availableUntil`)
- Timer sync across sessions (`expiresAt` trên `QuizAttempt`)

---

## Related Plans

- [TanStack Query Migration](../20260228-tanstack-query-migration/plan.md) — frontend của quiz pages cần migrate
- [Course Management UI](../20260228-course-management-ui/plan.md) — pattern tương tự cho instructor quiz list
