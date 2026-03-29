# Phase 3: Frontend UI Implementation

## Status: COMPLETED ✓

Implemented: `frontend/lib/api.ts` (paymentsApi), `frontend/app/(public)/payment/[paymentId]/page.tsx`, `frontend/app/(public)/courses/[slug]/page.tsx` (Buy Now + VND pricing)

## Overview

Implement frontend components for course pricing display and payment flow with Sepay QR codes.

## Files to Create/Modify

```
frontend/
├── lib/
│   └── api.ts              # Add paymentsApi
├── app/(student)/
│   └── courses/
│       └── [slug]/
│           └── page.tsx    # Modify - add payment button
├── app/(student)/
│   └── payment/
│       └── [paymentId]/
│           └── page.tsx   # NEW - payment QR display
```

## API Updates

Add to `frontend/lib/api.ts`:

```typescript
// Payment APIs
export const paymentsApi = {
  create: (courseId: string) =>
    fetchApi('/payments', { method: 'POST', body: JSON.stringify({ courseId }) }),

  getStatus: (paymentId: string) =>
    fetchApi(`/payments/${paymentId}/status`),

  getMyPayments: () =>
    fetchApi('/payments/my'),
};

export interface Payment {
  id: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  qrCodeUrl: string;
  expiresAt: string;
  createdAt: string;
}
```

## Course Detail Page Updates

Modify `frontend/app/(student)/courses/[slug]/page.tsx`:

```tsx
// Add payment state
const [showPayment, setShowPayment] = useState(false);
const [payment, setPayment] = useState<Payment | null>(null);

// Handle buy now button
const handleBuyNow = async () => {
  if (!user) {
    router.push('/auth/login');
    return;
  }

  try {
    const paymentData = await paymentsApi.create(course.id);
    setPayment(paymentData as Payment);
    setShowPayment(true);
  } catch (error: any) {
    alert(error.message || 'Failed to create payment');
  }
};

// Update the paid course button section
{!enrolled && !course.is_free && (
  <div>
    <div className="text-center mb-4">
      <span className="text-3xl font-bold">
        {course.price.toLocaleString('vi-VN')} VND
      </span>
    </div>
    <button
      onClick={handleBuyNow}
      disabled={buying}
      className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
    >
      {buying ? 'Processing...' : 'Buy Now'}
    </button>
  </div>
)}
```

## Payment Page Component

Create `frontend/app/(student)/payment/[paymentId]/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { paymentsApi } from '@/lib/api';

interface PaymentData {
  id: string;
  courseTitle: string;
  amount: number;
  status: string;
  qrCodeUrl: string;
  expiresAt: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentId = params.paymentId as string;

  useEffect(() => {
    loadPayment();
    // Poll for status changes
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      const data = await paymentsApi.getStatus(paymentId);
      setPayment(data as PaymentData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const data = await paymentsApi.getStatus(paymentId);
      const paymentData = data as PaymentData;

      if (paymentData.status === 'completed') {
        // Redirect to course page
        router.push(`/courses/${paymentData.courseSlug}?enrolled=true`);
      } else if (paymentData.status === 'expired') {
        setError('Payment expired. Please try again.');
      }
    } catch (err) {
      console.error('Failed to check payment status');
    }
  };

  const getTimeRemaining = () => {
    if (!payment?.expiresAt) return '';
    const diff = new Date(payment.expiresAt).getTime() - Date.now();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Payment</h1>

        {payment?.status === 'pending' && (
          <>
            <p className="text-center text-gray-600 mb-4">
              Scan QR code to pay for course:
            </p>
            <p className="text-center font-semibold mb-4">{payment.courseTitle}</p>

            <div className="flex justify-center mb-4">
              <img
                src={payment.qrCodeUrl}
                alt="Payment QR Code"
                className="w-64 h-64"
              />
            </div>

            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-blue-600">
                {payment.amount.toLocaleString('vi-VN')} VND
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-center text-sm text-yellow-800">
                Expires in: <span className="font-bold">{getTimeRemaining()}</span>
              </p>
            </div>

            <p className="text-center text-sm text-gray-500">
              Open your banking app and scan the QR code
            </p>
          </>
        )}

        {payment?.status === 'completed' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-green-600">Payment Successful!</p>
            <p className="text-gray-600 mt-2">Redirecting to course...</p>
          </div>
        )}

        <button
          onClick={() => router.push('/courses')}
          className="mt-6 w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
```

## Styling Guidelines

- Use Tailwind CSS for all styling (consistent with existing codebase)
- Primary color: Blue-600 (#2563EB)
- Payment status colors:
  - Pending: Yellow-600
  - Completed: Green-600
  - Failed/Expired: Red-600
- Use Vietnamese locale for currency formatting

## Loading States

```tsx
// Button loading state
<button disabled={processing} className="...">
  {processing ? (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-5 w-5" ... />
      Processing...
    </span>
  ) : (
    'Buy Now'
  )}
</button>
```

## Error Display

```tsx
// Toast or alert for errors
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
    {error}
  </div>
)}
```

## Polling Strategy

- Poll payment status every 5 seconds when on payment page
- Stop polling when status is completed or expired
- Redirect to course page on successful payment

## Alternative: WebSocket (Future Enhancement)

For production, consider using WebSocket for real-time payment updates instead of polling.
