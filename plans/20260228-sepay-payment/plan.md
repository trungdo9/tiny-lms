# Sepay Payment Gateway Integration Plan

## Overview

This plan outlines the integration of Sepay payment gateway into Tiny LMS for processing course payments. Sepay monitors bank accounts and confirms transactions via webhooks, enabling QR code-based payments.

## Scope

- **Payment Model**: Store payment records with status tracking
- **Backend API**: Create payment, webhook handler, status check endpoints
- **Frontend UI**: Course pricing display, payment QR code, payment flow
- **Enrollment Logic**: Free courses direct enrollment, paid courses require payment

## Architecture

```
User → Course Page → [Free?] → Direct Enroll
                     └→ [Paid] → Create Payment → QR Display → Sepay Webhook → Enrollment
```

## Key Features

1. **Course Pricing**: Display price in VND, support free/paid courses
2. **QR Payment**: Generate Sepay QR codes for payment
3. **Webhook Handling**: Process Sepay transaction notifications
4. **Idempotency**: Prevent duplicate enrollments from webhook retries

## Implementation Phases

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Database schema changes (Payment model) | COMPLETED ✓ |
| Phase 2 | Backend payment module (service, controller, webhook) | COMPLETED ✓ |
| Phase 3 | Frontend UI (course pricing, payment QR display) | COMPLETED ✓ |
| Phase 4 | Enrollment logic (free vs paid flow) | COMPLETED ✓ |

## Configuration Required

```
SEPAY_BANK_ACCOUNT=your_bank_account
SEPAY_BANK_ID=your_bank_id
SEPAY_WEBHOOK_SECRET=your_webhook_secret
```

## Estimated Timeline

- Phase 1: 1 day (database)
- Phase 2: 2-3 days (backend)
- Phase 3: 1-2 days (frontend)
- Phase 4: 1 day (enrollment logic)

Total: 5-7 days

## Completion Summary

All 4 phases successfully implemented as of 2026-03-03:

1. **Phase 1 - Database**: Supabase migration 007_payments.sql creates Payment table with Prisma model
2. **Phase 2 - Backend**: Complete payments module with service, controller, DTOs at `backend/src/modules/payments/`
3. **Phase 3 - Frontend**: Payment UI with paymentsApi client, payment QR display page, and Buy Now button with VND pricing
4. **Phase 4 - Enrollment**: HTTP 402 Payment Required response for paid courses, automatic enrollment on successful payment

## Risks & Considerations

- Webhook security (signature validation required)
- Idempotency to handle duplicate webhook calls
- Payment timeout handling (expire after X minutes)
- No refund API - manual process required
