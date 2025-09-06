import { SQLiteClient } from '@/db/adapters/sqlite/client';

describe('SQLiteClient', () => {
  let client: SQLiteClient;
  beforeEach(() => {
    client = new SQLiteClient({ provider: 'sqlite', filePath: ':memory:' });
  });
  afterEach(() => {
    client.close();
  });

  describe('User CRUD', () => {
    it('creates and retrieves a user', async () => {
      const user = { id: 'u1', email: 'a@b.com', full_name: 'A', avatar_url: '', billing_address: {}, payment_method: {} };
      await client.createUser(user);
      const fetched = await (client as any).getUserById('u1');
      expect(fetched.email).toBe('a@b.com');
    });
    it('updates a user', async () => {
      const user = { id: 'u2', email: 'b@b.com', full_name: 'B', avatar_url: '', billing_address: {}, payment_method: {} };
      await client.createUser(user);
      await client.updateUser('u2', { full_name: 'B2', avatar_url: 'x', billing_address: { x: 1 }, payment_method: { y: 2 } });
      const updated = await (client as any).getUserById('u2');
      expect(updated.full_name).toBe('B2');
      expect(updated.billing_address).toEqual({ x: 1 });
    });
  });

  describe('Product CRUD', () => {
    it('creates, retrieves, updates, and deletes a product', async () => {
      const product = { id: 'p1', active: 1, name: 'Prod', description: 'desc', image: '', metadata: { foo: 'bar' } };
      await client.createProduct(product);
      let fetched = await client.getProduct('p1');
      expect(fetched.name).toBe('Prod');
      await client.updateProduct('p1', { ...product, name: 'Prod2', metadata: { foo: 'baz' } });
      fetched = await client.getProduct('p1');
      expect(fetched.name).toBe('Prod2');
      await client.deleteProduct('p1');
      fetched = await client.getProduct('p1');
      expect(fetched).toBeNull();
    });
  });

  describe('Price CRUD', () => {
    it('creates, retrieves, updates, and deletes a price', async () => {
      const product = { id: 'p2', active: 1, name: 'Prod2', description: '', image: '', metadata: {} };
      await client.createProduct(product);
      const price = { id: 'pr1', product_id: 'p2', active: 1, description: 'd', unit_amount: 100, currency: 'usd', type: 'one_time', interval: null, interval_count: null, trial_period_days: null, metadata: { a: 1 } };
      await client.createPrice(price);
      let fetched = await client.getPrice('pr1');
      expect(fetched.unit_amount).toBe(100);
      await client.updatePrice('pr1', { ...price, unit_amount: 200, metadata: { a: 2 } });
      fetched = await client.getPrice('pr1');
      expect(fetched.unit_amount).toBe(200);
      await client.deletePrice('pr1');
      fetched = await client.getPrice('pr1');
      expect(fetched).toBeNull();
    });
  });

  describe('Subscription CRUD', () => {
    it('creates, retrieves, updates, and deletes a subscription', async () => {
      const user = { id: 'u3', email: 'c@b.com', full_name: 'C', avatar_url: '', billing_address: {}, payment_method: {} };
      await client.createUser(user);
      const product = { id: 'p3', active: 1, name: 'Prod3', description: '', image: '', metadata: {} };
      await client.createProduct(product);
      const price = { id: 'pr2', product_id: 'p3', active: 1, description: '', unit_amount: 100, currency: 'usd', type: 'recurring', interval: 'month', interval_count: 1, trial_period_days: 0, metadata: {} };
      await client.createPrice(price);
      const sub = { id: 's1', user_id: 'u3', status: 'active', metadata: {}, price_id: 'pr2', quantity: 1, cancel_at_period_end: 0, created: '2023-01-01', current_period_start: '2023-01-01', current_period_end: '2023-02-01', ended_at: '', cancel_at: '', canceled_at: '', trial_start: '', trial_end: '' };
      await client.createSubscription(sub);
      let fetched = await client.getSubscription('u3');
      expect(fetched.status).toBe('active');
      await client.updateSubscription('s1', { ...sub, status: 'canceled', metadata: { foo: 'bar' } });
      fetched = await client.getSubscription('u3');
      expect(fetched.status).toBe('canceled');
      await client.deleteSubscription('s1');
      fetched = await client.getSubscription('u3');
      expect(fetched).toBeNull();
    });
  });

  describe('Auth', () => {
    it('signs up and signs in a user', async () => {
      const { user, session } = await client.signUp('d@b.com', 'pw');
      expect(user.email).toBe('d@b.com');
      const result = await client.signIn('d@b.com', 'pw');
      expect(result.user.email).toBe('d@b.com');
      expect(result.session).toHaveProperty('access_token');
    });
    it('throws on sign in with unknown user', async () => {
      await expect(client.signIn('no@b.com', 'pw')).rejects.toThrow('User not found');
    });
  });

  describe('Webhook handler', () => {
    it('handles product.created event', async () => {
      await client.handleWebhook({ type: 'product.created', data: { object: { id: 'wp1', active: 1, name: 'WProd', description: '', image: '', metadata: {} } } });
      const prod = await client.getProduct('wp1');
      expect(prod.name).toBe('WProd');
    });
    it('handles price.created event', async () => {
      await client.createProduct({ id: 'wp2', active: 1, name: 'WProd2', description: '', image: '', metadata: {} });
      await client.handleWebhook({ type: 'price.created', data: { object: { id: 'wpr1', product_id: 'wp2', active: 1, description: '', unit_amount: 100, currency: 'usd', type: 'one_time', interval: null, interval_count: null, trial_period_days: null, metadata: {} } } });
      const price = await client.getPrice('wpr1');
      expect(price.unit_amount).toBe(100);
    });
    it('handles customer.subscription.created event', async () => {
      await client.createUser({ id: 'wu1', email: 'w@b.com', full_name: '', avatar_url: '', billing_address: {}, payment_method: {} });
      await client.createProduct({ id: 'wp3', active: 1, name: 'WProd3', description: '', image: '', metadata: {} });
      await client.createPrice({ id: 'wpr2', product_id: 'wp3', active: 1, description: '', unit_amount: 100, currency: 'usd', type: 'recurring', interval: 'month', interval_count: 1, trial_period_days: 0, metadata: {} });
      await client.handleWebhook({ type: 'customer.subscription.created', data: { object: { id: 'ws1', user_id: 'wu1', status: 'active', metadata: {}, price_id: 'wpr2', quantity: 1, cancel_at_period_end: 0, created: '2023-01-01', current_period_start: '2023-01-01', current_period_end: '2023-02-01', ended_at: '', cancel_at: '', canceled_at: '', trial_start: '', trial_end: '' } } });
      const sub = await client.getSubscription('wu1');
      expect(sub.status).toBe('active');
    });
  });

  it('closes the database connection', () => {
    expect(() => client.close()).not.toThrow();
  });
}); 