# evidence

Date: 2026-03-23
Project root: `/home/trungdo/projects/tiny-lms`

## Runtime inspection

### Processes / listeners
- Frontend process observed:
  - `node /home/trungdo/projects/tiny-lms/frontend/node_modules/.bin/next dev`
- Listening ports observed:
  - `*:3000` => Next dev server
  - `*:3001` => backend main thread

### Frontend API configuration
From `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.131:3001
```

### Backend env presence
Observed `backend/.env` with Supabase URL/anon/service role and `PORT=3001`.

## Repo documents consulted
- `README.md`
- `frontend/README.md`
- `backend/README.md`
- `docs/testing/public-regression-checklist.md`
- `docs/testing/backend-setup-and-recovery.md`

## Fixture and account evidence
From `docs/testing/public-regression-checklist.md`:
- learner email: `claw.student+regression@example.com`
- learner password: `ClawStudent!2026`
- course slug: `regression-smoke-course-20260321080343`
- course id: `9e778ad8-500e-405a-b963-7ac87e563984`
- lesson id: `6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96`
- quiz id: `ae59ce08-7620-4bff-86a6-8b72e21b8bbc`

## Commands executed

### Public/backend checks
```bash
curl -sS -i 'http://localhost:3001/courses?page=1&limit=20' | head -80
curl -sS -i 'http://localhost:3001/courses/regression-smoke-course-20260321080343' | head -80
curl -sS -i 'http://192.168.1.131:3001/courses/regression-smoke-course-20260321080343' | head -40
```

### Frontend route checks
```bash
curl -I -s http://localhost:3000 | head -20
curl -sS http://localhost:3000/courses | grep -o 'Regression Smoke Course 20260321080343'
curl -sS http://localhost:3000/courses/regression-smoke-course-20260321080343 | grep -o 'Regression Smoke Course 20260321080343'
curl -sS http://localhost:3000/quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc | grep -o 'Regression Quiz - Core Flow'
```

### Learner auth smoke
```bash
node - <<'NODE'
const { createClient } = require('/home/trungdo/projects/tiny-lms/frontend/node_modules/@supabase/supabase-js');
const supabase = createClient('<supabase-url>','<anon-key>');
(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'claw.student+regression@example.com',
    password: 'ClawStudent!2026'
  });
  console.log({ ok: !error, userId: data?.user?.id, email: data?.user?.email });
})();
NODE
```

### Protected learner API smoke
```bash
TOKEN=<supabase access token>
API=http://192.168.1.131:3001
curl -sS -i "$API/users/me" -H "Authorization: Bearer $TOKEN" | head -60
curl -sS -i "$API/users/me/courses" -H "Authorization: Bearer $TOKEN" | head -80
curl -sS -i "$API/lessons/6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96/learn" -H "Authorization: Bearer $TOKEN" | head -80
curl -sS -i "$API/courses/9e778ad8-500e-405a-b963-7ac87e563984/progress" -H "Authorization: Bearer $TOKEN" | head -80
curl -sS -i "$API/users/me/quiz-history" -H "Authorization: Bearer $TOKEN" | head -80
curl -sS -i "$API/quizzes" -H "Authorization: Bearer $TOKEN" | head -100
curl -sS -i "$API/quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc" -H "Authorization: Bearer $TOKEN" | head -120
curl -sS -i "$API/quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc/leaderboard?limit=10" -H "Authorization: Bearer $TOKEN" | head -120
curl -sS -i -X POST "$API/quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc/start" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' | head -120
```

## Key outputs captured

### Public/backend course list
`GET /courses?page=1&limit=20` returned the regression course in the response data:
- title: `Regression Smoke Course 20260321080343`
- slug: `regression-smoke-course-20260321080343`
- status: `published`
- lessonCount: `1`
- enrollmentCount: `1`

### Public/backend course detail by slug
`GET /courses/regression-smoke-course-20260321080343` returned:
- section id `3b13e4a5-f974-448a-892e-5b14f97c6337`
- lesson id `6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96`

### Learner profile
`GET /users/me` returned:
- id: `90f99fb4-2ce8-49b4-bec7-cb146ffdf8ba`
- email: `claw.student+regression@example.com`
- fullName: `Regression Student`
- role: `student`

### Learner enrolled courses
`GET /users/me/courses` returned the regression course enrollment.

### Lesson learn endpoint
`GET /lessons/6d9a9ec4-a4bf-4b9b-b4a9-73dd31eb9a96/learn` returned lesson content successfully.

### Course progress endpoint
`GET /courses/9e778ad8-500e-405a-b963-7ac87e563984/progress` returned:
- totalLessons: `1`
- completedLessons: `0`
- completionPercentage: `0`

### Quiz history
`GET /users/me/quiz-history` returned 3 attempts for quiz `ae59ce08-7620-4bff-86a6-8b72e21b8bbc`:
- 2 `in_progress`
- 1 `submitted`

### Quiz detail
`GET /quizzes/ae59ce08-7620-4bff-86a6-8b72e21b8bbc` returned:
- title: `Regression Quiz - Core Flow`
- `maxAttempts: 3`
- `_count.questions: 4`
- `showLeaderboard: true`

### Quiz leaderboard
`GET /quizzes/:id/leaderboard` returned one leaderboard entry for `Regression Student`.

### Quiz start blocker
`POST /quizzes/:id/start` returned HTTP 400:

```json
{"message":"Maximum attempts reached","error":"Bad Request","statusCode":400}
```

## Output paths created
- `/home/trungdo/projects/tiny-lms/docs/regrestiontest/README.md`
- `/home/trungdo/projects/tiny-lms/docs/regrestiontest/regression-checklist.md`
- `/home/trungdo/projects/tiny-lms/docs/regrestiontest/issues.md`
- `/home/trungdo/projects/tiny-lms/docs/regrestiontest/evidence.md`
