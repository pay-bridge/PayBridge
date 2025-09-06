import React, { useState } from 'react';

const isPayPalEnabled = !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET;

interface PayPalCheckoutButtonProps {
  amount: string;
  currency?: string;
  returnUrl: string;
  cancelUrl: string;
}

const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({ amount, currency = 'USD', returnUrl, cancelUrl }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isPayPalEnabled) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, returnUrl, cancelUrl })
      });
      const data = await res.json();
      if (data && data.links) {
        const approveLink = data.links.find((l: any) => l.rel === 'approve');
        if (approveLink) {
          window.location.href = approveLink.href;
          return;
        }
      }
      setError('Could not initiate PayPal checkout.');
    } catch (err: any) {
      setError(err.message || 'Error initiating PayPal checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCheckout} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      {loading ? 'Redirecting...' : 'Pay with PayPal'}
    </button>
  );
};

export default PayPalCheckoutButton; 