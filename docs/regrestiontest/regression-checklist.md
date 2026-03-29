# regression checklist

Date: 2026-03-23
Runtime under test: local frontend `http://localhost:3000`, backend `http://192.168.1.131:3001` / `http://localhost:3001`

## Public catalog and course detail

| Flow | Result | Notes |
|---|---|---|
| `GET /courses` backend list includes regression course | PASS | Returned `Regression Smoke Course 20260321080343` with slug `regression-smoke-course-20260321080343`. |
| Public frontend route `/courses` responds | PASS | Route returned HTTP 200 from Next dev server. |
| Public frontend route `/courses` conclusively renders regression fixture in fetched HTML | PARTIAL | Raw HTML fetch did not contain fixture title; page is client-rendered and needs browser validation for true UI confirmation. |
| `GET /courses/regression-smoke-course-20260321080343` backend detail works | PASS | Returned course with section + lesson payload. |
| Public frontend route `/courses/regression-smoke-course-20260321080343` responds | PASS | Route returned HTTP 200 from Next dev server. |
| Public frontend route course detail conclusively renders regression fixture in fetched HTML | PARTIAL | Raw HTML did not contain fixture title; browser/hydration validation still needed. |

## Learner authentication and enrolled-course access

| Flow | Result | Notes |
|---|---|---|
| Supabase password login for `student_regression_1` | PASS | Successful `signInWithPassword`. |
| `GET /users/me` | PASS | Returned student profile `Regression Student`, role `student`. |
| `GET /users/me/courses` includes regression course | PASS | Returned enrolled regression course. |
| `GET /courses/:id/progress` for regression course | PASS | Returned progress payload with 1 total lesson / 0 completed. |

## Lesson learning flow

| Flow | Result | Notes |
|---|---|---|
| `GET /lessons/6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96/learn` as learner | PASS | Returned lesson content and section metadata. |
| Frontend learner lesson route viability from code/runtime | PARTIAL | Route exists and backend endpoint works, but no browser session was used to visually validate rendered lesson UI. |

## Quiz flow

| Flow | Result | Notes |
|---|---|---|
| `GET /quizzes` as learner | PASS | Returned regression quiz and other published quizzes. |
| `GET /quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc` as learner | PASS | Returned regression quiz metadata, questions, and counts. |
| `GET /quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc/leaderboard?limit=10` | PASS | Returned leaderboard entry for regression learner. |
| `GET /users/me/quiz-history` | PASS | Returned 3 existing attempts for regression quiz. |
| `POST /quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc/start` | BLOCKED | Backend returned `400 Maximum attempts reached`; fixture-state blocker, not an app crash. |
| Quiz result/history feasible in this pass | PARTIAL | Existing result/history is readable via API, but fresh attempt/result replay was blocked by max attempts. |

## Overall

| Area | Result | Notes |
|---|---|---|
| Backend/API regression smoke for seeded learner flow | PASS | Core data and protected learner endpoints were healthy. |
| Full browser-level public/learner UI regression | PARTIAL | No browser automation/manual browser evidence in this pass; fetched HTML suggests client-side rendering only. |
| Recommended status | BLOCKED | Reset quiz attempts or provide fresh learner fixture, then rerun UI/browser-level learner quiz smoke. |