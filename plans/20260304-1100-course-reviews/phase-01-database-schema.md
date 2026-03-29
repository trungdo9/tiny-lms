# Phase 01 — Database Schema

**Ref:** [plan.md](./plan.md)
**Blocks:** [phase-02-backend-api.md](./phase-02-backend-api.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Add `CourseReview` join model + denormalized stats fields on `Course` |
| Priority | High |
| Status | Pending |

---

## Key Insights

- No migration history (Supabase pre-created DB) → use `npx prisma db push`
- `Course` model already has many fields; add `averageRating Float?` + `totalReviews Int @default(0)` — nullable so existing courses with no reviews show nothing
- Unique constraint `@@unique([courseId, userId])` enforces one review per student per course
- Use `onDelete: Cascade` from Course → reviews so deleting a course cleans up reviews
- `updatedAt @updatedAt` allows detecting edits

---

## Requirements

1. New model `CourseReview` in `schema.prisma`
2. Add two fields to `Course`: `averageRating Float?`, `totalReviews Int @default(0)`
3. Add reverse relations on `Course` and `Profile`

---

## Architecture

### `backend/prisma/schema.prisma` — additions

**Add to `Course` model** (after `payments Payment[]`):
```prisma
averageRating Float?   @map("average_rating")
totalReviews  Int      @default(0) @map("total_reviews")
reviews       CourseReview[]
```

**Add to `Profile` model** (after `payments Payment[]`):
```prisma
courseReviews CourseReview[]
```

**New model** (add after `CourseInstructor`):
```prisma
model CourseReview {
  id        String   @id @default(uuid()) @db.Uuid
  courseId  String   @map("course_id") @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  rating    Int
  comment   String?  @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  course  Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  user    Profile @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([courseId, userId])
  @@index([courseId])
  @@schema("public")
  @@map("course_reviews")
}
```

---

## Related Code Files

| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | Add `CourseReview` model, `averageRating`+`totalReviews` on Course, relation on Profile |

---

## Implementation Steps

1. Open `backend/prisma/schema.prisma`
2. Add `averageRating`, `totalReviews`, `reviews CourseReview[]` to `Course`
3. Add `courseReviews CourseReview[]` to `Profile`
4. Add `CourseReview` model block
5. Run `npx prisma db push` from `backend/`
6. Run `npx prisma generate` to regenerate client

---

## Todo List

- [ ] Add fields to `Course` model
- [ ] Add relation to `Profile` model
- [ ] Add `CourseReview` model
- [ ] `npx prisma db push`
- [ ] `npx prisma generate`
- [ ] Verify table created in Supabase dashboard

---

## Success Criteria

- `course_reviews` table exists in DB with correct columns and constraints
- Unique constraint on `(course_id, user_id)` verified
- Prisma client regenerated without errors

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| `db push` drift error | Low | Low | Safe — only additive changes |
| `rating` stored as Int but TypeScript expects 1-5 validation | Medium | Medium | Validate in DTO, not DB constraint |

---

## Security Considerations

- No sensitive data; rating + comment is public
- `userId` is set server-side from JWT, never from request body

---

## Next Steps

→ Phase 02: Backend API
