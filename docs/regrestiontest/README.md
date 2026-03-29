# tiny-lms regression pass

Date: 2026-03-23
Tester: OpenClaw subagent regression pass
Project: `/home/trungdo/projects/tiny-lms`
Artifacts folder: `/home/trungdo/projects/tiny-lms/docs/regrestiontest`

## Scope
Practical regression smoke focused on the seeded shared regression fixture and key learner/public flows:
- public catalog `/courses`
- public course detail `/courses/[slug]`
- learner auth viability
- enrolled learner course access
- lesson learn endpoint/page viability
- quiz list/detail/start/result/history viability where feasible

## Environment inspected
- Frontend runtime: Next.js dev server listening on `:3000`
- Backend runtime: NestJS/Express listening on `:3001`
- Frontend config observed: `frontend/.env.local` => `NEXT_PUBLIC_API_URL=http://192.168.1.131:3001`
- Backend config observed: Supabase-backed env present in `backend/.env`
- Existing local runtime was reused; no destructive reset/reseed was performed

## Fixtures and accounts used
From `docs/testing/public-regression-checklist.md`:
- learner account: `claw.student+regression@example.com`
- password: `ClawStudent!2026`
- regression course slug: `regression-smoke-course-20260321080343`
- regression course id: `9e778ad8-500e-405a-b963-7ac87e563984`
- regression lesson id: `6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96`
- regression quiz id: `ae59ce08-7620-4bff-86a6-8b72e21b8bbc`

## Summary verdict
Mixed pass.

What is confirmed working from live runtime/API evidence:
- shared regression course exists and is publicly retrievable from backend
- shared regression course detail by slug works at backend API level
- learner password login works against Supabase
- learner profile endpoint works
- learner enrolled-courses endpoint includes the regression course
- lesson learn endpoint works for the enrolled learner
- course progress endpoint works
- quiz list/detail/leaderboard/history endpoints work for the learner

What blocked a full green learner/UI pass:
- the regression learner already has 3 historical attempts on the shared regression quiz, so `POST /quizzes/:id/start` returns `400 Maximum attempts reached`
- raw HTML fetched from the running frontend for `/courses`, `/courses/[slug]`, and `/quizzes/[id]` did not include the expected fixture titles, indicating these routes depend on client-side rendering/hydration and were not conclusively verified end-to-end without a browser session

## Final verdict
- Backend/API regression for the targeted seeded learner flow: **mostly PASS**
- Frontend end-to-end public/learner page rendering: **PARTIAL / not fully proven in this pass**
- Shared fixture state for quiz-start smoke: **BLOCKED by exhausted attempts on the durable learner account**

## Board-ready summary
Regression smoke on the live tiny-lms runtime found the seeded regression course, lesson, and quiz all present and accessible through backend APIs, and the durable learner account can still authenticate and access its enrolled course/lesson data. The main blocker is fixture state: the shared learner has already consumed the regression quiz's max attempts, so quiz-start cannot be revalidated without resetting attempts or using a fresh learner. Recommended task status: **Blocked / Needs fixture reset for full learner-quiz signoff**.