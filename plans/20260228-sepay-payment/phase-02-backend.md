# Phase 2: Backend Payment Module

## Status: COMPLETED ✓

Implemented: `backend/src/modules/payments/` (service, controller, module, DTOs)

## Overview

Create NestJS module for handling Sepay payments, including:
- Payment creation with QR code generation
- Webhook endpoint for Sepay notifications
- Payment status checking
- Automatic enrollment on successful payment

## Configuration

Add to `backend/.env`:

```env
# Sepay Configuration
SEPAY_BANK_ACCOUNT=970436
SEPAY_BANK_ID=970436
SEPAY_WEBHOOK_SECRET=your_webhook_secret_here
SEPAY_API_URL=https://api.sepay.vn
SEPAY_PAYMENT_TIMEOUT_MINUTES=15
```

Update `backend/src/config/app.config.ts`:

```typescript
export default registerAs('app', () => ({
  // ... existing config
  sepay: {
    bankAccount: process.env.SEPAY_BANK_ACCOUNT || '',
    bankId: process.env.SEPAY_BANK_ID || '',
    webhookSecret: process.env.SEPAY_WEBHOOK_SECRET || '',
    apiUrl: process.env.SEPAY_API_URL || 'https://api.sepay.vn',
    paymentTimeoutMinutes: parseInt(process.env.SEPAY_PAYMENT_TIMEOUT_MINUTES || '15'),
  },
}));
```

## Module Structure

```
backend/src/modules/payments/
├── payments.module.ts
├── payments.controller.ts
├── payments.service.ts
├── payments.guard.ts
├── dto/
│   ├── create-payment.dto.ts
│   └── webhook.dto.ts
└── interfaces/
    └── sepay.interface.ts
```

## PaymentService

Key methods:

```typescript
@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private enrollmentsService: EnrollmentsService,
    private config: ConfigService,
  ) {}

  // Create new payment and generate QR code
  async createPayment(userId: string, courseId: string): Promise<PaymentResponse>

  // Process webhook from Sepay
  async processWebhook(payload: WebhookPayload): Promise<WebhookResponse>

  // Check payment status
  async getPaymentStatus(paymentId: string, userId: string): Promise<PaymentStatus>

  // Get payment by transaction ID (for webhook)
  async getPaymentByTransactionId(transactionId: string): Promise<Payment | null>

  // Get user's payments
  async getUserPayments(userId: string): Promise<Payment[]>

  // Expire pending payments
  async expireOldPayments(): Promise<void>
}
```

## PaymentController

Endpoints:

```typescript
@Controller('payments')
export class PaymentsController {
  // POST /payments - Create payment for course
  @Post()
  @UseGuards(AuthGuard)
  async createPayment(
    @Body() dto: CreatePaymentDto,
    @Req() req,
  ): Promise<PaymentResponse>

  // POST /payments/webhook - Sepay webhook endpoint
  @Post('webhook')
  async handleWebhook(@Body() payload: WebhookPayload): Promise<WebhookResponse>

  // GET /payments/:id/status - Check payment status
  @Get(':id/status')
  @UseGuards(AuthGuard)
  async getStatus(
    @Param('id') paymentId: string,
    @Req() req,
  ): Promise<PaymentStatus>

  // GET /payments/my - Get user's payments
  @Get('my')
  @UseGuards(AuthGuard)
  async getMyPayments(@Req() req): Promise<Payment[]>
}
```

## DTOs

```typescript
// create-payment.dto.ts
export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}

// webhook.dto.ts
export class WebhookPayload {
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsString()
  @IsNotEmpty()
  account_number: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  transaction_date: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}
```

## QR Code Generation

Sepay QR code format:
```
https://qr.sepay.vn/img?bank=${bankId}&account=${account}&amount=${amount}&template=${template}
```

Example:
```
https://qr.sepay.vn/img?bank=970436&account=1234567890&amount=500000&template=compact
```

## Webhook Security

1. Validate webhook signature using HMAC-SHA256
2. Use transaction ID for idempotency
3. Verify amount matches expected payment

```typescript
// Validate webhook signature
private validateSignature(payload: WebhookPayload, signature: string): boolean {
  const secret = this.config.get('app.sepay.webhookSecret');
  const data = `${payload.transaction_id}${payload.account_number}${payload.amount}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
  return expectedSignature === signature;
}
```

## Idempotency Handling

```typescript
async processWebhook(payload: WebhookPayload): Promise<WebhookResponse> {
  // Check if already processed
  const existing = await this.getPaymentByTransactionId(payload.transaction_id);
  if (existing && existing.status === 'completed') {
    return { success: true, message: 'Already processed' };
  }

  // Process payment...
}
```

## Payment Flow

```
1. User clicks "Buy Now"
2. Backend creates Payment (status: pending)
3. Backend generates QR code URL
4. Frontend displays QR code
5. User scans QR and pays via banking app
6. Sepay sends webhook to backend
7. Backend validates webhook signature
8. Backend updates Payment status to completed
9. Backend creates Enrollment record
10. Frontend polls or receives success notification
```

## Error Handling

| Scenario | Response |
|----------|----------|
| Course not found | 404 Not Found |
| Course is free | 400 Bad Request (use enrollment endpoint) |
| Already enrolled | 400 Bad Request |
| Already paid | 200 OK (return existing payment) |
| Webhook signature invalid | 401 Unauthorized |
| Duplicate transaction | 200 OK (idempotent) |
| Payment amount mismatch | 400 Bad Request |

## Testing Approach

```bash
# Unit tests
npm run test -- payments.service

# E2E tests
npm run test:e2e -- payments

# Manual webhook testing
curl -X POST http://localhost:3001/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"transaction_id":"test123","account_number":"123456","amount":500000,"transaction_date":"2024-01-01","signature":"..."}'
```
