// utils/razorpay/config.ts

import Razorpay from 'razorpay';

const razorpayInstance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? '',
  key_secret: process.env.RAZORPAY_SECRET ?? ''
});

export default razorpayInstance;
