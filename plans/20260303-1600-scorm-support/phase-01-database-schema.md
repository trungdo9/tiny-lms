# Phase 01 — Database Schema

## Context
- [Plan](plan.md)
- [SCORM Runtime Research](research/researcher-01-scorm-runtime.md)
- Schema: `backend/prisma/schema.prisma`

## Overview
Add two new Prisma models (`ScormPackage`, `ScormAttempt`) and extend existing `Lesson` and `Course` models.
Run migration via Supabase.

## Key Insights
- `Lesson.type` is a plain `String` — no DB enum change needed; only DTO validation changes
- `LessonProgress` already has `isCompleted` — SCORM finish will upsert this row
- `FlashCardDeck` uses `lessonId @unique` as the pattern for 1-1 lesson attachment — mirror this for `ScormPackage`
- `@@schema("public")` required on all models (project uses schema-namespaced Prisma)
- `suspendData @db.Text` — PostgreSQL TEXT handles up to 64000 chars without truncation

## Requirements
1. `ScormPackage` model — stores extracted package metadata
2. `ScormAttempt` model — stores per-user SCORM session state
3. `Lesson` — add `scormPackage ScormPackage?` relation
4. `Course` — add `scormPackage ScormPackage?` relation (standalone mode)
5. `Profile` — add `scormAttempts ScormAttempt[]` relation

## Schema Changes

### Add to `Lesson` model (after `flashCardDeck` relation):
```prisma
  scormPackage   ScormPackage?
```

### Add to `Course` model (after `payments` relation):
```prisma
  scormPackage   ScormPackage?
```

### Add to `Profile` model (after `payments` relation):
```prisma
  scormAttempts  ScormAttempt[]
```

### New Models (add after Payment model):
```prisma
// ==================== SCORM MODELS ====================

model ScormPackage {
  id            String   @id @default(uuid()) @db.Uuid
  lessonId      String?  @unique @map("lesson_id") @db.Uuid
  courseId      String?  @unique @map("course_id") @db.Uuid
  version       String                       // '1.2' or '2004'
  title         String
  entryPoint    String   @map("entry_point") // e.g. "index.html" or "course/index.html"
  extractedPath String   @map("extracted_path") // abs path: /path/to/backend/public/scorm/{id}/
  fileSize      Int?     @map("file_size")
  manifestData  Json?    @map("manifest_data")
  createdAt     DateTime @default(now()) @map("created_at")

  lesson   Lesson?  @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  course   Course?  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  attempts ScormAttempt[]

  @@schema("public")
  @@map("scorm_packages")
}

model ScormAttempt {
  id               String   @id @default(uuid()) @db.Uuid
  userId           String   @map("user_id") @db.Uuid
  packageId        String   @map("package_id") @db.Uuid
  lessonId         String?  @map("lesson_id") @db.Uuid
  courseId         String?  @map("course_id") @db.Uuid
  // SCORM 1.2
  lessonStatus     String   @default("not attempted") @map("lesson_status")
  // SCORM 2004
  completionStatus String?  @map("completion_status") // completed/incomplete/not_attempted/unknown
  successStatus    String?  @map("success_status")    // passed/failed/unknown
  // Common
  scoreRaw         Float?   @map("score_raw")
  scoreMax         Float?   @map("score_max")
  scoreMin         Float?   @map("score_min")
  scaledScore      Float?   @map("scaled_score")
  suspendData      String?  @map("suspend_data") @db.Text
  location         String?
  totalTime        String?  @map("total_time")
  sessionTime      String?  @map("session_time")
  exitStatus       String?  @map("exit_status")
  isCompleted      Boolean  @default(false) @map("is_completed")
  startedAt        DateTime @default(now()) @map("started_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  user    Profile      @relation(fields: [userId], references: [id])
  package ScormPackage @relation(fields: [packageId], references: [id], onDelete: Cascade)

  @@unique([userId, packageId])
  @@schema("public")
  @@map("scorm_attempts")
}
```

## Implementation Steps

1. Open `backend/prisma/schema.prisma`
2. Add `scormPackage ScormPackage?` relation to `Lesson` model
3. Add `scormPackage ScormPackage?` relation to `Course` model
4. Add `scormAttempts ScormAttempt[]` relation to `Profile` model
5. Append both new models at end of file (after Payment model)
6. Run: `npx prisma migrate dev --name add_scorm_support`
7. Verify generated migration SQL has correct tables and constraints

## Todo
- [ ] Edit `schema.prisma` — add relations to Lesson, Course, Profile
- [ ] Append ScormPackage model
- [ ] Append ScormAttempt model
- [ ] Run `npx prisma migrate dev --name add_scorm_support`
- [ ] Run `npx prisma generate`
- [ ] Confirm migration in Supabase dashboard

## Success Criteria
- `npx prisma migrate dev` succeeds with no errors
- Tables `scorm_packages` and `scorm_attempts` visible in Supabase
- `npx prisma generate` completes; `ScormPackage` and `ScormAttempt` types available

## Risk Assessment
- **Low**: Pure additive schema change; no existing data affected
- Cascade delete on `lesson` and `course` relations ensures cleanup on lesson/course delete

## Security Considerations
- `extractedPath` is server-only; never expose in API responses to client

## Next Steps
Phase 02 — Backend Module
