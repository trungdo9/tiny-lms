# Phase 01 — Create Domain Aggregator Modules

**Context:** [plan.md](./plan.md)
**Date:** 2026-03-21
**Priority:** Medium
**Status:** Pending
**Review:** Not reviewed

---

## Overview

Create 7 NestJS aggregator ("barrel") modules that group the existing 27 feature modules by domain. Then update `app.module.ts` to import only these 7 modules. No existing files are moved or modified (except `app.module.ts`).

---

## Key Insights

1. **NestJS deduplicates modules** — if `QuizzesModule` imports `CoursesModule` directly and `AssessmentModule` also imports `CourseModule` (aggregator), NestJS registers `CoursesModule` once. No conflict.
2. **Existing cross-module imports are unaffected** — each feature module already declares its direct dependencies. Aggregators don't interfere.
3. **SettingsModule used by 4 modules** — auth, certificates, emails, contact-sync all import `SettingsModule` directly. Since `BusinessModule` also imports it, NestJS deduplicates correctly.
4. **Re-exporting is best practice** — domain modules should re-export all sub-modules so any future consumer of a domain module gets full access.
5. **SharedModule stays in `app.module.ts`** — it is already `@Global()`, no need to include it in domain modules.

---

## Cross-Domain Dependencies (all handled internally)

| Module | Imports from other domain | Safe? |
|--------|--------------------------|-------|
| `auth` (Core) | `SettingsModule` (Business) | ✓ Direct import in auth.module.ts |
| `users` (Core) | `AuthModule` (Core) | ✓ Same domain |
| `sections` (Course) | `CoursesModule` (Course) | ✓ Same domain |
| `lessons` (Course) | `CoursesModule` (Course) | ✓ Same domain |
| `quizzes` (Assessment) | `CoursesModule` (Course) | ✓ Direct import in quizzes.module.ts |
| `question-banks` (Assessment) | `QuestionsModule` (Assessment) | ✓ Same domain |
| `certificates` (Learning) | `SettingsModule` (Business) | ✓ Direct import in certificates.module.ts |
| `learning-paths` (Learning) | `CertificatesModule` (Learning), `NotificationsModule` (Comm.) | ✓ Direct imports |
| `emails` (Communication) | `SettingsModule` (Business) | ✓ Direct import |
| `contact-sync` (Communication) | `SettingsModule` (Business) | ✓ Direct import |

---

## Files to Create (7 new files)

### 1. `backend/src/modules/core/core.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  exports: [AuthModule, UsersModule],
})
export class CoreModule {}
```

### 2. `backend/src/modules/course/course.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { SectionsModule } from '../sections/sections.module';
import { LessonsModule } from '../lessons/lessons.module';
import { ScormModule } from '../scorm/scorm.module';
import { ActivitiesModule } from '../activities/activities.module';
import { AssignmentsModule } from '../assignments/assignments.module';

@Module({
  imports: [CoursesModule, SectionsModule, LessonsModule, ScormModule, ActivitiesModule, AssignmentsModule],
  exports: [CoursesModule, SectionsModule, LessonsModule, ScormModule, ActivitiesModule, AssignmentsModule],
})
export class CourseModule {}
```

### 3. `backend/src/modules/assessment/assessment.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { QuestionsModule } from '../questions/questions.module';
import { QuestionBanksModule } from '../question-banks/question-banks.module';
import { AttemptsModule } from '../attempts/attempts.module';
import { GradingModule } from '../grading/grading.module';
import { FlashCardsModule } from '../flash-cards/flash-cards.module';

@Module({
  imports: [QuizzesModule, QuestionsModule, QuestionBanksModule, AttemptsModule, GradingModule, FlashCardsModule],
  exports: [QuizzesModule, QuestionsModule, QuestionBanksModule, AttemptsModule, GradingModule, FlashCardsModule],
})
export class AssessmentModule {}
```

### 4. `backend/src/modules/learning/learning.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { ProgressModule } from '../progress/progress.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { LearningPathsModule } from '../learning-paths/learning-paths.module';

@Module({
  imports: [EnrollmentsModule, ProgressModule, CertificatesModule, LearningPathsModule],
  exports: [EnrollmentsModule, ProgressModule, CertificatesModule, LearningPathsModule],
})
export class LearningModule {}
```

### 5. `backend/src/modules/communication/communication.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailsModule } from '../emails/emails.module';
import { ContactSyncModule } from '../contact-sync/contact-sync.module';

@Module({
  imports: [NotificationsModule, EmailsModule, ContactSyncModule],
  exports: [NotificationsModule, EmailsModule, ContactSyncModule],
})
export class CommunicationModule {}
```

### 6. `backend/src/modules/organization/org.module.ts`

> Note: `organization.module.ts` already exists in `modules/organization/`. Create `org.module.ts` (aggregator) at `modules/org/org.module.ts` or name it `OrganizationGroupModule` to avoid conflict.

**Decision**: Place at `backend/src/modules/org/org.module.ts` to avoid directory conflict.

```typescript
import { Module } from '@nestjs/common';
import { OrganizationModule } from '../organization/organization.module';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  imports: [OrganizationModule, DepartmentsModule],
  exports: [OrganizationModule, DepartmentsModule],
})
export class OrgModule {}
```

### 7. `backend/src/modules/business/business.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { ReportsModule } from '../reports/reports.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PaymentsModule, ReportsModule, SettingsModule],
  exports: [PaymentsModule, ReportsModule, SettingsModule],
})
export class BusinessModule {}
```

---

## File to Modify

### `backend/src/app.module.ts` (updated)

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as path from 'path';
import appConfig from './config/app.config';
import { SharedModule } from './modules/shared/shared.module';
import { CoreModule } from './modules/core/core.module';
import { CourseModule } from './modules/course/course.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { LearningModule } from './modules/learning/learning.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { OrgModule } from './modules/org/org.module';
import { BusinessModule } from './modules/business/business.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: path.resolve(__dirname, '..', '.env'),
    }),
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
    EventEmitterModule.forRoot(),
    SharedModule,
    BusinessModule,      // first — provides SettingsModule for others
    CoreModule,
    CourseModule,
    AssessmentModule,
    LearningModule,
    CommunicationModule,
    OrgModule,
  ],
})
export class AppModule {}
```

> `BusinessModule` is imported first so `SettingsModule` is registered before other modules that depend on it (auth, certificates, emails, contact-sync). NestJS handles deduplication but ordering can affect startup clarity.

---

## Implementation Steps

1. Create dir `backend/src/modules/core/` → write `core.module.ts`
2. Create dir `backend/src/modules/course/` → write `course.module.ts`
3. Create dir `backend/src/modules/assessment/` → write `assessment.module.ts`
4. Create dir `backend/src/modules/learning/` → write `learning.module.ts`
5. Create dir `backend/src/modules/communication/` → write `communication.module.ts`
6. Create dir `backend/src/modules/org/` → write `org.module.ts`
7. Create dir `backend/src/modules/business/` → write `business.module.ts`
8. Update `backend/src/app.module.ts`
9. Run `cd backend && npm run build` to verify no compile errors
10. Run `cd backend && npm run test` to verify no regressions

---

## Todo List

- [ ] Create `core/core.module.ts`
- [ ] Create `course/course.module.ts`
- [ ] Create `assessment/assessment.module.ts`
- [ ] Create `learning/learning.module.ts`
- [ ] Create `communication/communication.module.ts`
- [ ] Create `org/org.module.ts`
- [ ] Create `business/business.module.ts`
- [ ] Update `app.module.ts`
- [ ] Run build to verify
- [ ] Run tests to verify

---

## Success Criteria

- `app.module.ts` imports exactly 7 domain modules (+ SharedModule + infrastructure modules)
- `npm run build` passes with no errors
- All existing tests pass
- No existing module files modified (only new files created + app.module.ts updated)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| NestJS module naming conflict (`OrganizationModule` name taken) | High | Low | Use `OrgModule` class name, place in `modules/org/` |
| Module load order issue (SettingsModule not ready) | Low | Low | NestJS resolves async; ordering is cosmetic |
| Circular dependency introduced | Very Low | High | No new cross-module deps introduced; aggregators are one-way |
| Build error from incorrect path | Low | Low | Verify with `npm run build` immediately |

---

## Security Considerations

No security implications — this is a structural refactoring only. No auth, permissions, or data handling changes.

---

## Next Steps

After implementation: update `docs/backend-module-architecture.md` to reflect the new domain module structure.
