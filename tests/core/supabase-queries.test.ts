import { getUser, getSubscription, getProducts, getUserDetails } from '@/core/users/supabase/queries';

jest.mock('react', () => ({ cache: (fn: any) => fn }));

const mockSupabase: any = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn()
};

describe('supabase/queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getUser returns user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '123' } } });
    const user = await getUser(mockSupabase as any);
    expect(user).toEqual({ id: '123' });
  });

  it('getSubscription returns subscription', async () => {
    // Chain: from().select().in().maybeSingle()
    const chain = {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'sub_1' }, error: null })
    };
    mockSupabase.from.mockReturnValue(chain);
    const subscription = await getSubscription(mockSupabase as any);
    expect(subscription).toEqual({ id: 'sub_1' });
  });

  it('getProducts returns products', async () => {
    // Chain: from('products').select().eq().eq().order().order()
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis()
    };
    // .order() is called twice: first returns chain, second resolves value
    const orderMock = jest.fn()
      .mockReturnValueOnce(chain)
      .mockResolvedValueOnce({ data: [{ id: 'prod_1' }], error: null });
    chain.order = orderMock;
    mockSupabase.from.mockReturnValue(chain);
    const products = await getProducts(mockSupabase as any);
    expect(products).toEqual([{ id: 'prod_1' }]);
  });

  it('getUserDetails returns user details', async () => {
    // Chain: from('users').select().single()
    const chain = {
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'user_1' } })
    };
    mockSupabase.from.mockReturnValue(chain);
    const details = await getUserDetails(mockSupabase as any);
    expect(details).toEqual({ id: 'user_1' });
  });
}); 