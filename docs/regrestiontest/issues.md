# issues and blockers

Date: 2026-03-23

## 1) Shared regression learner cannot start the regression quiz anymore

- Type: Fixture/data-state blocker
- Area: test data / backend business rule
- Severity: medium for regression execution, low for production behavior
- Status: open

### Evidence
`POST /quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc/start` as `claw.student+regression@example.com` returned:

```json
{"message":"Maximum attempts reached","error":"Bad Request","statusCode":400}
```

`GET /users/me/quiz-history` for the same learner showed 3 historical attempts already present:
- `4c7b34c5-d6ec-4726-ba65-2c632823fe3f` — `in_progress`
- `6a93d7cf-175f-4f68-b68d-8b400fcda152` — `in_progress`
- `36593a83-c50b-4745-9398-0d768ab04975` — `submitted`

Quiz metadata from `GET /quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc` shows `maxAttempts: 3`.

### Reproduction
1. Sign in as `claw.student+regression@example.com`
2. Call `POST /quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc/start`
3. Observe HTTP 400 with message `Maximum attempts reached`

### Impact
- Prevents repeatable quiz-start smoke on the durable shared learner account
- Prevents fresh attempt/result flow validation during regression

### Classification
This is primarily a **fixture maintenance blocker**, not a confirmed product defect. The backend is enforcing the configured attempt limit correctly based on current data.

### Recommended fix
- Reset/delete prior attempts for the shared regression learner and quiz, or
- Increase max attempts for the fixture quiz, or
- Provide a fresh dedicated learner fixture for repeatable quiz-start regression

---

## 2) Frontend public pages were not conclusively verified from fetched HTML

- Type: validation gap / possible frontend rendering concern
- Area: frontend runtime / hydration
- Severity: medium
- Status: needs browser confirmation

### Evidence
Raw HTML fetched from the running frontend did not include expected visible fixture titles for:
- `/courses`
- `/courses/regression-smoke-course-20260321080343`
- `/quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc`

At the same time:
- these routes returned HTTP 200
- backend APIs for the same entities returned correct data
- route source code is client-component based (`'use client'`) and data is loaded after hydration using TanStack Query/fetch

### Reproduction
1. `curl http://localhost:3000/courses`
2. `curl http://localhost:3000/courses/regression-smoke-course-20260321080343`
3. `curl http://localhost:3000/quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc`
4. Search the returned HTML for the known fixture titles
5. Observe titles absent from raw HTML

### Impact
- Shell-level verification cannot prove the user-visible content rendered successfully in browser
- Could be normal CSR behavior, or could hide a hydration/API wiring problem not visible from backend-only checks

### Classification
Currently this is an **environment/UI verification gap**, not yet a confirmed bug.

### Recommended fix
- Run a browser-based smoke (manual browser or Playwright) against the same runtime
- Confirm the pages render the course and quiz data after hydration
- If blank/skeleton-only in browser, inspect frontend console/network and `NEXT_PUBLIC_API_URL` usage

---

## 3) Frontend API host differs from localhost default

- Type: environment note
- Area: frontend configuration
- Severity: low to medium depending on host/network
- Status: informational

### Evidence
`frontend/.env.local` contains:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.131:3001
```

This differs from the docs' default local assumption of `http://localhost:3001`.

### Impact
- Fine if the host IP is correct and reachable from the browser
- Can cause confusing behavior if the machine IP changes or if someone expects localhost-only runtime

### Classification
This is an **environment/config note**, not a defect by itself.

### Recommended action
Document it clearly or normalize to localhost where appropriate for repeatable local regression.