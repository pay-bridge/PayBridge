import Stripe from 'stripe';
import { stripe } from '@/core/payments/adapters/stripe/config';
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord
} from '@/core/users/supabase/admin';
import { saveTransaction } from '@/core/payments/transactions';

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response('Webhook secret not found.', { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'price.deleted':
          await deletePriceRecord(event.data.object as Stripe.Price);
          break;
        case 'product.deleted':
          await deleteProductRecord(event.data.object as Stripe.Product);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          // Save transaction
          try {
            await saveTransaction({
              id: subscription.id,
              gateway: 'stripe',
              gateway_transaction_id: subscription.id,
              user_id: subscription.customer as string,
              subscription_id: subscription.id,
              amount: subscription.items.data[0]?.price.unit_amount?.toString(),
              currency: subscription.items.data[0]?.price.currency,
              status: subscription.status,
              type: 'subscription',
              raw: subscription
            });
          } catch (err) {
            console.error('[Stripe] Failed to save subscription transaction:', err);
          }
          break;
        }
        case 'checkout.session.completed': {
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
            // Save transaction
            try {
              await saveTransaction({
                id: checkoutSession.id,
                gateway: 'stripe',
                gateway_transaction_id: checkoutSession.id,
                user_id: checkoutSession.customer as string,
                subscription_id: subscriptionId as string,
                amount: checkoutSession.amount_total?.toString(),
                currency: checkoutSession.currency,
                status: checkoutSession.status,
                type: 'checkout',
                raw: checkoutSession
              });
            } catch (err) {
              console.error('[Stripe] Failed to save checkout transaction:', err);
            }
          }
          break;
        }
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400
        }
      );
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
