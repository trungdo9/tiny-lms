# Course Enrollment and Learning Paths

This document covers enrollment flows (free, paid, bulk), the learning paths feature, and certificate issuance.

See also:
- `course-business-logic.md` — Course data model, lifecycle, instructor management, reviews
- `course-content-and-activities.md` — Content hierarchy, activity types, prerequisites, drip content

---

## 1. Free Course Enrollment

```
Student → POST /enrollments { courseId }
  ├── Verify course exists and is published
  ├── Verify course.isFree === true
  ├── Check not already enrolled (unique constraint)
  └── Create enrollment record
```

---

## 2. Paid Course Enrollment (SePay)

```
Student → POST /payments { courseId }
  ├── Verify course is published and NOT free
  ├── Check not already enrolled
  ├── Atomic prisma.$transaction:
  │    ├── Check existing payment (return if valid pending)
  │    ├── Delete expired/failed payments
  │    └── Create new payment with unique paymentCode
  └── Return QR code URL for bank transfer

SePay Webhook → POST /payments/webhook
  ├── Validate Bearer token (timing-safe comparison against SEPAY_WEBHOOK_SECRET)
  ├── Match paymentCode in transfer content
  ├── Validate amount >= expected
  └── Atomic: update payment.status → "completed" + create enrollment
```

### Enrollment Constraint

`@@unique([userId, courseId])` — one enrollment per user per course. The Payment model also enforces `@@unique([userId, courseId])`.

---

## 3. Bulk Enrollment (B2B)

Administrators can enroll multiple users into a course in a single request.

### API

```
POST /enrollments/bulk
Guard: Admin only
Body: { courseId: string, userIds: string[] }
```

### Logic

```
1. Validate all provided userIds exist
2. Fetch already-enrolled userId set for the course
3. Filter to only unenrolled users
4. Create all new enrollments in a single prisma.$transaction
5. Return { enrolled: number, skipped: number }
```

### Response Shape

```json
{
  "enrolled": 12,
  "skipped": 3
}
```

`skipped` is the count of userIds that were already enrolled and were not duplicated.

---

## 4. Learning Paths (Multi-Course Programs)

A learning path groups multiple courses into an ordered program with progress tracking.

### 4.1 Models

**LearningPath**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | string | Path title |
| `slug` | string (unique) | URL-friendly identifier |
| `description` | text? | Full description |
| `thumbnailUrl` | string? | Cover image |
| `createdBy` | UUID | FK to Profile (owner) |
| `isPublished` | boolean | Visibility to students |
| `createdAt` / `updatedAt` | DateTime | Timestamps |

**LearningPathCourse** (join table, `@@unique([learningPathId, courseId])`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `learningPathId` | UUID | FK to LearningPath (Cascade) |
| `courseId` | UUID | FK to Course (Cascade) |
| `orderIndex` | int | Display order within the path |
| `isRequired` | boolean | Whether course is required for completion |

**LearningPathEnrollment** (added in Phase 17):

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `learningPathId` | UUID | FK to LearningPath (Cascade) |
| `studentId` | UUID | FK to Profile (Cascade) |
| `enrolledAt` | DateTime | Enrollment timestamp |
| `completedAt` | DateTime? | Set when all required courses completed |
| `certificateId` | UUID? | FK to Certificate issued on completion |

`@@unique([learningPathId, studentId])`

### 4.2 Business Rules

- Only admin or instructor can create and manage learning paths
- Instructors can only add their own courses to a path
- A course can belong to multiple learning paths
- Courses within a path can be marked required or optional
- Enrolling in a path auto-enrolls the student in all path courses
- Progress = completed required courses / total required courses
- 100% completion triggers certificate issuance (LearningPathEnrollment.certificateId set)
- Deleting a LearningPath cascades to all LearningPathCourse and LearningPathEnrollment records

### 4.3 Progress Calculation

```typescript
// GET /learning-paths/:id/progress
const requiredCourses = path.courses.filter(c => c.isRequired);
const completedRequired = requiredCourses.filter(c =>
  userEnrollments.find(e => e.courseId === c.courseId && e.completedAt !== null)
);
return {
  totalRequired: requiredCourses.length,
  completedRequired: completedRequired.length,
  progressPercent: Math.round((completedRequired.length / requiredCourses.length) * 100),
};
```

### 4.4 Enrollment Flow

```
Student → POST /learning-paths/:id/enroll
  ├── Verify path is published
  ├── Check not already enrolled (unique constraint)
  ├── Create LearningPathEnrollment record
  └── Auto-enroll student in all courses in path (calls EnrollmentsService.bulkEnroll)

Path completion (triggered by course completion event):
  ├── Re-check progress: all required courses completedAt !== null
  ├── Update LearningPathEnrollment.completedAt
  └── Issue certificate → set LearningPathEnrollment.certificateId
```

### 4.5 API Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/learning-paths` | Public | List published learning paths |
| GET | `/learning-paths/enrolled` | Auth | List paths the current student is enrolled in |
| GET | `/learning-paths/mine` | Auth (instructor) | List paths created by current instructor |
| GET | `/learning-paths/:id` | Public | Get path details with courses |
| GET | `/learning-paths/:id/progress` | Auth | Get progress for the current user |
| POST | `/learning-paths` | Auth (admin/instructor) | Create learning path |
| POST | `/learning-paths/:id/enroll` | Auth | Enroll student (auto-enroll all courses) |
| PUT | `/learning-paths/:id` | Auth (owner/admin) | Update path metadata |
| DELETE | `/learning-paths/:id` | Auth (owner/admin) | Delete path |
| POST | `/learning-paths/:id/courses` | Auth (owner/admin) | Add course to path |
| DELETE | `/learning-paths/:id/courses/:courseId` | Auth (owner/admin) | Remove course from path |
| PUT | `/learning-paths/:id/courses/reorder` | Auth (owner/admin) | Reorder courses in path |

---

## 5. Certificate Enhancement

Certificates are now auto-issued on completion, carry a human-readable number, and have a public verification page.

### Fields on Certificate

| Field | Type | Description |
|-------|------|-------------|
| `certificateNumber` | string? (unique) | Auto-generated `CERT-YYYYMMDD-XXXXX` identifier |
| `templateData` | JSON? | Template customization data used during PDF rendering |
| `pdfUrl` | string? | URL to the generated PDF file |

### Auto-Issue Flow (Course Completion)

```
All required lessons completed (100% progress)
  → CertificatesService.issueCertificate(userId, courseId)
  → Generate unique certificateNumber: CERT-YYYYMMDD-XXXXX
  → Render PDF: org name, cert number, QR code → verify URL
  → Store pdfUrl
  → Certificate row created/updated
```

### Auto-Issue Flow (Learning Path Completion)

```
All required path courses completed
  → CertificatesService.issuePathCertificate(userId, learningPathId)
  → Same certificateNumber + PDF generation flow
  → LearningPathEnrollment.certificateId set
```

### Public Verification

```
GET /certificates/verify/:certificateNumber  (no auth)
  → Returns: holderName, courseName/pathName, issuedAt, certificateNumber

Frontend: /verify/[certificateNumber]  (no auth required)
  → Displays certificate details and validity status
```

### Share Flow

Certificate detail page (`/certificates/[id]`) includes a copy-link button that copies the public verify URL to the clipboard.

---

*Document Last Updated: 2026-03-21*
