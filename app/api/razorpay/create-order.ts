// pages/api/razorpay/create-order.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createRazorpayOrder } from '@/core/payments/adapters/razorpay/server';
import { Tables } from '@/core/types_db';
type Price = Tables<'prices'>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { priceId, redirectPath } = req.body;

    // TODO: Fetch the price details from your database based on priceId
    return res.status(501).json({ error: 'Fetching price from DB not implemented.' });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
