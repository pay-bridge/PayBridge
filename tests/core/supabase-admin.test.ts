var mockSupabase: any = { from: jest.fn() };
var mockStripe: any = { customers: {}, subscriptions: {} };
jest.mock('@/core/payments/adapters/stripe/config', () => ({ stripe: mockStripe }));
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn(() => mockSupabase) }));
import { makeAdminFns } from '@/core/users/supabase/admin';

describe('supabase/admin', () => {
  let adminFns: any;
  beforeEach(() => {
    jest.clearAllMocks();
    adminFns = makeAdminFns(mockSupabase, mockStripe);
  });

  describe('upsertProductRecord', () => {
    it('inserts/updates product successfully', async () => {
      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({ upsert: upsertMock });
      const product = { id: 'prod_1', active: true, name: 'Test', metadata: {}, images: [] };
      await expect(adminFns.upsertProductRecord(product as any)).resolves.toBeUndefined();
      expect(upsertMock).toHaveBeenCalled();
    });
    it('throws on upsert error', async () => {
      const upsertMock = jest.fn().mockResolvedValue({ error: { message: 'fail' } });
      mockSupabase.from.mockReturnValue({ upsert: upsertMock });
      const product = { id: 'prod_1', active: true, name: 'Test', metadata: {}, images: [] };
      await expect(adminFns.upsertProductRecord(product as any)).rejects.toThrow('Product insert/update failed: fail');
    });
  });

  describe('upsertPriceRecord', () => {
    it('inserts/updates price successfully', async () => {
      const upsertMock = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({ upsert: upsertMock });
      const price = { id: 'price_1', product: 'prod_1', active: true, currency: 'usd', type: 'recurring' };
      await expect(adminFns.upsertPriceRecord(price as any)).resolves.toBeUndefined();
      expect(upsertMock).toHaveBeenCalled();
    });
    it('throws on upsert error', async () => {
      const upsertMock = jest.fn().mockResolvedValue({ error: { message: 'fail' } });
      mockSupabase.from.mockReturnValue({ upsert: upsertMock });
      const price = { id: 'price_1', product: 'prod_1', active: true, currency: 'usd', type: 'recurring' };
      await expect(adminFns.upsertPriceRecord(price as any)).rejects.toThrow('Price insert/update failed: fail');
    });
    it('retries on foreign key constraint error and then throws', async () => {
      jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => { fn(); return undefined as unknown as NodeJS.Timeout; });
      const upsertMock = jest.fn().mockResolvedValue({ error: { message: 'foreign key constraint' } });
      mockSupabase.from.mockReturnValue({ upsert: upsertMock });
      const price = { id: 'price_1', product: 'prod_1', active: true, currency: 'usd', type: 'recurring' };
      await expect(adminFns.upsertPriceRecord(price as any)).rejects.toThrow('Price insert/update failed after 3 retries: foreign key constraint');
    });
  });

  describe('deleteProductRecord', () => {
    it('deletes product successfully', async () => {
      const deleteMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({ delete: deleteMock, eq: eqMock });
      const product = { id: 'prod_1' };
      await expect(adminFns.deleteProductRecord(product as any)).resolves.toBeUndefined();
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('id', 'prod_1');
    });
    it('throws on delete error', async () => {
      const deleteMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockResolvedValue({ error: { message: 'fail' } });
      mockSupabase.from.mockReturnValue({ delete: deleteMock, eq: eqMock });
      const product = { id: 'prod_1' };
      await expect(adminFns.deleteProductRecord(product as any)).rejects.toThrow('Product deletion failed: fail');
    });
  });

  describe('deletePriceRecord', () => {
    it('deletes price successfully', async () => {
      const deleteMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({ delete: deleteMock, eq: eqMock });
      const price = { id: 'price_1' };
      await expect(adminFns.deletePriceRecord(price as any)).resolves.toBeUndefined();
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('id', 'price_1');
    });
    it('throws on delete error', async () => {
      const deleteMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockResolvedValue({ error: { message: 'fail' } });
      mockSupabase.from.mockReturnValue({ delete: deleteMock, eq: eqMock });
      const price = { id: 'price_1' };
      await expect(adminFns.deletePriceRecord(price as any)).rejects.toThrow('Price deletion failed: fail');
    });
  });

  describe('createOrRetrieveCustomer', () => {
    it('returns existing Stripe customer ID from Supabase', async () => {
      mockSupabase.from.mockReturnValue({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { stripe_customer_id: 'cus_123' }, error: null }) }) })
      });
      mockStripe.customers = { retrieve: jest.fn().mockResolvedValue({ id: 'cus_123' }) };
      const adminFns = makeAdminFns(mockSupabase, mockStripe);
      const result = await adminFns.createOrRetrieveCustomer({ email: 'a@b.com', uuid: 'uuid1' });
      expect(result).toBe('cus_123');
    });
    it('creates new Stripe customer if not found', async () => {
      mockSupabase.from = jest.fn((table: string) => {
        if (table === 'customers') {
          return {
            select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
            upsert: jest.fn().mockResolvedValue({ error: null })
          };
        }
        return {};
      });
      mockStripe.customers = {
        list: jest.fn().mockResolvedValue({ data: [] }),
        create: jest.fn().mockResolvedValue({ id: 'cus_new' })
      };
      const adminFns = makeAdminFns(mockSupabase, mockStripe);
      const result = await adminFns.createOrRetrieveCustomer({ email: 'a@b.com', uuid: 'uuid1' });
      expect(result).toBe('cus_new');
    });
    it('throws on Supabase query error', async () => {
      mockSupabase.from.mockReturnValue({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: { message: 'fail' } }) }) })
      });
      const adminFns = makeAdminFns(mockSupabase, mockStripe);
      await expect(adminFns.createOrRetrieveCustomer({ email: 'a@b.com', uuid: 'uuid1' })).rejects.toThrow('Supabase customer lookup failed: fail');
    });
  });

  describe('manageSubscriptionStatusChange', () => {
    it('upserts subscription and copies billing details on createAction', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'uuid1' }, error: null }) }) })
          };
        }
        if (table === 'subscriptions') {
          return { upsert: jest.fn().mockResolvedValue({ error: null }) };
        }
        if (table === 'users') {
          return { update: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ error: null }) };
        }
        return {};
      });
      mockStripe.subscriptions = {
        retrieve: jest.fn().mockResolvedValue({
          id: 'sub_1',
          metadata: {},
          status: 'active',
          items: { data: [{ price: { id: 'price_1' } }] },
          quantity: 1,
          cancel_at_period_end: false,
          cancel_at: null,
          canceled_at: null,
          current_period_start: 1,
          current_period_end: 2,
          created: 3,
          ended_at: null,
          trial_start: null,
          trial_end: null,
          default_payment_method: { customer: 'cus_123', billing_details: { name: 'A', phone: '1', address: { line1: 'x' } }, type: 'card', card: {} }
        })
      };
      mockStripe.customers = { update: jest.fn().mockResolvedValue({}) };
      const adminFns = makeAdminFns(mockSupabase, mockStripe);
      await expect(adminFns.manageSubscriptionStatusChange('sub_1', 'cus_123', true)).resolves.toBeUndefined();
    });
    it('throws on customer lookup error', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'fail' } }) }) })
          };
        }
        return {};
      });
      const adminFns = makeAdminFns(mockSupabase, mockStripe);
      await expect(adminFns.manageSubscriptionStatusChange('sub_1', 'cus_123')).rejects.toThrow('Customer lookup failed: fail');
    });
  });
}); 