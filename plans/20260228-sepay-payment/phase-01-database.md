# Phase 1: Database Schema Changes

## Status: COMPLETED ✓

Implemented: `supabase/migrations/007_payments.sql` + Prisma Payment model

## Payment Model

Add a new `Payment` model to track payment transactions.

```prisma
model Payment {
  id              String    @id @default(uuid()) @db.Uuid
  userId          String    @map("user_id") @db.Uuid
  courseId        String    @map("course_id") @db.Uuid
  amount          Decimal   @db.Decimal(10, 2)
  currency        String    @default("VND")
  status          String    @default("pending") // pending, completed, failed, expired, refunded
  method           String?   // bank_transfer, qr_code
  transactionId   String?   @map("transaction_id") // Sepay transaction ID
  paymentCode     String?   @map("payment_code") // Sepay payment code
  qrCodeUrl       String?   @map("qr_code_url") // Generated QR code URL
  webhookData     Json?     @map("webhook_data") // Raw webhook payload
  completedAt     DateTime? @map("completed_at")
  expiresAt       DateTime? @map("expires_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  user            Profile   @relation(fields: [userId], references: [id])
  course          Course    @relation(fields: [courseId], references: [id])

  @@unique([transactionId])
  @@unique([userId, courseId])
  @@index([status])
  @@index([expiresAt])
  @@schema("public")
  @@map("payments")
}
```

## Existing Course Model (Reference)

The existing `Course` model already has the required fields:

```prisma
model Course {
  isFree  Boolean   @default(false) @map("is_free")
  price   Decimal?  @db.Decimal(10, 2)
  // ... existing fields
}
```

## Migration Commands

```bash
# Generate migration
npx prisma migrate dev --name add_payments_table

# Apply migration
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## Enrollment Model (Reference)

Existing `Enrollment` model for reference:

```prisma
model Enrollment {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @map("user_id") @db.Uuid
  courseId    String    @map("course_id") @db.Uuid
  enrolledAt  DateTime  @default(now()) @map("enrolled_at")
  completedAt DateTime? @map("completed_at")

  // Relations
  user   Profile @relation(fields: [userId], references: [id])
  course Course  @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}
```

## Index Considerations

- `userId + courseId` unique index ensures one payment per course per user
- `transactionId` unique index prevents duplicate webhook processing
- `status` index for filtering payments
- `expiresAt` index for cleaning up expired pending payments

## Rollback Strategy

If rollback is needed:
```bash
npx prisma migrate rollback
```

This will drop the `payments` table.
