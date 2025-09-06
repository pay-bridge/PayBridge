// core/payments/adapters/razorpay/server.ts

import razorpayInstance from './config';
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/core/users/supabase/server';
import { createOrRetrieveCustomer } from '@/core/users/supabase/admin';
import { getURL, getErrorRedirect, calculateTrialEndUnixTimestamp } from '@/core/helpers';
import { Tables } from '@/core/types_db';
import crypto from 'crypto';
import { saveTransaction } from '@/core/payments/transactions';

type Price = Tables<'prices'>;

type OrderResponse = {
  orderId?: string;
  errorRedirect?: string;
};

type PaymentVerificationResponse = {
  success: boolean;
  message: string;
};

export async function createRazorpayOrder(
  price: Price,
  redirectPath: string = '/account'
): Promise<OrderResponse> {
  try {
    // Get the user from Supabase auth
    const supabase = createClient();
    const {
      error,
      data: { user }
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error(error);
      throw new Error('Could not get user session.');
    }

    // Retrieve or create the customer in your database if needed
    // For Razorpay, customer management is typically handled via your own system

    const amount = (price.unit_amount || 0) * 100; // Razorpay expects amount in paise
    const currency = price.currency ?? 'INR';
    const receipt = `receipt_order_${user.id}_${Date.now()}`;

    const order = await razorpayInstance.orders.create({
      amount,
      currency,
      receipt,
      // @ts-ignore
      payment_capture: 1 // 1 for automatic capture, 0 for manual
    }) as any;

    return { orderId: order?.id };
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          error.message,
          'Please try again later or contact a system administrator.'
        )
      };
    } else {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      };
    }
  }
}

export function verifyRazorpaySignature(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): PaymentVerificationResponse {
  const secret = process.env.RAZORPAY_SECRET ?? '';

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    return { success: true, message: 'Payment verified successfully.' };
  } else {
    return { success: false, message: 'Payment verification failed.' };
  }
}

// Example webhook handler (This should be in your API routes)
export async function handleRazorpayWebhook(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.RAZORPAY_SECRET ?? '';
  const signature = req.headers['x-razorpay-signature'] as string;
  const event = req.body;

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(event))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  // Handle the event
  switch (event.event) {
    case 'payment.captured':
      const payment = event.payload.payment.entity;
      try {
        await saveTransaction({
          id: payment.id,
          gateway: 'razorpay',
          gateway_transaction_id: payment.id,
          user_id: payment.notes?.user_id || undefined, // If you store user_id in notes
          subscription_id: payment.notes?.subscription_id || undefined, // If you store subscription_id in notes
          amount: payment.amount?.toString(),
          currency: payment.currency,
          status: payment.status,
          type: 'payment',
          raw: payment
        });
      } catch (err) {
        console.error('[Razorpay] Failed to save transaction:', err);
      }
      // TODO: Activate subscriptions, etc.
      break;
    // Handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.event}`);
  }

  res.status(200).send('Webhook received');
}
