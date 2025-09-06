'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PayPalSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('token');
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function capture() {
      if (!orderId) {
        setStatus('error');
        setMessage('Missing PayPal order ID.');
        return;
      }
      try {
        const res = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage('Payment successful! Thank you.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Payment failed.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Payment failed.');
      }
    }
    capture();
  }, [orderId]);

  return (
    <div className="max-w-lg mx-auto mt-20 p-8 bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">PayPal Payment</h1>
      {status === 'pending' && <p>Processing your payment...</p>}
      {status === 'success' && <p className="text-green-600">{message}</p>}
      {status === 'error' && <p className="text-red-600">{message}</p>}
    </div>
  );
} 