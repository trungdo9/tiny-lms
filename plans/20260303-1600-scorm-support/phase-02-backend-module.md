# Phase 02 — Backend Module

## Context
- [Plan](plan.md)
- [SCORM Runtime Research](research/researcher-01-scorm-runtime.md)
- [Serving & Player Research](research/researcher-02-serving-and-player.md)
- Pattern reference: `backend/src/modules/flash-cards/`
- `backend/src/main.ts` — add static middleware here
- `backend/src/app.module.ts` — register ScormModule here

## Overview
Create `backend/src/modules/scorm/` with service (upload/manifest/attempt logic),
controller (REST endpoints), DTOs, and module registration.
Add `express.static` middleware in `main.ts` for SCORM content serving.

## Key Insights
- `MulterModule` global limit is 5MB — SCORM uploads need their own `FileInterceptor` with 100MB limit
- Use `memoryStorage()` for multer; pass `file.buffer` directly to `adm-zip`
- `PrismaService` is the data access pattern (not SupabaseService) — match flash-cards module
- Express is the underlying HTTP adapter; `app.use()` works in NestJS
- `express.static` with path `/scorm/content` must be registered BEFORE NestJS routes (add early in bootstrap)
- Content URL: `http://localhost:3001/scorm/content/{packageId}/{entryPoint}` (after proxy: `/scorm/content/...`)

## Requirements
1. Install deps: `adm-zip @types/adm-zip xml2js @types/xml2js`
2. `scorm.module.ts` — wires controller, service, PrismaService
3. `scorm.service.ts` — upload/extract, manifest parse, attempt CRUD, finish+sync
4. `scorm.controller.ts` — REST endpoints with auth guards
5. `dto/scorm.dto.ts` — validated DTOs
6. `main.ts` — add express.static middleware
7. `app.module.ts` — add ScormModule import
8. `lessons/dto/lesson.dto.ts` — add 'scorm' to @IsEnum

## Related Code Files
- `backend/src/main.ts`
- `backend/src/app.module.ts`
- `backend/src/modules/flash-cards/flash-cards.module.ts` (pattern)
- `backend/src/modules/flash-cards/flash-cards.service.ts` (pattern)
- `backend/src/modules/lessons/dto/lesson.dto.ts`
- `backend/prisma/schema.prisma`

## Architecture

### Directory structure
```
backend/src/modules/scorm/
├── dto/
│   └── scorm.dto.ts
├── scorm.controller.ts
├── scorm.service.ts
└── scorm.module.ts
```

### scorm.service.ts — key methods
```typescript
// Upload + extract + parse
uploadPackage(file: Express.Multer.File, target: { lessonId?: string; courseId?: string })
  → validate zip, gen uuid, mkdir public/scorm/{uuid}, extractAllTo,
    parse imsmanifest.xml, detectVersion(schemaVersion),
    upsert ScormPackage row, return package

// Internal helpers
private parseManifest(xmlString: string): { version, entryPoint, title }
  → xml2js.parseStringPromise, extract schemaversion, first SCO href, title
  → fallback: entryPoint = 'index.html' if no SCO resource found

private validateExtractedPath(extractedPath: string, baseDir: string): void
  → throw if !extractedPath.startsWith(baseDir) — path traversal guard

private validateSuspendData(data: string, version: string): void
  → version '1.2': max 4096; '2004': max 64000; throw BadRequestException if exceeded

// Attempt lifecycle
initAttempt(userId: string, packageId: string, lessonId?: string)
  → prisma.scormAttempt.upsert({ where: { userId_packageId } })
  → return { attemptId, cmiData: mapped fields, version }

updateAttempt(attemptId: string, values: Record<string, string>, userId: string)
  → validate ownership; map CMI keys → DB columns; validateSuspendData if key present
  → prisma.scormAttempt.update

finishAttempt(attemptId: string, userId: string)
  → set exitStatus; determine isCompleted (lessonStatus=passed/completed OR completionStatus=completed)
  → if isCompleted && attempt.lessonId: upsert LessonProgress
  → return updated attempt

// Info queries
getPackageByLesson(lessonId: string): ScormPackage (omit extractedPath)
getPackageByCourse(courseId: string): ScormPackage (omit extractedPath)
```

### CMI key → DB column mapping (in updateAttempt)
```typescript
const CMI_MAP: Record<string, string> = {
  'cmi.core.lesson_status': 'lessonStatus',
  'cmi.core.score.raw': 'scoreRaw',
  'cmi.core.score.max': 'scoreMax',
  'cmi.core.score.min': 'scoreMin',
  'cmi.suspend_data': 'suspendData',
  'cmi.core.lesson_location': 'location',
  'cmi.core.session_time': 'sessionTime',
  'cmi.core.exit': 'exitStatus',
  // SCORM 2004
  'cmi.completion_status': 'completionStatus',
  'cmi.success_status': 'successStatus',
  'cmi.score.raw': 'scoreRaw',
  'cmi.score.max': 'scoreMax',
  'cmi.score.min': 'scoreMin',
  'cmi.score.scaled': 'scaledScore',
  'cmi.suspend_data': 'suspendData',   // same key — both versions
  'cmi.location': 'location',
  'cmi.session_time': 'sessionTime',
  'cmi.exit': 'exitStatus',
};
```

### scorm.controller.ts — endpoints
```
POST /scorm/upload/lesson/:lessonId   @UseGuards(SupabaseAuthGuard) @UseInterceptors(FileInterceptor with 100MB)
POST /scorm/upload/course/:courseId   @UseGuards(SupabaseAuthGuard)
GET  /scorm/package/lesson/:lessonId  @UseGuards(SupabaseAuthGuard)
GET  /scorm/package/course/:courseId  @UseGuards(SupabaseAuthGuard)
POST /scorm/attempts/init             @UseGuards(SupabaseAuthGuard) body: InitAttemptDto
PUT  /scorm/attempts/:id              @UseGuards(SupabaseAuthGuard) body: UpdateAttemptDto
POST /scorm/attempts/:id/finish       @UseGuards(SupabaseAuthGuard)
```

### dto/scorm.dto.ts
```typescript
export class InitAttemptDto {
  @IsUUID() packageId: string;
  @IsUUID() @IsOptional() lessonId?: string;
}
export class UpdateAttemptDto {
  @IsObject() values: Record<string, string>;
}
```

### Other file changes
- `main.ts`: `app.use('/scorm/content', express.static(path.join(process.cwd(),'public','scorm'), { index: false }))` before `app.listen`
- `app.module.ts`: add `ScormModule` to imports array
- `lessons/dto/lesson.dto.ts`: `@IsEnum(['video','text','pdf','quiz','scorm'])` in both DTOs

## Implementation Steps

1. `cd backend && npm install adm-zip @types/adm-zip xml2js @types/xml2js`
2. Create `backend/src/modules/scorm/` + subdirs
3. Create `dto/scorm.dto.ts`, `scorm.service.ts`, `scorm.controller.ts`, `scorm.module.ts`
4. Edit `main.ts`, `app.module.ts`, `lessons/dto/lesson.dto.ts`
5. `mkdir -p backend/public/scorm && touch backend/public/scorm/.gitkeep`
6. Manual test: upload ZIP → verify `public/scorm/{uuid}/` + DB row

## Todo
- [ ] Install adm-zip, xml2js dependencies
- [ ] Create scorm/ module directory and files
- [ ] Implement uploadPackage with path traversal guard
- [ ] Implement parseManifest with xml2js (handle namespace variants)
- [ ] Implement initAttempt/updateAttempt/finishAttempt
- [ ] Register static middleware in main.ts
- [ ] Register ScormModule in app.module.ts
- [ ] Add 'scorm' to lesson DTO enum
- [ ] Create public/scorm/ directory
- [ ] Manual test: upload zip → verify DB + filesystem

## Success Criteria
- POST /scorm/upload/lesson/:id accepts ZIP, extracts, returns package JSON
- GET /scorm/package/lesson/:id returns package (no extractedPath)
- POST /scorm/attempts/init returns attemptId + cmiData
- PUT /scorm/attempts/:id persists CMI values
- POST /scorm/attempts/:id/finish syncs LessonProgress when passed/completed
- Static: http://localhost:3001/scorm/content/{packageId}/index.html serves content

## Risk Assessment
- **Medium**: adm-zip path traversal if ZIP contains `../` entries — must validate each entry
- ZIP entry validation: `if (entry.entryName.includes('..')) skip/throw`
- Large package memory: document 100MB limit; may need streaming for future

## Security Considerations
- Validate file.mimetype is `application/zip` or `application/x-zip-compressed`
- Strip path separators in zip entries: `entry.entryName.replace(/\.\./g, '')`
- `extractedPath` never returned in API responses (omit in service query selects)
- Auth guard on all endpoints — instructor role check for upload endpoints

## Next Steps
Phase 03 — SCORM Player
