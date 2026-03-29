# Phase 02 — Backend API

**Ref:** [plan.md](./plan.md)
**Depends on:** [phase-01-database-schema.md](./phase-01-database-schema.md)
**Blocks:** [phase-03-frontend-ui.md](./phase-03-frontend-ui.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | NestJS `reviews` module with CRUD endpoints + rating stats |
| Priority | High |
| Status | Pending |

---

## Key Insights

- Follow `course-instructors` module pattern: separate controller + service + DTO, registered in `CoursesModule`
- **Upsert** via `prisma.courseReview.upsert` (unique on `courseId+userId`) — POST both creates and updates
- After each write/delete: recompute `averageRating` + `totalReviews` using Prisma aggregate and update `Course`
- GET endpoints: **public** (no guard); POST/DELETE: `@UseGuards(SupabaseAuthGuard)`
- Enrollment check: query `prisma.enrollment.findFirst({ where: { courseId, userId } })` before allowing POST
- Pagination on GET list: `page` + `limit` query params (default: page=1, limit=10)
- Stats endpoint returns `{ averageRating, totalReviews, distribution: { 1: n, 2: n, ... 5: n } }`

---

## Requirements

1. `backend/src/modules/courses/dto/review.dto.ts` — `CreateReviewDto`
2. `backend/src/modules/courses/reviews.service.ts` — business logic
3. `backend/src/modules/courses/reviews.controller.ts` — HTTP routes
4. Register in `backend/src/modules/courses/courses.module.ts`

---

## Architecture

### DTO: `dto/review.dto.ts`

```typescript
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt() @Min(1) @Max(5)
  rating: number;

  @IsString() @IsOptional()
  comment?: string;
}
```

### Service: `reviews.service.ts`

```typescript
@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async upsert(courseId: string, userId: string, dto: CreateReviewDto) {
    // 1. Check course exists
    // 2. Check enrollment
    // 3. Upsert review
    // 4. Recompute + update Course.averageRating, totalReviews
    // 5. Return updated review
  }

  async findAll(courseId: string, page = 1, limit = 10) {
    // paginated list with user profile (fullName, avatarUrl)
  }

  async getStats(courseId: string) {
    // { averageRating, totalReviews, distribution: {1:.., 5:..} }
  }

  async delete(courseId: string, reviewId: string, userId: string, userRole: string) {
    // owner or admin only; recompute after delete
  }

  private async recomputeRating(courseId: string) {
    const agg = await this.prisma.courseReview.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        averageRating: agg._avg.rating,
        totalReviews: agg._count.rating,
      },
    });
  }
}
```

### Controller: `reviews.controller.ts`

```typescript
@Controller('courses/:courseId/reviews')
export class ReviewsController {
  @Get()                      // PUBLIC
  findAll(@Param('courseId') ..., @Query() ...) {}

  @Get('stats')               // PUBLIC
  getStats(@Param('courseId') ...) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  upsert(@Param('courseId') ..., @Request() req, @Body() dto) {}

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  delete(@Param('courseId') ..., @Param('id') ..., @Request() req) {}
}
```

### Module registration

In `courses.module.ts`, add `ReviewsController` to `controllers` array and `ReviewsService` to `providers`.

---

## Related Code Files

| File | Change |
|------|--------|
| `backend/src/modules/courses/dto/review.dto.ts` | NEW |
| `backend/src/modules/courses/reviews.service.ts` | NEW |
| `backend/src/modules/courses/reviews.controller.ts` | NEW |
| `backend/src/modules/courses/courses.module.ts` | Register new controller + service |

---

## Implementation Steps

1. Create `dto/review.dto.ts`
2. Create `reviews.service.ts` with `upsert`, `findAll`, `getStats`, `delete`, `recomputeRating`
3. Create `reviews.controller.ts` with 4 endpoints
4. Update `courses.module.ts` to register both
5. Run `npm run build` to verify no TS errors

---

## Todo List

- [ ] Create `dto/review.dto.ts`
- [ ] Create `reviews.service.ts`
- [ ] Create `reviews.controller.ts`
- [ ] Register in `courses.module.ts`
- [ ] `npm run build` passes

---

## Success Criteria

- `POST /courses/:id/reviews` creates/updates review; returns `{ id, rating, comment, createdAt }`
- `GET /courses/:id/reviews?page=1&limit=10` returns paginated reviews with user name + avatar
- `GET /courses/:id/reviews/stats` returns `{ averageRating, totalReviews, distribution }`
- `DELETE /courses/:id/reviews/:reviewId` — owner or admin only
- Unauthenticated GET returns 200; unauthenticated POST returns 401
- Non-enrolled user POST returns 403

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Route conflict: `GET /stats` vs `GET /:id` — NestJS router precedence | Medium | High | Register `/stats` before `/:id` in controller, or use separate path `/reviews/stats` |
| Concurrent upsert race condition | Low | Low | DB unique constraint prevents duplicates; last write wins |
| `_avg.rating` returns null when no reviews | Medium | Low | Use `?? null` and handle in frontend |

---

## Security Considerations

- `userId` always from `req.user.id` (JWT), never from body
- Rating range enforced by DTO validator (1–5)
- Only owner or admin can delete (backend check, not UI-only)

---

## Next Steps

→ Phase 03: Frontend UI

---

## Unresolved Questions

1. Should instructors be able to review their own course? (Recommendation: NO — add instructor check in upsert)
2. Should `averageRating` be visible on course list page / catalog? (Easy add after Phase 3)
