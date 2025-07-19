import { getDatabaseClient } from '@/db/adapters/client';

export type Transaction = {
  id: string;
  user_id?: string;
  subscription_id?: string;
  gateway: string;
  gateway_transaction_id: string;
  amount?: string;
  currency?: string;
  status?: string;
  type?: string;
  raw?: any;
  created_at?: string;
  updated_at?: string;
};

const TABLE = 'transactions';

export async function saveTransaction(tx: Transaction) {
  const db = getDatabaseClient();
  return db.createProduct({
    id: tx.id,
    name: `Tx:${tx.gateway}:${tx.gateway_transaction_id}`,
    description: `Transaction for gateway ${tx.gateway}`,
    metadata: tx,
    active: true
  });
}

export async function updateTransaction(id: string, updates: Partial<Transaction>) {
  const db = getDatabaseClient();
  return db.updateProduct(id, { metadata: updates });
}

export async function getTransactionById(id: string) {
  const db = getDatabaseClient();
  const tx = await db.getProduct(id);
  return tx?.metadata;
} 