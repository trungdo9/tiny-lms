# Phase 4: Integration & Usage

## Overview

**Date:** 2026-02-28
**Priority:** Medium
**Status:** Pending

Integrate email system into existing modules.

## Context

- Related: Auth, Enrollments, Certificates modules
- Dependencies: Phase 1, 2, 3

## Integration Points

### 1. Auth Module (Register)
- Send welcome email on registration

### 2. Enrollment Module
- Send enrollment confirmation email
- Send course completion email

### 3. Certificate Module
- Send certificate ready email

### 4. Quiz Module
- Send quiz result email (optional)

## Usage Example

```typescript
// In auth.service.ts
async register(email: string, password: string, fullName: string) {
  // ... existing logic

  // Send welcome email
  await this.emailService.sendTemplate('welcome', email, {
    name: fullName,
    email: email,
  });
}

// In enrollment.service.ts
async enroll(userId: string, courseId: string) {
  // ... existing logic

  const course = await this.getCourse(courseId);
  await this.emailService.sendTemplate('enrollment', user.email, {
    name: user.fullName,
    courseName: course.title,
  });
}
```

## Configuration for Triggers

```typescript
// Events that trigger emails:
// - user.registered -> welcome email
// - course.enrolled -> enrollment email
// - certificate.generated -> certificate email
```

## Implementation Steps

1. Update AuthService to send welcome email
2. Update EnrollmentService to send enrollment email
3. Update CertificateService to send certificate email
4. Add email sending to notification triggers

## Success Criteria

- [ ] Welcome email on registration
- [ ] Enrollment email on course join
- [ ] Certificate email when generated

## Optional: Queue System

For high volume, add queue:
- Use Bull queue or NestJS CQRS
- Process emails asynchronously
- Retry failed emails

## Risk Assessment

- Email sending can slow down requests - consider queue
- Rate limiting from email provider
