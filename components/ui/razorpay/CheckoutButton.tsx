// CheckoutButton.tsx

import { useState } from 'react';
import { initiateRazorpayPayment } from '@/utils/razorpay/client';

const CheckoutButton = ({ priceId, redirectPath }: { priceId: string; redirectPath?: string }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, redirectPath })
      });
      const data = await res.json();

      if (data.orderId) {
        const options = {
          key: data.key, // Enter the Key ID generated from the Dashboard
          amount: /* amount from price */, // Amount is in currency subunits. Default currency is INR.
          currency: 'INR',
          name: 'PayBridge',
          description: 'Subscription Payment',
          order_id: data.orderId, // This is a sample Order ID. Pass the `id` obtained in the response of createOrder.
          handler: async (response: any) => {
            // Verify payment on the server
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              // Redirect or update UI
            } else {
              // Handle verification failure
            }
          },
          prefill: {
            name: 'Customer Name',
            email: 'customer@example.com',
            contact: '9999999999'
          },
          theme: {
            color: '#3399cc'
          }
        };

        initiateRazorpayPayment(options);
      } else if (data.error) {
        // Handle error
        window.location.href = data.errorRedirect;
      }
    } catch (error) {
      console.error(error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Pay with Razorpay'}
    </button>
  );
};

export default CheckoutButton;
