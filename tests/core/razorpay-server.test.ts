import { createRazorpayOrder, verifyRazorpaySignature, handleRazorpayWebhook } from '@/core/payments/adapters/razorpay/server';
import razorpayInstance from '@/core/payments/adapters/razorpay/config';
import { createClient } from '@/core/users/supabase/server';
import { getErrorRedirect } from '@/core/helpers';
import { saveTransaction } from '@/core/payments/transactions';

global.console = { ...global.console, error: jest.fn(), log: jest.fn() };

jest.mock('@/core/payments/adapters/razorpay/config', () => ({
  __esModule: true,
  default: {
    orders: { create: jest.fn() },
  },
}));
jest.mock('@/core/users/supabase/server');
jest.mock('@/core/helpers', () => ({
  ...jest.requireActual('@/core/helpers'),
  getErrorRedirect: jest.fn((path, error, desc) => `/redirect?error=${error}`),
}));
jest.mock('@/core/payments/transactions', () => ({
  saveTransaction: jest.fn(),
}));

describe('razorpay/server', () => {
  const mockUser = { id: 'user1', email: 'test@example.com' };
  const mockOrder = { id: 'order_123' };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue({
      auth: { getUser: jest.fn().mockResolvedValue({ error: null, data: { user: mockUser } }) },
    });
    (razorpayInstance.orders.create as jest.Mock).mockResolvedValue(mockOrder);
  });

  it('createRazorpayOrder returns orderId on success', async () => {
    const price = { id: 'price_1', unit_amount: 100, currency: 'INR' };
    const result = await createRazorpayOrder(price as any, '/success');
    expect(result).toEqual({ orderId: 'order_123' });
    expect(razorpayInstance.orders.create).toHaveBeenCalled();
  });

  it('createRazorpayOrder returns errorRedirect if user not found', async () => {
    (createClient as jest.Mock).mockReturnValue({
      auth: { getUser: jest.fn().mockResolvedValue({ error: 'err', data: { user: null } }) },
    });
    const price = { id: 'price_1', unit_amount: 100, currency: 'INR' };
    const result = await createRazorpayOrder(price as any, '/fail');
    expect(result.errorRedirect).toContain('Could not get user session.');
  });

  it('createRazorpayOrder returns errorRedirect if order creation fails', async () => {
    (razorpayInstance.orders.create as jest.Mock).mockRejectedValue(new Error('order error'));
    const price = { id: 'price_1', unit_amount: 100, currency: 'INR' };
    const result = await createRazorpayOrder(price as any, '/fail');
    expect(result.errorRedirect).toContain('order error');
  });

  it('verifyRazorpaySignature returns success for valid signature', () => {
    process.env.RAZORPAY_SECRET = 'testsecret';
    const crypto = require('crypto');
    const orderId = 'order_1';
    const paymentId = 'pay_1';
    const body = orderId + '|' + paymentId;
    const signature = crypto.createHmac('sha256', 'testsecret').update(body).digest('hex');
    const result = verifyRazorpaySignature(orderId, paymentId, signature);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Payment verified successfully.');
  });

  it('verifyRazorpaySignature returns failure for invalid signature', () => {
    process.env.RAZORPAY_SECRET = 'testsecret';
    const result = verifyRazorpaySignature('order_1', 'pay_1', 'invalidsig');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Payment verification failed.');
  });

  it('handleRazorpayWebhook returns 400 for invalid signature', async () => {
    const req = {
      headers: { 'x-razorpay-signature': 'invalid' },
      body: { foo: 'bar' },
    } as any;
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    await handleRazorpayWebhook(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Invalid signature');
  });

  it('handleRazorpayWebhook processes payment.captured event', async () => {
    process.env.RAZORPAY_SECRET = 'testsecret';
    const event = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_1', amount: 100, currency: 'INR', status: 'captured', notes: {} } } },
    };
    const crypto = require('crypto');
    const signature = crypto.createHmac('sha256', 'testsecret').update(JSON.stringify(event)).digest('hex');
    const req = {
      headers: { 'x-razorpay-signature': signature },
      body: event,
    } as any;
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
    await handleRazorpayWebhook(req, res);
    expect(saveTransaction).toHaveBeenCalledWith(expect.objectContaining({ id: 'pay_1', gateway: 'razorpay' }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('Webhook received');
  });
}); 