// api/razorpay/verify-payment.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyRazorpaySignature } from '@/core/payments/adapters/razorpay/server';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const verification = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (verification.success) {
      // Update your database, activate subscriptions, etc.
      res.status(200).json({ success: true, message: verification.message });
    } else {
      res.status(400).json({ success: false, message: verification.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
