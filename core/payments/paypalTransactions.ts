import { getDatabaseClient } from '@/db/adapters/client';

export type PayPalTransaction = {
  id: string;
  order_id: string;
  payer_id: string;
  amount: string;
  currency: string;
  status: string;
  raw: any;
  created_at?: string;
  updated_at?: string;
};

const TABLE = 'paypal_transactions';

export async function savePayPalTransaction(tx: PayPalTransaction) {
  const db = getDatabaseClient();
  // You may need to create the table in your DB if it doesn't exist
  return db.createProduct({
    id: tx.id,
    name: `PayPalTx:${tx.id}`,
    description: `PayPal transaction for order ${tx.order_id}`,
    metadata: tx,
    active: true
  });
}

export async function updatePayPalTransaction(id: string, updates: Partial<PayPalTransaction>) {
  const db = getDatabaseClient();
  // This is a placeholder; adapt to your DB schema
  return db.updateProduct(id, { metadata: updates });
}

export async function getPayPalTransactionById(id: string) {
  const db = getDatabaseClient();
  // This is a placeholder; adapt to your DB schema
  const tx = await db.getProduct(id);
  return tx?.metadata;
} 