// pages/api/razorpay/create-order.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createRazorpayOrder } from '@/utils/razorpay/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { priceId, redirectPath } = req.body;

    // Fetch the price details from your database based on priceId
    const price: Price = /* Fetch from DB */;

    const response = await createRazorpayOrder(price, redirectPath);

    if (response.orderId) {
      res.status(200).json({ orderId: response.orderId, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY });
    } else if (response.errorRedirect) {
      res.status(400).json({ error: response.errorRedirect });
    } else {
      res.status(500).json({ error: 'Unexpected error' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
