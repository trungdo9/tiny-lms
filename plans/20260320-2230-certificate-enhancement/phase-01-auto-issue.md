# Phase 01 — Backend: Auto-issue + certificateNumber + Verify Endpoint

**Date:** 2026-03-20
**Status:** Pending
**Priority:** High (blocks all other phases)

---

## Context Links

- Parent plan: [plan.md](./plan.md)
- Certificates service: `backend/src/modules/certificates/certificates.service.ts`
- Certificates controller: `backend/src/modules/certificates/certificates.controller.ts`
- Progress service: `backend/src/modules/progress/progress.service.ts`
- Enrollments service: `backend/src/modules/enrollments/enrollments.service.ts`
- Prisma schema: `backend/prisma/schema.prisma`

---

## Key Insights

- `ProgressService.markComplete()` marks lesson complete but emits no event and does no cert check
- `EnrollmentsService` uses `EventEmitter2` for `CONTACT_SYNC_EVENTS.ENROLLMENT_CREATED` — reuse same pattern
- `checkCompletionEligibility(userId, courseId)` already exists in CertificatesService — checks 100% lessons OR quiz pass
- `issueCertificate(userId, courseId)` already creates cert record — just needs cert number generation added
- Certificate schema has `certificateNumber String? @unique` — nullable, never set currently
- No `@OnEvent` listener pattern yet in certs module — need to add EventEmitter2 dependency

---

## Requirements

1. Auto-issue cert when all lessons in a course are completed (`markComplete` → check → issue)
2. Generate unique `certificateNumber` format: `CERT-YYYYMMDD-XXXXX` (5 random alphanumeric chars)
3. Add `GET /certificates/verify/:certificateNumber` — public, no auth guard, returns cert info
4. Keep `issueCertificate()` idempotent (already has `@@unique([userId, courseId])`)

---

## Architecture

```
ProgressService.markComplete(lessonId, userId)
  → after upsert, emit 'lesson.completed' event with { userId, courseId }

@OnEvent('lesson.completed')
CertificatesService.handleLessonCompleted({ userId, courseId })
  → call checkCompletionEligibility(userId, courseId)
  → if eligible: call issueCertificate(userId, courseId)
  → issueCertificate() generates certificateNumber before create

GET /certificates/verify/:certificateNumber
  → no auth guard
  → findUnique by certificateNumber
  → return { certificateNumber, issuedAt, course: {title}, user: {fullName} }
```

---

## Related Code Files

| File | Action |
|------|--------|
| `backend/src/modules/progress/progress.service.ts` | Add EventEmitter2 + emit 'lesson.completed' after markComplete |
| `backend/src/modules/progress/progress.module.ts` | Add EventEmitterModule or verify it's global |
| `backend/src/modules/certificates/certificates.service.ts` | Add certificateNumber generation in issueCertificate(), add @OnEvent handler, add findByNumber() |
| `backend/src/modules/certificates/certificates.module.ts` | Verify EventEmitterModule available |
| `backend/src/modules/certificates/certificates.controller.ts` | Add GET /verify/:certificateNumber (no auth guard) |

---

## Implementation Steps

### Step 1 — Generate certificateNumber in issueCertificate()

In `certificates.service.ts`, add helper and modify `issueCertificate()`:

```typescript
private generateCertNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rand = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `CERT-${date}-${rand}`;
}
```

In `issueCertificate()`, before `prisma.certificate.create()`:
```typescript
const certificateNumber = this.generateCertNumber();
// add to create data: certificateNumber
```

Handle potential (rare) collision with retry or catch unique constraint.

### Step 2 — Add EventEmitter2 to ProgressService

```typescript
// progress.service.ts
constructor(
  private prisma: PrismaService,
  private eventEmitter: EventEmitter2,
) {}

// In markComplete(), after upsert succeeds and lesson wasn't already complete:
this.eventEmitter.emit('lesson.completed', { userId, courseId: lesson.courseId });
```

Update `progress.module.ts` to import `EventEmitterModule` if not already global.

### Step 3 — Add @OnEvent handler in CertificatesService

```typescript
// certificates.service.ts — add to constructor: private eventEmitter: EventEmitter2 (not needed for listener)
// Add import: OnEvent from @nestjs/event-emitter

@OnEvent('lesson.completed')
async handleLessonCompleted(payload: { userId: string; courseId: string }) {
  const isEligible = await this.checkCompletionEligibility(payload.userId, payload.courseId);
  if (isEligible) {
    // checkCompletionEligibility returns eligibility — issue if eligible
    const existing = await this.prisma.certificate.findUnique({
      where: { userId_courseId: { userId: payload.userId, courseId: payload.courseId } },
    });
    if (!existing) {
      await this.issueCertificate(payload.userId, payload.courseId);
    }
  }
}
```

> Note: Check if `checkCompletionEligibility` returns boolean/object and adjust accordingly.

### Step 4 — Add public verify endpoint

In `certificates.controller.ts`:
```typescript
@Get('verify/:certificateNumber')
// NO @UseGuards here — public endpoint
async verifyCertificate(@Param('certificateNumber') certNumber: string) {
  return this.certificatesService.findByNumber(certNumber);
}
```

In `certificates.service.ts`:
```typescript
async findByNumber(certificateNumber: string) {
  const cert = await this.prisma.certificate.findUnique({
    where: { certificateNumber },
    include: {
      course: { select: { title: true, slug: true } },
      user: { select: { fullName: true } },
    },
  });
  if (!cert) throw new NotFoundException('Certificate not found');
  return {
    certificateNumber: cert.certificateNumber,
    issuedAt: cert.issuedAt,
    course: cert.course,
    holderName: cert.user.fullName,
  };
}
```

> **Route order:** `GET /verify/:certificateNumber` must be declared BEFORE `GET /:id` to avoid Express treating "verify" as an id param.

---

## Todo List

- [ ] Add `generateCertNumber()` helper to `CertificatesService`
- [ ] Populate `certificateNumber` in `issueCertificate()`
- [ ] Add `EventEmitter2` to `ProgressService` constructor
- [ ] Emit `'lesson.completed'` event after successful `markComplete()`
- [ ] Add `@OnEvent('lesson.completed')` handler in `CertificatesService`
- [ ] Add `findByNumber(certNumber)` to `CertificatesService`
- [ ] Add `GET /verify/:certificateNumber` to `CertificatesController` (no auth guard)
- [ ] Verify `EventEmitterModule` is globally registered in `AppModule`
- [ ] Test: complete all lessons → certificate auto-issued with cert number

---

## Success Criteria

- [ ] `issueCertificate()` always sets a unique `CERT-YYYYMMDD-XXXXX` certificateNumber
- [ ] Completing last lesson of a course triggers cert issuance within same request cycle
- [ ] `GET /certificates/verify/CERT-20260320-ABC12` returns cert info without Bearer token
- [ ] Double-complete a lesson does not re-issue cert (idempotent)
- [ ] Existing certs without cert number are unaffected (nullable field)

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Rare cert number collision | Catch unique constraint violation, retry with new number |
| EventEmitter fires but CertificatesService throws | Use try/catch in @OnEvent handler — don't break lesson completion |
| `GET /verify/:certNumber` conflicts with `GET /:id` | Declare verify route BEFORE /:id in controller |
| `checkCompletionEligibility` signature may differ from assumed | Read actual method signature before implementing |

---

## Security Considerations

- Verify endpoint intentionally public — returns only non-sensitive fields (no userId, no email)
- `issueCertificate()` still requires explicit userId+courseId — no elevation of privilege via event
- Cert number uses random chars (not sequential) — not guessable/enumerable
