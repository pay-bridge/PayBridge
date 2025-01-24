// utils/razorpay/client.ts

import { loadScript } from '@stripe/stripe-js'; // Alternatively, use a custom script loader
import { RazorpayOptions } from 'razorpay';

let razorpayScriptPromise: Promise<void> | null = null;

export const loadRazorpayScript = () => {
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Razorpay SDK failed to load.'));
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
};

export const initiateRazorpayPayment = async (options: RazorpayOptions) => {
  await loadRazorpayScript();

  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
};
