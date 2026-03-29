# Phase 1 -- Backend API

## Context Links

- backend/src/modules/quizzes/quizzes.controller.ts
- backend/src/modules/quizzes/quizzes.service.ts
- backend/src/modules/activities/activities.service.ts
- backend/src/modules/activities/activities.module.ts

---

## Overview

Two focused changes:

1. Add GET /quizzes/mine -- instructor-scoped quiz list with question count and course name.
2. Fix ActivitiesService to use canManageCourse() instead of direct instructorId check.

No schema changes required.

---

## Key Insights

- GET /quizzes already exists but is unscoped -- any instructor sees all quizzes.
- POST /quizzes/:id/clone is the correct attach mechanism -- no new endpoint needed for attach.
- ActivitiesService is the only service not using canManageCourse(). All others (sections, lessons, quizzes) already delegate to it.
- Quiz model has courseId allowing filtering by instructor course IDs.
- CoursesService is already injected in QuizzesService; same pattern applies to ActivitiesService.

---

## Requirements

- GET /quizzes/mine returns quizzes where caller is primary or co-instructor of the course.
- Response shape: id, title, description, isPublished, _count.questions, course.id, course.title.
- Supports optional ?search= query param filtering by title/course name.
- ActivitiesService.create(), update(), delete(), reorder() all use canManageCourse().
- ActivitiesService injects CoursesService. ActivitiesModule imports CoursesModule.

---

## Architecture

GET /quizzes/mine?search=
  -> QuizzesController.findMine()
  -> QuizzesService.findMine(userId, search?)
     -> prisma.courseInstructor.findMany({ where: { profileId: userId } })
     -> prisma.quiz.findMany({ where: { courseId: { in: courseIds } }, include: { course, _count } })
     -> filter by search if provided

---

## Related Code Files

- backend/src/modules/quizzes/quizzes.controller.ts -- add GET /mine route
- backend/src/modules/quizzes/quizzes.service.ts -- add findMine() method
- backend/src/modules/activities/activities.service.ts -- fix auth checks, inject CoursesService
- backend/src/modules/activities/activities.module.ts -- add CoursesModule import
- backend/src/modules/activities/activities.controller.ts -- pass req.user.role to service calls

---

## Implementation Steps

### Step 1 -- Fix ActivitiesModule to import CoursesModule

In activities.module.ts, add CoursesModule to the imports array.

### Step 2 -- Fix ActivitiesService authorization

In activities.service.ts:
- Inject CoursesService in the constructor.
- Add userRole param (default student) to create(), update(), delete(), reorder().
- Replace lesson.course.instructorId \!== userId with canManageCourse() in all four methods.
- Update controller to pass req.user.role.

### Step 3 -- Add QuizzesService.findMine()

In quizzes.service.ts:

  async findMine(userId: string, search?: string) {
    const courseInstructors = await this.prisma.courseInstructor.findMany({
      where: { profileId: userId },
      select: { courseId: true },
    });
    const courseIds = courseInstructors.map(ci => ci.courseId);
    const quizzes = await this.prisma.quiz.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: { select: { id: true, title: true } }, _count: { select: { questions: true } } },
      orderBy: { createdAt: "desc" },
    });
    if (\!search) return quizzes;
    const kw = search.toLowerCase();
    return quizzes.filter(q => q.title.toLowerCase().includes(kw) || q.course?.title?.toLowerCase().includes(kw));
  }

### Step 4 -- Add GET /quizzes/mine route

In quizzes.controller.ts, add to QuizzesController BEFORE @Get(":id"):

  @Get("mine")
  findMine(@Request() req: any, @Query("search") search?: string) {
    return this.service.findMine(req.user.id, search);
  }

Route order matters: place @Get("mine") before @Get(":id") to avoid "mine" matching as an ID param.

---

## Todo List

- [ ] activities.module.ts -- import CoursesModule
- [ ] activities.service.ts -- inject CoursesService, add userRole param, use canManageCourse in create/update/delete/reorder
- [ ] activities.controller.ts -- pass req.user.role to all service calls
- [ ] quizzes.service.ts -- add findMine(userId, search?)
- [ ] quizzes.controller.ts -- add GET /mine before GET :id

---

## Success Criteria

- GET /quizzes/mine returns only quizzes from courses the caller instructs.
- Co-instructors can create, update, delete, and reorder activities.
- Primary instructor ownership still enforced.
- No existing endpoints regressed.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| GET /mine matches before GET :id if wrong order | Medium | Place @Get("mine") first |
| canManageCourse adds extra DB query per mutation | Low | Single courseInstructor query; acceptable |
| Large quiz list for prolific instructors | Low | Add take: 100 limit; frontend also client-filters |

---

## Security Considerations

- SupabaseAuthGuard already on QuizzesController; findMine inherits it.
- findMine scopes to caller userId -- no cross-instructor data leakage.
- canManageCourse reads from courseInstructor join table -- cannot be spoofed via DTO.

---

## Next Steps

Phase 2 -- Frontend UI upgrades QuizPickerModal to use quizzesApi.listMine() and renders enriched quiz data.
