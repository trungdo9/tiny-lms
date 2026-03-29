# Phase 04 — Learning Path Certificate Support

**Date:** 2026-03-20
**Status:** Pending (depends on Phase 1 + Learning Path Phase 1)
**Priority:** Medium

---

## Context Links

- Parent plan: [plan.md](./plan.md)
- Learning path plan: `plans/20260320-2201-learning-path/`
- Certificates service: `backend/src/modules/certificates/certificates.service.ts`
- Prisma schema: `backend/prisma/schema.prisma`
- Learning path service: `backend/src/modules/learning-paths/learning-paths.service.ts`

---

## Key Insights

- Current Certificate model: `@@unique([userId, courseId])` — courseId is required, no path support
- Phase 1 cert generation works for courses — path cert needs schema extension
- `checkAndIssueCertificate()` in learning path service (from Learning Path Phase 1) is the hook point
- Two approaches evaluated (see below) — Option A recommended

---

## Schema Change

Add optional `learningPathId` to Certificate model:

```prisma
model Certificate {
  // existing fields...
  learningPathId String?       @map("learning_path_id") @db.Uuid
  learningPath   LearningPath? @relation(fields: [learningPathId], references: [id], onDelete: SetNull)

  // Existing unique: @@unique([userId, courseId]) — keep for course certs
  // Path cert: courseId = null, learningPathId = X → covered by nullable courseId
  // Add separate unique for path certs:
  @@unique([userId, learningPathId])  // nullable unique — only enforced when both non-null
}
```

> **Note:** PostgreSQL nullable unique constraints allow multiple NULLs — so `@@unique([userId, learningPathId])` won't conflict with course certs (where learningPathId is NULL).

Also add reverse relation to `LearningPath` model:
```prisma
certificates Certificate[]
```

Run: `npx prisma db push`

---

## Implementation Steps

### Step 1 — Schema migration

Add `learningPathId` to Certificate model + relation to LearningPath (as above).

### Step 2 — Add issuePathCertificate() to CertificatesService

```typescript
async issuePathCertificate(userId: string, pathId: string): Promise<Certificate> {
  const existing = await this.prisma.certificate.findUnique({
    where: { userId_learningPathId: { userId, learningPathId: pathId } },
  });
  if (existing) return existing;

  const certificateNumber = this.generateCertNumber();
  return this.prisma.certificate.create({
    data: {
      userId,
      learningPathId: pathId,
      certificateNumber,
      // courseId intentionally null
    },
  });
}
```

> **Note:** Prisma `@@unique([userId, learningPathId])` generates `userId_learningPathId` accessor.

### Step 3 — Call issuePathCertificate() from LearningPathsService

In `checkAndIssueCertificate()` (Learning Path Phase 1), after setting `completedAt`:
```typescript
await this.certificatesService.issuePathCertificate(userId, pathId);
this.eventEmitter.emit('learning_path.completed', { userId, pathId, pathTitle: path.title });
```

### Step 4 — Update verify endpoint to handle path certs

In `findByNumber(certNumber)`, include learningPath in the query:
```typescript
include: {
  course: { select: { title: true, slug: true } },
  learningPath: { select: { title: true } },
  user: { select: { fullName: true } },
}
// Return: title = cert.course?.title ?? cert.learningPath?.title
```

### Step 5 — Frontend: show path certs in /certificates list

Path certs will be returned by `GET /certificates/my` (update query to include `learningPath`).
Display badge: "Learning Path" vs "Course".

---

## Todo List

- [ ] Add `learningPathId` field + relation to Certificate in schema.prisma
- [ ] Add `certificates Certificate[]` relation to LearningPath model
- [ ] Run `npx prisma db push`
- [ ] Add `issuePathCertificate(userId, pathId)` to CertificatesService
- [ ] Call `issuePathCertificate()` from `checkAndIssueCertificate()` in LearningPathsService
- [ ] Update `findByNumber()` to include learningPath title
- [ ] Update `GET /certificates/my` to include learningPath in response
- [ ] Update frontend cert list to badge "Learning Path" vs "Course"

---

## Success Criteria

- [ ] Completing all courses in a learning path issues a cert with unique cert number
- [ ] Path cert appears in `/certificates` list page
- [ ] `/verify/:certNumber` works for path certs (shows path title)
- [ ] Course certs unaffected (backward compatible)
- [ ] `@@unique([userId, courseId])` still enforced for course certs
- [ ] `@@unique([userId, learningPathId])` prevents duplicate path certs

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| `@@unique([userId, courseId])` conflict if courseId becomes nullable | courseId stays required for course certs — path certs use separate issuePathCertificate() |
| Prisma nullable unique may not generate expected accessor | Verify accessor name after db push, adjust if needed |
| Learning Path Phase 1 not done yet | This phase explicitly depends on it — sequence accordingly |
