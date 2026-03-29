'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { paymentsApi } from '@/lib/api';

interface PaymentData {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  paymentCode: string;
  qrCodeUrl: string;
  expiresAt: string;
  completedAt: string | null;
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Expired'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

export default function PaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const countdown = useCountdown(payment?.expiresAt ?? null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await paymentsApi.getStatus(paymentId) as PaymentData;
      setPayment(data);

      if (data.status === 'completed') {
        setTimeout(() => router.push(`/courses/${data.courseSlug}?enrolled=true`), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  }, [paymentId, router]);

  // Initial load
  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Poll every 5 seconds while pending and not yet expired client-side
  useEffect(() => {
    if (!payment || payment.status !== 'pending') return;
    if (countdown === 'Expired') return;
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, [payment, fetchStatus, countdown]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">

        {/* Completed */}
        {payment?.status === 'completed' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500">Redirecting to your course…</p>
          </div>
        )}

        {/* Expired */}
        {payment?.status === 'expired' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Expired</h2>
            <p className="text-gray-500 mb-6">Your payment window has closed. Please try again.</p>
            <button
              onClick={() => router.push(`/courses/${payment.courseSlug}`)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Pending */}
        {payment?.status === 'pending' && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Scan to Pay</h2>
              <p className="text-gray-500 mt-1 text-sm">{payment.courseTitle}</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="p-3 border-2 border-gray-200 rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={payment.qrCodeUrl}
                  alt="VietQR Payment"
                  className="w-56 h-56 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>

            {/* Amount */}
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-blue-600">{formatVND(payment.amount)}</p>
            </div>

            {/* Payment code for manual transfer */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Transfer description</p>
              <p className="font-mono font-bold text-gray-900 tracking-wider">{payment.paymentCode}</p>
            </div>

            {/* Countdown */}
            {countdown && countdown !== 'Expired' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-center">
                <p className="text-sm text-yellow-800">
                  Expires in: <span className="font-bold">{countdown}</span>
                </p>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 mb-4">
              Open your banking app and scan the QR code or transfer with the code above
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Checking payment status…
            </div>
          </>
        )}

        <button
          onClick={() => router.push('/courses')}
          className="mt-4 w-full bg-gray-100 text-gray-600 py-3 rounded-xl hover:bg-gray-200 text-sm"
        >
          Cancel — Back to Courses
        </button>
      </div>
    </div>
  );
}
