import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const isLive = process.env.STRIPE_MODE === 'live';
    const key = isLive
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE
      : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = loadStripe(key ?? '');
  }
  return stripePromise;
};
