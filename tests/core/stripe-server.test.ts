import { checkoutWithStripe, createStripePortal } from '@/core/payments/adapters/stripe/server';
import { stripe } from '@/core/payments/adapters/stripe/config';
import { createClient } from '@/core/users/supabase/server';
import { createOrRetrieveCustomer } from '@/core/users/supabase/admin';
import { getErrorRedirect } from '@/core/helpers';

global.console = { ...global.console, error: jest.fn() };

jest.mock('@/core/payments/adapters/stripe/config', () => ({
  stripe: {
    checkout: { sessions: { create: jest.fn() } },
    billingPortal: { sessions: { create: jest.fn() } },
  },
}));
jest.mock('@/core/users/supabase/server');
jest.mock('@/core/users/supabase/admin');
jest.mock('@/core/helpers', () => ({
  ...jest.requireActual('@/core/helpers'),
  getErrorRedirect: jest.fn((path, error, desc) => `/redirect?error=${error}`),
}));

describe('stripe/server', () => {
  const mockUser = { id: 'user1', email: 'test@example.com' };
  const mockCustomer = 'cus_123';
  const mockSession = { id: 'sess_123' };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue({
      auth: { getUser: jest.fn().mockResolvedValue({ error: null, data: { user: mockUser } }) },
    });
    (createOrRetrieveCustomer as jest.Mock).mockResolvedValue(mockCustomer);
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession);
    (stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue({ url: 'https://portal' });
  });

  it('checkoutWithStripe returns sessionId on success', async () => {
    const price = { id: 'price_1', type: 'recurring', trial_period_days: 7 };
    const result = await checkoutWithStripe(price as any, '/success');
    expect(result).toEqual({ sessionId: 'sess_123' });
    expect(stripe.checkout.sessions.create).toHaveBeenCalled();
  });

  it('checkoutWithStripe returns errorRedirect if user not found', async () => {
    (createClient as jest.Mock).mockReturnValue({
      auth: { getUser: jest.fn().mockResolvedValue({ error: 'err', data: { user: null } }) },
    });
    const price = { id: 'price_1', type: 'recurring', trial_period_days: 7 };
    const result = await checkoutWithStripe(price as any, '/fail');
    expect(result.errorRedirect).toContain('Could not get user session.');
  });

  it('checkoutWithStripe returns errorRedirect if customer creation fails', async () => {
    (createOrRetrieveCustomer as jest.Mock).mockRejectedValue(new Error('customer error'));
    const price = { id: 'price_1', type: 'recurring', trial_period_days: 7 };
    const result = await checkoutWithStripe(price as any, '/fail');
    expect(result.errorRedirect).toContain('Unable to access customer record.');
  });

  it('checkoutWithStripe returns errorRedirect if session creation fails', async () => {
    (stripe.checkout.sessions.create as jest.Mock).mockRejectedValue(new Error('stripe error'));
    const price = { id: 'price_1', type: 'recurring', trial_period_days: 7 };
    const result = await checkoutWithStripe(price as any, '/fail');
    expect(result.errorRedirect).toContain('Unable to create checkout session.');
  });

  it('createStripePortal returns url on success', async () => {
    const result = await createStripePortal('/account');
    expect(result).toBe('https://portal');
    expect(stripe.billingPortal.sessions.create).toHaveBeenCalled();
  });

  it('createStripePortal returns errorRedirect if user not found', async () => {
    (createClient as jest.Mock).mockReturnValue({
      auth: { getUser: jest.fn().mockResolvedValue({ error: 'err', data: { user: null } }) },
    });
    const result = await createStripePortal('/fail');
    expect(result).toContain('Could not get user session.');
  });

  it('createStripePortal returns errorRedirect if customer creation fails', async () => {
    (createOrRetrieveCustomer as jest.Mock).mockRejectedValue(new Error('customer error'));
    const result = await createStripePortal('/fail');
    expect(result).toContain('Unable to access customer record.');
  });

  it('createStripePortal returns errorRedirect if portal creation fails', async () => {
    (stripe.billingPortal.sessions.create as jest.Mock).mockRejectedValue(new Error('portal error'));
    const result = await createStripePortal('/fail');
    expect(result).toContain('Could not create billing portal');
  });
}); 