# Backend Data Flows

This document describes the key request flows through the Tiny LMS backend: authentication, SCORM runtime, course reviews, payments, and department hierarchy.

See also: `backend-module-architecture.md` for the module map and pipeline, `system-architecture.md` for the high-level overview.

---

## 1. Authentication Flow

```
User submits credentials
    |
    v
POST /auth/login
    |
    v
AuthService → SupabaseService.signIn()
    |
    v
JWT token generated → returned to client
    |
    v
Frontend stores token → AuthContext updated
    |
    v
Subsequent requests: Authorization: Bearer <token>
    |
    v
JwtAuthGuard validates → user attached to request
```

**Email Verification Toggle**: When `auth.require_email_verification = true`, `register()` passes `email_confirm: false` to Supabase admin API. Supabase sends a verification email; the client receives `{ requiresVerification: true }` and the frontend shows a "check email" screen.

---

## 2. SCORM Runtime Flow

```
Instructor uploads ZIP
  POST /scorm/upload/lesson/:lessonId  (lesson-level)
  POST /scorm/upload/course/:courseId  (standalone)
    |
    v
adm-zip extracts to public/scorm/{packageId}/
xml2js parses imsmanifest.xml → version, entryPoint, manifestData
ScormPackage row created
    |
Student opens SCORM lesson
    |
    v
GET /scorm/package/lesson/:lessonId
POST /scorm/attempts/init → ScormAttempt row (userId, packageId)
    |
    v
Next.js proxy: /scorm/content/* → :3001/scorm/content/*  (same-origin fix)
window.API (1.2) or window.API_1484_11 (2004) shim injected before iframe
iframe.src = /scorm/content/{packageId}/{entryPoint}
    |
    v
LMSSetValue calls → debounced PUT /scorm/attempts/:id
LMSFinish / Terminate
    |
    v
POST /scorm/attempts/:id/finish
    → ScormAttempt updated (lessonStatus, scores, suspendData)
    → LessonProgress synced (isCompleted = true if status = "passed"/"completed")
```

---

## 3. Course Review Flow

```
Student submits review
  POST /courses/:courseId/reviews
    |
    v
Auth guard → ReviewsService.upsert()
    |
    v
Enrollment check (prisma.enrollment.findUnique)
    |
    v
prisma.courseReview.upsert (unique: courseId + userId)
    |
    v
Recompute averageRating + totalReviews via _avg + _count aggregate
prisma.course.update({ averageRating, totalReviews })
```

---

## 4. Payment Flow

```
Student initiates paid enrollment
  POST /payments { courseId }
    |
    v
PaymentsService.createPayment()
    → Validate course is published and not free
    → prisma.$transaction:
        check/clean existing payment records
        create Payment (status: pending, qrCodeUrl)
    |
    v
Frontend shows QR code page
    |
    v
SePay sends webhook → POST /payments/webhook
    → Bearer token validated (timing-safe vs. SEPAY_WEBHOOK_SECRET)
    → Match paymentCode in transfer content
    → Validate amount >= expected
    → prisma.$transaction:
        Payment.status → "completed"
        Enrollment created
```

---

## 5. Bulk Enrollment Flow (B2B)

```
Admin sends
  POST /enrollments/bulk { courseId, userIds: string[] }
    |
    v
EnrollmentsService.bulkEnroll()
    → Validate all userIds exist
    → Fetch already-enrolled set for courseId
    → Filter to unenrolled users
    → prisma.$transaction: createMany enrollments
    → Return { enrolled: N, skipped: M }
```

---

## 6. Lesson Access Flow (Prerequisites + Drip Content)

```
Student opens lesson
  GET /lessons/:id/learning
    |
    v
LessonsService.findOneForLearning(lessonId, userId)
    |
    v
[1] Drip content check:
    if lesson.availableFrom && now < availableFrom → 403
    if lesson.availableAfterDays:
        unlockDate = enrollment.enrolledAt + availableAfterDays
        if now < unlockDate → 403
    |
    v
[2] Prerequisite check (skipped if isPreview = true):
    if lesson.prerequisiteLessonId:
        progress = prisma.lessonProgress.findUnique(userId + prerequisiteLessonId)
        if !progress.isCompleted → 403
    |
    v
Return lesson content
```

---

## 7. Department Hierarchy Flow

```
GET /departments
    |
    v
DepartmentsService.findAll(flat: boolean)
    |
    flat=false → build tree in-memory from flat list (parentId links)
    flat=true  → return flat array
    |
    v
Profile.departmentId → optional FK links user to a department leaf/node
```

---

*Document Last Updated: 2026-03-08*
