# Phase 02 — Backend API

**Ref:** [plan.md](./plan.md)
**Depends on:** [phase-01-database-schema.md](./phase-01-database-schema.md)
**Blocks:** Phase 03

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | New course-instructors endpoints, updated ownership checks, user search endpoint |
| Priority | High |
| Status | Pending |

---

## Key Insights

- `courses.service.ts` mixes Supabase client + Prisma. Ownership checks (`update`, `delete`, `clone`) use `course.instructor_id !== userId` — must update to also allow co-instructors via join table.
- `sections.service.ts` and `lessons.service.ts` each have a private `getCourseForUpdate()` that checks `course.instructor_id !== userId`. Both must be updated identically.
- `quizzes.service.ts` line 28: `lesson.course.instructorId !== userId` — same fix needed.
- `canManageCourse()` belongs in `CoursesService` (already injected by sections/lessons via their own Supabase queries — but sections/lessons don't import CoursesService). Cleanest solution: extract `canManageCourse()` into `CoursesService` and inject `CoursesService` into `SectionsService`, `LessonsService`, and `QuizzesService`. Alternatively, put it in a shared utility. Per KISS, inject `CoursesService` (already exported from `CoursesModule`).
- `GET /users/search` already has the underlying `usersService.searchUsers()` logic; only needs a new controller endpoint with optional `role` filter.
- `create` in `courses.service.ts` uses Supabase insert — must also insert a row into `course_instructors` (with `role="primary"`) via Prisma after the Supabase insert.
- New `CourseInstructorsController` lives inside the `courses` module to keep the file structure flat — no separate module needed (KISS/YAGNI).
- Delete: prevent removing the last instructor. Allow removing primary only if another primary exists or admin demotes/reassigns.
- `findInstructorCourses()`: update to also return courses where user is a co-instructor (join table query via Prisma, union with existing `instructor_id` filter or replace it).

---

## Requirements

1. `canManageCourse(courseId, userId, userRole)` helper in `CoursesService`.
2. Sync `course_instructors` row on course create.
3. Update `courses.service.ts`: `update()`, `delete()`, `clone()` use `canManageCourse()`.
4. Update `findInstructorCourses()` to include co-instructor courses.
5. Update `sections.service.ts` `getCourseForUpdate()` to use `canManageCourse()`.
6. Update `lessons.service.ts` `getCourseForUpdate()` identically.
7. Update `quizzes.service.ts` ownership check.
8. New `CourseInstructorsService` with: `list`, `assign`, `remove`, `updateRole`.
9. New `CourseInstructorsController` with 4 endpoints under `/courses/:id/instructors`.
10. New `GET /users/search?q=&role=` endpoint in `UsersController`.

---

## Architecture

### New Files

```
backend/src/modules/courses/
├── dto/
│   ├── course.dto.ts          (existing)
│   └── course-instructor.dto.ts   ← NEW
├── courses.controller.ts      (existing, no change)
├── courses.service.ts         (modify)
├── courses.module.ts          (modify — add new controller/service)
├── course-instructors.controller.ts  ← NEW
└── course-instructors.service.ts     ← NEW
```

### `canManageCourse()` helper (add to `CoursesService`)

```typescript
// backend/src/modules/courses/courses.service.ts
async canManageCourse(courseId: string, userId: string, userRole: string): Promise<boolean> {
  if (userRole === 'admin') return true;
  const membership = await this.prisma.courseInstructor.findFirst({
    where: { courseId, profileId: userId },
  });
  return !!membership;
}
```

### Updated `courses.service.ts` methods

**`create()`** — after Supabase insert, add:
```typescript
// Insert primary instructor row into join table
await this.prisma.courseInstructor.create({
  data: {
    courseId: data.id,
    profileId: instructorId,
    role: 'primary',
    addedBy: instructorId,
  },
});
```

**`update()`** — replace ownership check:
```typescript
// Before: if (course.instructor_id !== userId) throw ForbiddenException
// After:
if (!(await this.canManageCourse(id, userId, userRole))) {
  throw new ForbiddenException('You can only edit courses you are assigned to');
}
```
Note: `update()` signature must add `userRole: string` parameter, and `CoursesController` must pass `req.user.role`.

**`delete()`** — primary instructor OR admin only:
```typescript
const membership = await this.prisma.courseInstructor.findFirst({
  where: { courseId: id, profileId: userId, role: 'primary' },
});
if (userRole !== 'admin' && !membership) {
  throw new ForbiddenException('Only the primary instructor or admin can delete a course');
}
```

**`clone()`** — same as `update()`: use `canManageCourse()`.

**`findInstructorCourses()`** — update to include co-instructor courses:
```typescript
async findInstructorCourses(userId: string, userRole?: string) {
  if (userRole === 'admin') {
    // unchanged — return all
  }
  // Get all courseIds where user is any instructor (primary or co)
  const memberships = await this.prisma.courseInstructor.findMany({
    where: { profileId: userId },
    select: { courseId: true },
  });
  const courseIds = memberships.map(m => m.courseId);

  // Use Supabase query with IN filter
  const { data, error } = await this.supabase.client
    .from('courses')
    .select(`*, category:categories(id, name, slug), sections(id), enrollments(id)`)
    .in('id', courseIds)
    .order('created_at', { ascending: false });
  // ... rest unchanged
}
```

### `course-instructor.dto.ts`

```typescript
// backend/src/modules/courses/dto/course-instructor.dto.ts
import { IsString, IsUUID, IsOptional, IsIn } from 'class-validator';

export class AssignInstructorDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  @IsIn(['primary', 'co_instructor'])
  role?: string;  // defaults to 'co_instructor' in service
}

export class UpdateInstructorRoleDto {
  @IsString()
  @IsIn(['primary', 'co_instructor'])
  role: string;
}
```

### `course-instructors.service.ts`

```typescript
// backend/src/modules/courses/course-instructors.service.ts
@Injectable()
export class CourseInstructorsService {
  constructor(private prisma: PrismaService) {}

  async list(courseId: string) {
    return this.prisma.courseInstructor.findMany({
      where: { courseId },
      select: {
        id: true,
        role: true,
        addedAt: true,
        profile: { select: { id: true, email: true, fullName: true, avatarUrl: true } },
      },
      orderBy: [{ role: 'asc' }, { addedAt: 'asc' }],  // 'co_instructor' < 'primary' alpha — use explicit sort in service if needed
    });
  }

  async assign(courseId: string, dto: AssignInstructorDto, actorId: string, actorRole: string) {
    // Verify actor can manage course
    const canManage = actorRole === 'admin' || !!(await this.prisma.courseInstructor.findFirst({
      where: { courseId, profileId: actorId, role: 'primary' },
    }));
    if (!canManage) throw new ForbiddenException('Only primary instructor or admin can assign instructors');

    // Verify target user exists and has instructor role
    const target = await this.prisma.profile.findUnique({ where: { id: dto.userId } });
    if (!target) throw new NotFoundException('User not found');

    const existing = await this.prisma.courseInstructor.findFirst({
      where: { courseId, profileId: dto.userId },
    });
    if (existing) throw new ConflictException('User is already an instructor for this course');

    return this.prisma.courseInstructor.create({
      data: {
        courseId,
        profileId: dto.userId,
        role: dto.role ?? 'co_instructor',
        addedBy: actorId,
      },
      include: { profile: { select: { id: true, email: true, fullName: true, avatarUrl: true } } },
    });
  }

  async remove(courseId: string, targetUserId: string, actorId: string, actorRole: string) {
    const target = await this.prisma.courseInstructor.findFirst({
      where: { courseId, profileId: targetUserId },
    });
    if (!target) throw new NotFoundException('Instructor not found on this course');

    // Only admin or primary instructor can remove
    const actorIsPrimary = !!(await this.prisma.courseInstructor.findFirst({
      where: { courseId, profileId: actorId, role: 'primary' },
    }));
    if (actorRole !== 'admin' && !actorIsPrimary) {
      throw new ForbiddenException('Only primary instructor or admin can remove instructors');
    }

    // Cannot remove the last primary instructor
    if (target.role === 'primary') {
      const primaryCount = await this.prisma.courseInstructor.count({
        where: { courseId, role: 'primary' },
      });
      if (primaryCount <= 1) {
        throw new BadRequestException('Cannot remove the only primary instructor. Assign a new primary first.');
      }
    }

    await this.prisma.courseInstructor.delete({ where: { id: target.id } });
    return { success: true };
  }

  async updateRole(courseId: string, targetUserId: string, dto: UpdateInstructorRoleDto, actorId: string, actorRole: string) {
    // Only admin can change roles
    if (actorRole !== 'admin') throw new ForbiddenException('Only admin can change instructor roles');

    const target = await this.prisma.courseInstructor.findFirst({
      where: { courseId, profileId: targetUserId },
    });
    if (!target) throw new NotFoundException('Instructor not found on this course');

    return this.prisma.courseInstructor.update({
      where: { id: target.id },
      data: { role: dto.role },
      include: { profile: { select: { id: true, email: true, fullName: true, avatarUrl: true } } },
    });
  }
}
```

### `course-instructors.controller.ts`

```typescript
// backend/src/modules/courses/course-instructors.controller.ts
@Controller('courses/:courseId/instructors')
@UseGuards(SupabaseAuthGuard)
export class CourseInstructorsController {
  constructor(private service: CourseInstructorsService) {}

  @Get()
  list(@Param('courseId') courseId: string) {
    return this.service.list(courseId);
  }

  @Post()
  assign(@Param('courseId') courseId: string, @Body() dto: AssignInstructorDto, @Request() req: any) {
    return this.service.assign(courseId, dto, req.user.id, req.user.role);
  }

  @Delete(':userId')
  remove(@Param('courseId') courseId: string, @Param('userId') userId: string, @Request() req: any) {
    return this.service.remove(courseId, userId, req.user.id, req.user.role);
  }

  @Put(':userId')
  updateRole(@Param('courseId') courseId: string, @Param('userId') userId: string, @Body() dto: UpdateInstructorRoleDto, @Request() req: any) {
    return this.service.updateRole(courseId, userId, dto, req.user.id, req.user.role);
  }
}
```

### `GET /users/search` — add to `UsersController`

```typescript
// backend/src/modules/users/users.controller.ts — add after existing @Get('me') routes
@Get('search')
async searchUsers(
  @Query('q') q: string = '',
  @Query('role') role?: string,
  @Query('page') page?: string,
  @Query('limit') limit?: string,
) {
  return this.usersService.searchUsers(q, parseInt(page || '1'), parseInt(limit || '20'), role);
}
```

Update `UsersService.searchUsers()` to accept optional `role` filter:
```typescript
async searchUsers(query: string, page = 1, limit = 20, role?: string) {
  const where: any = {};
  if (query) {
    where.OR = [
      { fullName: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ];
  }
  if (role) where.role = role;
  // ... rest unchanged
}
```

### `courses.module.ts` update

```typescript
@Module({
  controllers: [CoursesController, CourseInstructorsController],
  providers: [CoursesService, CourseInstructorsService, SupabaseService, PrismaService],
  exports: [CoursesService],
})
export class CoursesModule {}
```

### Sections/Lessons/Quizzes: inject CoursesService

`SectionsModule`, `LessonsModule`, `QuizzesModule` must import `CoursesModule` to use `CoursesService.canManageCourse()`.

In `sections.service.ts`, replace private `getCourseForUpdate()` with:
```typescript
// Inject CoursesService
constructor(private supabase: SupabaseService, private coursesService: CoursesService) {}

private async getCourseForUpdate(courseId: string, userId: string, userRole: string) {
  const { data: course, error } = await this.supabase.client
    .from('courses').select('id, instructor_id').eq('id', courseId).single();
  if (error || !course) throw new NotFoundException('Course not found');
  if (!(await this.coursesService.canManageCourse(courseId, userId, userRole))) {
    throw new ForbiddenException('You can only modify courses you are assigned to');
  }
  return course;
}
```

Apply identical change to `lessons.service.ts` and `quizzes.service.ts`.

---

## Related Code Files

| File | Change |
|------|--------|
| `backend/src/modules/courses/courses.service.ts` | Add `canManageCourse()`, update `create/update/delete/clone/findInstructorCourses` |
| `backend/src/modules/courses/courses.controller.ts` | Pass `req.user.role` to `update()` and `delete()` |
| `backend/src/modules/courses/courses.module.ts` | Register new controller + service |
| `backend/src/modules/courses/course-instructors.service.ts` | NEW |
| `backend/src/modules/courses/course-instructors.controller.ts` | NEW |
| `backend/src/modules/courses/dto/course-instructor.dto.ts` | NEW |
| `backend/src/modules/sections/sections.service.ts` | Inject CoursesService, update `getCourseForUpdate()` |
| `backend/src/modules/sections/sections.module.ts` | Import CoursesModule |
| `backend/src/modules/lessons/lessons.service.ts` | Same as sections |
| `backend/src/modules/lessons/lessons.module.ts` | Import CoursesModule |
| `backend/src/modules/quizzes/quizzes.service.ts` | Update ownership check line 28 |
| `backend/src/modules/quizzes/quizzes.module.ts` | Import CoursesModule |
| `backend/src/modules/users/users.service.ts` | Add `role` param to `searchUsers()` |
| `backend/src/modules/users/users.controller.ts` | Add `GET /users/search` endpoint |

---

## Implementation Steps

1. **Create `dto/course-instructor.dto.ts`** with `AssignInstructorDto` and `UpdateInstructorRoleDto`.

2. **Create `course-instructors.service.ts`** with `list`, `assign`, `remove`, `updateRole` methods.

3. **Create `course-instructors.controller.ts`** with 4 endpoints.

4. **Update `courses.module.ts`** — register `CourseInstructorsController` and `CourseInstructorsService`.

5. **Update `courses.service.ts`**:
   - Add `canManageCourse()` public method.
   - Update `create()` to insert into `course_instructors` after Supabase insert.
   - Update `update()`: add `userRole` param, replace check.
   - Update `delete()`: add `userRole` param, use primary-only check.
   - Update `clone()`: add `userRole` param, use `canManageCourse()`.
   - Update `findInstructorCourses()`: query join table to get courseIds.

6. **Update `courses.controller.ts`** — pass `req.user.role` to `update()`, `delete()`, `clone()`.

7. **Update `sections.service.ts`** — inject `CoursesService`, rewrite `getCourseForUpdate()`.

8. **Update `sections.module.ts`** — add `CoursesModule` to imports.

9. **Update `lessons.service.ts`** — same as steps 7-8.

10. **Update `lessons.module.ts`** — add `CoursesModule` to imports.

11. **Update `quizzes.service.ts`** — replace `lesson.course.instructorId !== userId` check with `canManageCourse()` call.

12. **Update `quizzes.module.ts`** — add `CoursesModule` to imports.

13. **Update `users.service.ts`** — add `role?: string` param to `searchUsers()`.

14. **Update `users.controller.ts`** — add `GET /users/search` endpoint (no admin guard — any authenticated user).

15. **Manual test**: create course → verify `course_instructors` row created. Assign co-instructor → verify they can edit sections. Try removing primary when only one → expect 400.

---

## Todo List

- [ ] Create `dto/course-instructor.dto.ts`
- [ ] Create `course-instructors.service.ts`
- [ ] Create `course-instructors.controller.ts`
- [ ] Update `courses.module.ts` (register new controller + service)
- [ ] Add `canManageCourse()` to `CoursesService`
- [ ] Update `CoursesService.create()` to insert `course_instructors` row
- [ ] Update `CoursesService.update()` — add `userRole`, use `canManageCourse()`
- [ ] Update `CoursesService.delete()` — add `userRole`, primary-only check
- [ ] Update `CoursesService.clone()` — add `userRole`, use `canManageCourse()`
- [ ] Update `CoursesService.findInstructorCourses()` — query join table
- [ ] Update `CoursesController` — pass `req.user.role` to update/delete/clone
- [ ] Update `SectionsService.getCourseForUpdate()` + inject CoursesService
- [ ] Update `sections.module.ts` — import CoursesModule
- [ ] Update `LessonsService.getCourseForUpdate()` + inject CoursesService
- [ ] Update `lessons.module.ts` — import CoursesModule
- [ ] Update `QuizzesService` ownership check + inject CoursesService
- [ ] Update `quizzes.module.ts` — import CoursesModule
- [ ] Update `UsersService.searchUsers()` with `role` param
- [ ] Add `GET /users/search` to `UsersController`
- [ ] Manual test all endpoints

---

## Success Criteria

- `GET /courses/:id/instructors` returns all instructors with profile data.
- `POST /courses/:id/instructors` by primary instructor succeeds; by co-instructor fails with 403.
- `DELETE /courses/:id/instructors/:userId` on last primary returns 400.
- A co-instructor can create/update/delete sections and lessons.
- A co-instructor cannot delete the course.
- `GET /users/search?q=john&role=instructor` returns matching profiles.
- `GET /courses/instructor` returns both primary and co-instructor courses.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Circular dependency: CoursesModule ↔ SectionsModule | Medium | High | Export only `CoursesService` from `CoursesModule`; do not import SectionsModule into CoursesModule |
| `findInstructorCourses` empty `courseIds` array breaks Supabase `.in()` | Medium | Medium | Guard: if `courseIds.length === 0` return `[]` early |
| `courses.service.ts` `create()` Supabase insert succeeds but Prisma insert fails | Low | Medium | Wrap in try/catch; log error; consider Prisma transaction alternative for this step |

---

## Security Considerations

- `GET /courses/:id/instructors` is protected by `SupabaseAuthGuard` — any authenticated user can view. This is intentional (public course pages need instructor data).
- `POST/DELETE/PUT` on instructors require actor to be primary instructor or admin.
- `GET /users/search` requires auth but no role restriction — any authenticated user can search. If this is a concern, add `@Roles(Role.INSTRUCTOR, Role.ADMIN)` guard.
- User search response excludes sensitive fields (password, tokens) — only `id, email, fullName, avatarUrl, role` returned.

---

## Next Steps

After this phase: implement Phase 03 (Frontend UI) which consumes all new endpoints.
