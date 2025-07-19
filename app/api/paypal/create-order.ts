import { NextApiRequest, NextApiResponse } from 'next';
import { createOrder } from '@/core/payments/adapters/paypal/adapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.status(501).json({ error: 'PayPal is not enabled.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, currency, returnUrl, cancelUrl } = req.body;

  if (!amount || !returnUrl || !cancelUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const order = await createOrder({ amount, currency, returnUrl, cancelUrl });
    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create PayPal order' });
  }
} 