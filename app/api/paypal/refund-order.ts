import { NextApiRequest, NextApiResponse } from 'next';
import { refundOrder } from '@/core/payments/adapters/paypal/adapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { captureId, amount, currency } = req.body;

  if (!captureId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await refundOrder(captureId, amount, currency);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to refund PayPal order' });
  }
} 