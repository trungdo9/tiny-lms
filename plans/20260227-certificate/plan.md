# Plan: Certificate Generation System

**Date:** 2026-02-27

---

## Requirements

- Generate certificate when student completes course (100% lessons OR pass quiz)
- Students can view and download certificates
- Certificate includes: student name, course name, completion date, instructor signature

---

## Database Schema

```prisma
model Certificate {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  courseId    String   @map("course_id") @db.Uuid
  issuedAt    DateTime @default(now()) @map("issued_at")

  user        Profile  @relation(fields: [userId], references: [id])
  course      Course   @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}
```

---

## Implementation Steps

### Step 1: Add Certificate Model
- Add Certificate model to Prisma schema
- Run migration

### Step 2: Backend API
- Create CertificatesController
- POST /certificates/issue/:courseId - Check completion and issue certificate
- GET /certificates/my - List user certificates
- GET /certificates/:id - Get certificate details

### Step 3: Completion Check Logic
- Check if user has 100% lesson progress OR passed quiz with passScore
- Only issue once (unique constraint)

### Step 4: PDF Generation
- Use @pdfkit/pdfkit for server-side PDF
- Template: Course name, student name, date, instructor name

### Step 5: Frontend
- Add certificate badge on course card (if completed)
- My Certificates page: /certificates
- Certificate view page with download

---

## Files to Create/Modify

1. `backend/prisma/schema.prisma` - Add Certificate model
2. `backend/src/modules/certificates/` - New module (controller, service, module)
3. `backend/src/app.module.ts` - Import CertificatesModule
4. `frontend/app/certificates/page.tsx` - Certificate list
5. `frontend/app/certificates/[id]/page.tsx` - Certificate view/download
6. `frontend/app/(student)/courses/[slug]/page.tsx` - Show certificate badge

---

## Success Criteria

- [x] Certificate issued when 100% lessons completed
- [x] Certificate issued when passed quiz with passScore
- [x] Certificate can be viewed and downloaded as PDF
- [x] My Certificates page shows all user certificates
- [x] Prevent duplicate certificate issuance

---

## Status: ✅ COMPLETED

**Commit:** Certificate module implemented
