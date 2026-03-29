# Phase 4: Enrollment Logic

## Status: COMPLETED ✓

Implemented: `backend/src/modules/enrollments/enrollments.service.ts` blocks paid courses with HTTP 402

## Overview

Implement enrollment logic distinguishing between free and paid courses.

## Current Enrollment Flow (Existing)

The existing `EnrollmentsService.enroll()` method:
- Checks if course exists and is published
- Checks if user is already enrolled
- Creates enrollment directly

This needs to be modified to:
1. Check if course is free or paid
2. For free courses: direct enrollment
3. For paid courses: require payment completion

## Modified EnrollmentService

```typescript
// enrollments.service.ts modifications

async enroll(courseId: string, userId: string) {
  // 1. Check if course exists and is published
  const course = await this.getCourse(courseId);
  if (!course) throw new NotFoundException('Course not found');
  if (course.status !== 'published') {
    throw new BadRequestException('Cannot enroll in an unpublished course');
  }

  // 2. Check if already enrolled
  const existingEnrollment = await this.checkExistingEnrollment(userId, courseId);
  if (existingEnrollment) {
    throw new BadRequestException('Already enrolled in this course');
  }

  // 3. Handle based on course type
  if (course.isFree) {
    // Free course: direct enrollment
    return this.createEnrollment(userId, courseId);
  } else {
    // Paid course: require payment
    throw new PaymentRequiredException(
      'Payment required for this course',
      { courseId, amount: course.price }
    );
  }
}
```

## New PaymentRequiredException

```typescript
// exceptions/payment-required.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentRequiredException extends HttpException {
  constructor(message: string, private metadata: { courseId: string; amount: number }) {
    super(
      {
        message,
        error: 'Payment Required',
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        ...metadata,
      },
      HttpStatus.PAYMENT_REQUIRED
    );
  }
}
```

## Updated EnrollmentsController

```typescript
// enrollments.controller.ts

@Post(':courseId/enroll')
@UseGuards(AuthGuard)
async enroll(
  @Param('courseId') courseId: string,
  @Req() req,
) {
  try {
    const result = await this.enrollmentsService.enroll(courseId, req.user.id);
    return result;
  } catch (error) {
    if (error instanceof PaymentRequiredException) {
      // Return payment required info so frontend can redirect
      return error.getResponse();
    }
    throw error;
  }
}
```

## Frontend Enrollment Flow

```typescript
// In course detail page

const handleEnroll = async () => {
  if (!user) {
    router.push('/auth/login');
    return;
  }

  try {
    setEnrolling(true);
    const result = await enrollmentsApi.enroll(course!.id);

    // Check if payment is required
    if (result.statusCode === 402 || result.error === 'Payment Required') {
      // Redirect to payment
      router.push(`/payment/create?courseId=${course!.id}`);
      return;
    }

    setEnrolled(true);
    // Show success and reload progress
  } catch (error: any) {
    const response = error.response;

    // Handle payment required
    if (response?.error === 'Payment Required') {
      router.push(`/payment/create?courseId=${course!.id}`);
      return;
    }

    alert(error.message || 'Failed to enroll');
  } finally {
    setEnrolling(false);
  }
};
```

## Payment Flow Integration

After payment is completed via webhook:

```typescript
// In payments.service.ts - after webhook confirms payment

async completeEnrollment(payment: Payment) {
  // Create enrollment
  const enrollment = await this.prisma.enrollment.create({
    data: {
      userId: payment.userId,
      courseId: payment.courseId,
    },
  });

  // Optionally send notification
  await this.notificationService.create({
    userId: payment.userId,
    type: 'enrollment',
    title: 'Enrollment Confirmed',
    message: `You have been enrolled in course successfully!`,
    data: { courseId: payment.courseId },
  });

  return enrollment;
}
```

## Transaction Safety

Use database transaction for payment completion:

```typescript
async processSuccessfulPayment(payment: Payment, webhookData: any) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Update payment status
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        webhookData,
      },
    });

    // 2. Create enrollment
    await tx.enrollment.create({
      data: {
        userId: payment.userId,
        courseId: payment.courseId,
      },
    });

    return updatedPayment;
  });
}
```

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Payment fails | Keep payment as failed, user can retry |
| Payment expires | Set payment status to expired |
| Duplicate webhook | Idempotency check via transactionId |
| User already enrolled | Return existing enrollment |
| Course deleted after payment | Refund required (manual) |
| Refund requested | Manual process (Sepay no refund API) |

## Testing Scenarios

```typescript
describe('Enrollment Logic', () => {
  it('should allow free course enrollment', async () => {
    // Create free course
    // Call enroll endpoint
    // Expect enrollment created
  });

  it('should require payment for paid course', async () => {
    // Create paid course
    // Call enroll endpoint
    // Expect PaymentRequiredException
  });

  it('should create enrollment after payment', async () => {
    // Create payment
    // Simulate webhook
    // Check enrollment created
  });

  it('should not double enroll on duplicate webhook', async () => {
    // Same webhook sent twice
    // Should only create one enrollment
  });
});
```

## API Response Examples

### Free Course Enrollment Success
```json
{
  "id": "enrollment-uuid",
  "userId": "user-uuid",
  "courseId": "course-uuid",
  "enrolledAt": "2024-01-15T10:00:00Z"
}
```

### Paid Course - Payment Required
```json
{
  "message": "Payment required for this course",
  "error": "Payment Required",
  "statusCode": 402,
  "courseId": "course-uuid",
  "amount": 500000
}
```

### Payment Completed
```json
{
  "id": "payment-uuid",
  "status": "completed",
  "enrollment": {
    "id": "enrollment-uuid"
  }
}
```
