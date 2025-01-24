// api/razorpay/webhook.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { handleRazorpayWebhook } from '@/utils/razorpay/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await handleRazorpayWebhook(req, res);
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
