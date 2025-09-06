import { saveTransaction, updateTransaction, getTransactionById, Transaction } from '@/core/payments/transactions';
import { getDatabaseClient } from '@/db/adapters/client';

jest.mock('@/db/adapters/client');

const mockDb = {
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  getProduct: jest.fn(),
};

(getDatabaseClient as jest.Mock).mockReturnValue(mockDb);

describe('transactions module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saveTransaction should call db.createProduct with correct data', async () => {
    const tx: Transaction = {
      id: 'tx1',
      gateway: 'stripe',
      gateway_transaction_id: 'g123',
      amount: '100',
      currency: 'USD',
      status: 'succeeded',
      type: 'payment',
      raw: { foo: 'bar' },
    };
    mockDb.createProduct.mockResolvedValue({ id: tx.id });
    const result = await saveTransaction(tx);
    expect(mockDb.createProduct).toHaveBeenCalledWith({
      id: tx.id,
      name: `Tx:${tx.gateway}:${tx.gateway_transaction_id}`,
      description: `Transaction for gateway ${tx.gateway}`,
      metadata: tx,
      active: true,
    });
    expect(result).toEqual({ id: tx.id });
  });

  it('updateTransaction should call db.updateProduct with correct data', async () => {
    mockDb.updateProduct.mockResolvedValue({ id: 'tx1', metadata: { status: 'refunded' } });
    const result = await updateTransaction('tx1', { status: 'refunded' });
    expect(mockDb.updateProduct).toHaveBeenCalledWith('tx1', { metadata: { status: 'refunded' } });
    expect(result).toEqual({ id: 'tx1', metadata: { status: 'refunded' } });
  });

  it('getTransactionById should call db.getProduct and return metadata', async () => {
    mockDb.getProduct.mockResolvedValue({ id: 'tx1', metadata: { foo: 'bar' } });
    const result = await getTransactionById('tx1');
    expect(mockDb.getProduct).toHaveBeenCalledWith('tx1');
    expect(result).toEqual({ foo: 'bar' });
  });
}); 