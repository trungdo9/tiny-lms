# SCORM Support — Implementation Plan
**Date**: 2026-03-03 | **Status**: Done

## Objective
Add SCORM 1.2 + 2004 support as a lesson type and standalone course mode.
Track: completion, score, suspend_data, session time. Storage: local filesystem.

## Research
- [SCORM Runtime](research/researcher-01-scorm-runtime.md)
- [Serving & Player](research/researcher-02-serving-and-player.md)

## Architecture Summary

```
Upload ZIP → extract to public/scorm/{uuid}/ → parse imsmanifest.xml
     ↓
ScormPackage row (version, entryPoint, extractedPath)
     ↓
Student loads lesson → ScormPlayer fetches package → POST /scorm/attempts/init
     ↓
window.API / window.API_1484_11 set BEFORE iframe src
iframe src = http://localhost:3001/scorm/content/{packageId}/{entryPoint}
     ↓
LMSSetValue calls → debounced PUT /scorm/attempts/:id
LMSFinish/Terminate → POST /scorm/attempts/:id/finish → sync LessonProgress
```

**Origin strategy**: SCORM content served from backend (:3001); frontend on :3000.
Cross-origin `window.parent.API` is blocked. Solution in Phase 3: Next.js proxy rewrites
`/scorm/content/*` → `http://localhost:3001/scorm/content/*` so both share origin :3000.

## Phases

| # | File | Scope | Risk |
|---|------|-------|------|
| 1 | [phase-01-database-schema.md](phase-01-database-schema.md) | Prisma models, migration | Low |
| 2 | [phase-02-backend-module.md](phase-02-backend-module.md) | NestJS ScormModule, service, controller, static serving | Medium |
| 3 | [phase-03-scorm-player.md](phase-03-scorm-player.md) | ScormApiShim, ScormPlayer, lesson viewer integration | High |
| 4 | [phase-04-instructor-ui.md](phase-04-instructor-ui.md) | Upload UI in outline page, lesson type option | Low |
| 5 | [phase-05-standalone-course.md](phase-05-standalone-course.md) | Course-level SCORM, standalone player route | Medium |

## Dependencies to Install
- Backend: `adm-zip @types/adm-zip xml2js @types/xml2js`
- Frontend: none (proxy via next.config.js rewrites)

## Critical Risks
1. Cross-origin iframe API access — mitigated by Next.js proxy (Phase 3)
2. ZIP path traversal — validate paths in service (Phase 2)
3. suspend_data truncation — version-aware validation (Phase 2)
4. adm-zip memory usage for large ZIPs — document 100MB upload limit
5. imsmanifest.xml namespace variance — defensive parsing with fallbacks
