import paypal from '@paypal/checkout-server-sdk';

if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  throw new Error('PayPal is not enabled. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
}

// PayPal environment config
const environment = process.env.PAYPAL_MODE === 'live'
  ? new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    )
  : new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    );

const client = new paypal.core.PayPalHttpClient(environment);

export async function createOrder({
  amount,
  currency = 'USD',
  returnUrl,
  cancelUrl
}: {
  amount: string;
  currency?: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount
        }
      }
    ],
    application_context: {
      return_url: returnUrl,
      cancel_url: cancelUrl
    }
  });
  const response = await client.execute(request);
  return response.result;
}

export async function captureOrder(orderId: string) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  const response = await client.execute(request);
  return response.result;
}

export async function refundOrder(captureId: string, amount: string, currency = 'USD') {
  const request = new paypal.payments.CapturesRefundRequest(captureId);
  request.requestBody({
    amount: {
      value: amount,
      currency_code: currency
    }
  });
  const response = await client.execute(request);
  return response.result;
} 