# Code Review: SePay Payment Integration

**Date:** 2026-03-03
**Scope:** Backend payments module + frontend payment pages
**Reviewer:** code-review agent

---

## Files Reviewed

- `backend/src/modules/payments/payments.service.ts` (194 lines)
- `backend/src/modules/payments/payments.controller.ts` (48 lines)
- `backend/src/modules/payments/dto/webhook.dto.ts`
- `backend/src/modules/payments/dto/create-payment.dto.ts`
- `backend/src/modules/payments/payments.module.ts`
- `frontend/app/(public)/payment/[paymentId]/page.tsx` (197 lines)
- `frontend/app/(public)/courses/[slug]/page.tsx` (lines 103–135, 244–265)
- `backend/src/config/app.config.ts`
- `backend/prisma/schema.prisma` (Payment model)

---

## Critical Issues

### 1. Webhook Signature Validation Is Dead Code (Critical — Security)

**File:** `payments.service.ts` lines 85–93

```typescript
const secret = this.config.get<string>('app.sepay.webhookSecret');
if (secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${payload.id}${payload.accountNumber}${payload.transferAmount}`)
    .digest('hex');
  // Note: Sepay doesn't always send a signature header — skip if secret not used
}
```

The HMAC is computed but **never compared to anything and never used to reject the request.** Any external actor that knows the QR payment code (it is displayed publicly on the payment page) can POST a fake webhook claiming that payment was completed. The signature block computes `expected` and then discards it — there is no rejection path.

The plan (phase-02-backend.md) explicitly required: `Validate webhook signature using HMAC-SHA256` and the error table says `Webhook signature invalid → 401 Unauthorized`. Neither was implemented.

**Impact:** Fraudulent enrollment without actual bank transfer. An attacker can:
1. Load the course page, click "Buy Now" to get a `paymentCode`.
2. POST to `/payments/webhook` with that `paymentCode` in `content`, any `transferAmount >= price`, `transferType: 1`.
3. Receive enrollment without payment.

---

### 2. Webhook Endpoint Has No IP Allowlist / Rate Limiting (Critical — Security)

**File:** `payments.controller.ts` line 29–32

The webhook endpoint is completely open. Beyond the broken signature check, there is no:
- IP allowlist for SePay servers
- Rate limiting
- Any form of request authentication

Combined with issue #1, this is a full payment bypass.

---

### 3. Race Condition: Delete + Create Without DB-Level Lock (High)

**File:** `payments.service.ts` lines 38–74

```typescript
// (1) find existing
const existing = await this.prisma.payment.findUnique({ where: { userId_courseId: ... } });
if (existing) {
  // ...
  await this.prisma.payment.delete({ where: { id: existing.id } });  // (2) delete
}
// (3) create new
const payment = await this.prisma.payment.create({ data: { ... } }); // (3) create
```

Steps (1)→(2)→(3) are not wrapped in a transaction. Two concurrent requests (e.g., user double-clicks "Buy Now") can both pass the `findUnique` check while both see the same existing payment, both attempt `delete` (one fails silently or throws), and then both attempt `create`, causing a unique-constraint error on `@@unique([userId, courseId])` that surfaces as a 500 to the user.

The fix is a Prisma `$transaction` wrapping steps (1)–(3), or using `upsert`/`updateMany` semantics.

---

### 4. Webhook: Amount Comparison Uses Float Arithmetic on Decimal (High)

**File:** `payments.service.ts` line 123

```typescript
if (payload.transferAmount < Number(payment.amount)) {
```

`payment.amount` is a `Prisma.Decimal`. `Number(payment.amount)` loses precision for values above ~15 digits. Vietnamese dong amounts are integers (no decimals), so this is unlikely to cause issues in practice, but if the schema is reused for other currencies it will silently miscompare. More critically, `payload.transferAmount` comes from the webhook DTO as a raw `number` — floating-point comparisons against a computed `Number(Decimal)` are imprecise.

Use `payment.amount.equals(new Prisma.Decimal(payload.transferAmount))` or integer comparison.

---

### 5. Payment QR Page: Polling Continues After Expiry (Medium)

**File:** `frontend/app/(public)/payment/[paymentId]/page.tsx` lines 73–77

```typescript
useEffect(() => {
  if (!payment || payment.status !== 'pending') return;
  const id = setInterval(fetchStatus, 5000);
  return () => clearInterval(id);
}, [payment, fetchStatus]);
```

When `countdown` reaches "Expired" client-side (timer hits zero), the status is still `pending` until the backend's cron runs `expireOldPayments`. The polling interval keeps running, making unnecessary API calls. The countdown UI shows "Expired" but the polling indicator still says "Checking payment status…", which is confusing. The page should stop polling when `countdown === 'Expired'`.

---

### 6. `formatPayment` Called With Missing `course` Relation (Medium)

**File:** `payments.service.ts` line 46

```typescript
if (existing.status === 'pending' && existing.expiresAt && existing.expiresAt > new Date()) {
  return this.formatPayment(existing, course.slug);  // <-- existing has no .course
}
```

`existing` comes from `prisma.payment.findUnique({ where: { userId_courseId: ... } })` — no `include: { course: ... }`. `formatPayment` accesses `payment.course?.title`, which will be `undefined`. `courseTitle` in the response will be `undefined` even though the course exists.

The same applies to the early-return path. The `findUnique` for `existing` should include `{ course: { select: { title: true } } }` or `course.title` should be passed separately.

---

### 7. PaymentCode Collision Probability (Medium)

**File:** `payments.service.ts` line 57

```typescript
const paymentCode = `LMS${courseId.replace(/-/g, '').substring(0, 8).toUpperCase()}${Date.now().toString().slice(-6)}`;
```

The code is 14 chars: 8 from courseId + 6 from last 6 digits of epoch ms. Two payments for the **same course** within the same millisecond produce identical `paymentCode`. With concurrent requests this is unlikely but not impossible. More importantly, two payments for the **same courseId** and close timestamp will share the first 8 chars — the last 6 digits (`slice(-6)`) cycle every ~16 minutes, so within any 16-minute window, repeated payment creation for the same course can collide.

There is no `@@unique` on `paymentCode` in the schema, so a collision would silently match the wrong payment record in the webhook handler.

A crypto-random suffix (e.g., `crypto.randomBytes(4).toString('hex').toUpperCase()`) is more reliable.

---

### 8. Course List Fetched to Find Course By Slug (Medium — Performance/Logic)

**File:** `frontend/app/(public)/courses/[slug]/page.tsx` lines 73–87

```typescript
const data = await coursesApi.list({ limit: 100 });
const courses = data as Course[];
const found = courses.find(c => c.slug === slug);
if (found) {
  const fullCourse = await coursesApi.get(found.id);
```

Two sequential API calls: fetch all courses (capped at 100), scan client-side for slug match, then fetch full course. If the course list exceeds 100 entries it silently fails to find the course. The backend should expose `GET /courses/:slug` or the list endpoint should support `?slug=` filtering. This is a pre-existing issue unrelated to the payment integration but it directly affects the "Buy Now" flow — if the course isn't in the first 100 results, the payment button never renders.

---

### 9. `buying` State Not Reset on Navigation (Low)

**File:** `frontend/app/(public)/courses/[slug]/page.tsx` lines 123–135

```typescript
const handleBuyNow = async () => {
  // ...
  try {
    setBuying(true);
    const payment = await paymentsApi.create(course!.id) as { id: string };
    router.push(`/payment/${payment.id}`);
  } catch (error: any) {
    alert(error.message || 'Failed to create payment');
    setBuying(false);   // only reset on error
  }
};
```

On success, `setBuying(false)` is never called before navigation. React will log a state update on an unmounted component warning in development. Minor, but if navigation is slow the button stays disabled.

---

## Positive Observations

- Enrollment+payment completion in a single `$transaction` — correct.
- Idempotent upsert for enrollment handles webhook retries correctly.
- `getPaymentStatus` scopes by `userId` — no IDOR.
- Expiry checked server-side in webhook handler, not just client-side.
- `transferType !== 1` guard correctly ignores outgoing transfers.
- Regex `LMS[A-Z0-9]{14}` is specific enough to reduce false matches in transfer descriptions.

---

## Summary Table

| # | Severity | Issue |
|---|----------|-------|
| 1 | Critical | Webhook signature computed but never verified — full payment bypass |
| 2 | Critical | Webhook endpoint open to anyone with no IP filtering or auth |
| 3 | High | Race condition in delete+recreate payment flow (no transaction) |
| 4 | High | Float comparison for Decimal amount in webhook |
| 5 | Medium | Polling continues client-side after countdown expires |
| 6 | Medium | `course` relation missing on `existing` payment — courseTitle is undefined |
| 7 | Medium | paymentCode collision risk for same course within 16-min window |
| 8 | Medium | Course list capped at 100 breaks buy flow for large catalogs |
| 9 | Low | `buying` state not reset on successful navigation |

---

## Recommended Actions (Priority Order)

1. **Fix #1 immediately.** The signature block must either extract the header and compare, or reject all webhook calls when `SEPAY_WEBHOOK_SECRET` is set but no signature is provided. At minimum add `if (computedHmac !== receivedHmac) throw new UnauthorizedException()`.

2. **Fix #2.** Add IP allowlist middleware or at minimum rate-limit the `/payments/webhook` endpoint.

3. **Fix #3.** Wrap the find→delete→create sequence in `this.prisma.$transaction(...)`.

4. **Fix #6.** Include `{ course: { select: { title: true } } }` in the `findUnique` for `existing`, or pass `course.title` directly to `formatPayment`.

5. **Fix #7.** Replace `Date.now().slice(-6)` with `crypto.randomBytes(4).toString('hex').toUpperCase()` and add `@@unique([paymentCode])` to the schema.

6. **Fix #4.** Use `Prisma.Decimal` for the amount comparison.

7. **Fix #5.** Stop polling when local countdown reaches zero.

---

## Unresolved Questions

1. Does SePay actually send a signature header in its webhook payload? The research doc (`01-sepay-api-report.md`) does not mention one. If SePay sends the secret as a bearer token in the `Authorization` header instead of a body field, the current HMAC approach (even if wired up) uses the wrong mechanism. Need to confirm SePay's actual webhook authentication mechanism.

2. The plan specified a `payments.guard.ts` file — it was never created. Was the guard replaced by the HMAC validation approach, or is it still intended?

3. `webhookData: payload as any` stores the full raw webhook payload in a JSON column. If SePay adds PII to their payload in the future, this becomes a data compliance issue. Is there a scrubbing policy?
