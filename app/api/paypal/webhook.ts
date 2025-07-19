import type { NextApiRequest, NextApiResponse } from 'next';
import { saveTransaction, updateTransaction } from '@/core/payments/transactions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const event = req.body;
  const eventType = event.event_type;

  switch (eventType) {
    case 'PAYMENT.CAPTURE.COMPLETED': {
      const capture = event.resource;
      console.log('[PayPal] Payment completed:', {
        id: capture.id,
        amount: capture.amount,
        payer: capture.payer,
        status: capture.status
      });
      try {
        await saveTransaction({
          id: capture.id,
          gateway: 'paypal',
          gateway_transaction_id: capture.id,
          user_id: undefined, // Optionally link to user if available
          subscription_id: undefined, // Optionally link to subscription if available
          amount: capture.amount?.value,
          currency: capture.amount?.currency_code,
          status: capture.status,
          type: 'payment',
          raw: capture
        });
      } catch (err) {
        console.error('[PayPal] Failed to save transaction:', err);
      }
      break;
    }
    case 'PAYMENT.CAPTURE.REFUNDED': {
      const refund = event.resource;
      console.log('[PayPal] Payment refunded:', {
        id: refund.id,
        amount: refund.amount,
        status: refund.status
      });
      try {
        await updateTransaction(refund.id, {
          status: refund.status,
          type: 'refund',
          raw: refund
        });
      } catch (err) {
        console.error('[PayPal] Failed to update transaction:', err);
      }
      break;
    }
    default:
      console.log('[PayPal] Unhandled event:', eventType);
  }

  res.status(200).json({ received: true });
} 