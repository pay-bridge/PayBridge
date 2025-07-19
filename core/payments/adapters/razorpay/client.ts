// core/payments/adapters/razorpay/client.ts

// Custom loader for Razorpay script
export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject('Not in browser');
    if (document.getElementById('razorpay-sdk')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

export const initiateRazorpayPayment = async (options: any) => {
  await loadRazorpayScript();
  // @ts-ignore
  const rzp = new window.Razorpay(options);
  rzp.open();
};
