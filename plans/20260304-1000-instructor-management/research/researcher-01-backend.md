# Instructor Management: Backend Research & Recommendations

## Executive Summary
Transitioning from single-instructor to co-instructor model requires: explicit join table (`CourseInstructor`), dual permission checks (primary + co-instructor list), managed migration strategy, and consistent API design. Recommendation: use explicit join model for data integrity and query flexibility.

---

## 1. Prisma Schema Changes (Explicit Join Model)

**Rationale:** Explicit join models provide better control over attributes (e.g., role/permissions per instructor), query flexibility, and migration safety vs implicit relations.

**Recommended Schema:**
```prisma
model Course {
  id            String   @id @default(uuid()) @db.Uuid
  instructorId  String   @map("instructor_id") @db.Uuid  // Keep for primary instructor
  title         String
  // ... other fields

  instructor    Profile  @relation("PrimaryInstructor", fields: [instructorId], references: [id])
  instructors   CourseInstructor[]  // All instructors (including primary)

  @@schema("public")
  @@map("courses")
}

model Profile {
  id       String   @id @db.Uuid
  email    String?  @unique
  // ... other fields

  coursesAsPrimary    Course[]  @relation("PrimaryInstructor")
  courseInstructors   CourseInstructor[]

  @@schema("public")
  @@map("profiles")
}

model CourseInstructor {
  id          String   @id @default(uuid()) @db.Uuid
  courseId    String   @map("course_id") @db.Uuid
  profileId   String   @map("profile_id") @db.Uuid
  role        String   @default("co-instructor")  // "primary", "co-instructor", custom roles
  addedAt     DateTime @default(now()) @map("added_at")
  addedBy     String   @map("added_by") @db.Uuid  // who added this instructor

  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@unique([courseId, profileId])
  @@index([courseId])
  @@index([profileId])
  @@schema("public")
  @@map("course_instructors")
}
```

---

## 2. Ownership Check Strategy (Authorization)

**Current Pattern:** Sections service uses `getCourseForUpdate()` (inline check: `course.instructor_id !== userId`). Pattern exists in courses.service.ts lines 183, 217, 269.

**Recommended Update:**
```typescript
// Create reusable helper in a shared authorization service
async canManageCourse(courseId: string, userId: string, userRole: string): Promise<boolean> {
  if (userRole === 'admin') return true;

  // Check if user is primary instructor OR co-instructor
  const courseInstructor = await this.prisma.courseInstructor.findFirst({
    where: {
      courseId,
      profileId: userId,
      role: { in: ['primary', 'co-instructor'] }  // add custom roles as needed
    }
  });

  return !!courseInstructor;
}
```

**Replace all ownership checks:**
- courses.service.ts lines 183, 217, 269: `course.instructor_id !== userId` → `!await this.canManageCourse(courseId, userId, userRole)`
- sections.service.ts line 144: same change
- Similar checks in lessons, quizzes, etc.

---

## 3. Migration Strategy (Zero Downtime)

**Phase 1 - Schema Preparation:**
```sql
-- 1. Create new join table
CREATE TABLE course_instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR DEFAULT 'co-instructor',
  added_at TIMESTAMP DEFAULT NOW(),
  added_by UUID NOT NULL REFERENCES profiles(id),
  UNIQUE(course_id, profile_id)
);

CREATE INDEX idx_course_instructors_course ON course_instructors(course_id);
CREATE INDEX idx_course_instructors_profile ON course_instructors(profile_id);
```

**Phase 2 - Data Migration:**
```sql
-- Populate join table from existing instructor_id
INSERT INTO course_instructors (course_id, profile_id, role, added_at, added_by)
SELECT id, instructor_id, 'primary', created_at, instructor_id FROM courses
ON CONFLICT DO NOTHING;
```

**Phase 3 - Backward Compatibility:**
- Keep `instructor_id` field; don't delete it yet
- Update Prisma client to sync writes: when primary instructor changes, update both `instructorId` and `CourseInstructor` table
- Maintain `findInstructorCourses()` query unchanged (uses `instructor_id`)

**Phase 4 - Cutover (after testing):**
- Migrate to explicit join table reads
- Drop `instructor_id` field (post 2-3 release cycles)

---

## 4. API Endpoint Design

**Instructor Assignment Endpoints:**

```
POST /courses/:id/instructors
├─ Body: { userId: string, role?: string }
├─ Auth: requires course edit permission (primary OR co-instructor)
├─ Response: { id, courseId, profileId, role, addedAt }
├─ Logic: check user not already instructor, verify profileId exists

GET /courses/:id/instructors
├─ Auth: authenticated (any role can view)
├─ Response: [{ id, profileId, email, fullName, role, addedAt }]
├─ Include: profile details (name, avatar) via join

DELETE /courses/:id/instructors/:userId
├─ Auth: requires course edit + cannot remove self if only primary
├─ Logic: prevent removing last instructor; handle role transitions
├─ Response: { success: true } | 409 Conflict if last instructor

PATCH /courses/:id/instructors/:userId
├─ Body: { role: string }
├─ Auth: requires course edit permission
├─ Logic: update role; ensure primary always exists
├─ Response: updated instructor record
```

**Database Query Example:**
```typescript
// Fetch instructors with profile info
const instructors = await this.prisma.courseInstructor.findMany({
  where: { courseId },
  select: {
    id: true,
    role: true,
    addedAt: true,
    profile: { select: { id: true, email: true, fullName: true, avatarUrl: true } }
  },
  orderBy: [{ role: 'desc' }, { addedAt: 'asc' }]
});
```

---

## 5. Backward Compatibility Map

| Feature | Current | Migration | Post-Migration |
|---------|---------|-----------|-----------------|
| **instructor field in responses** | uses `course.instructor_id` | dual-populate both | uses `course.instructors[0]` (primary) |
| **findInstructorCourses()** | filters by `instructor_id` | works unchanged | migrate to join table query |
| **Permission checks** | `course.instructor_id !== userId` | wrapped in helper | uses `canManageCourse()` |
| **Create course** | sets `instructorId` | auto-creates CourseInstructor row | explicit insert to join table |
| **API responses** | single `instructor` object | add `instructors[]` array | keep both for 2-3 cycles |

---

## 6. Implementation Notes

**Recommendations:**
1. Create dedicated `InstructorAuthorizationService` with `canManageCourse()`, `isInstructor()`, etc.
2. Add Prisma middleware to auto-sync `instructorId` ↔ `CourseInstructor` during transition
3. Test with existing integration tests before cutover
4. Use feature flag for read-side: `USE_EXPLICIT_INSTRUCTOR_MODEL=true` to ease rollback
5. Supabase client queries in courses.service.ts will need dual queries during phase 2-3

---

## 7. Unresolved Questions

1. Should primary instructor always exist, or allow courses without one? (impacts cascade delete strategy)
2. Do co-instructors inherit all permissions of primary, or are there role-based restrictions? (affects `canManageCourse()` implementation)
3. Should invite-based flow exist (pending acceptance) vs direct assignment?
4. What happens when primary instructor is removed? Auto-promote oldest co-instructor or require explicit replacement?
5. Should audit trail track who added/removed instructors? (role of `added_by` field)
