-- Unified transactions table for all payment gateways
create table transactions (
  id text primary key,
  user_id text references users(id),
  subscription_id text references subscriptions(id),
  gateway text not null, -- 'paypal', 'stripe', 'razorpay', etc.
  gateway_transaction_id text not null, -- The ID from the payment provider
  amount text,
  currency text,
  status text, -- 'completed', 'pending', 'refunded', etc.
  type text,   -- 'payment', 'refund', 'payout', etc.
  raw jsonb,   -- Store the full payload for auditing/debugging
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table transactions enable row level security;
create policy "Allow user to view own transactions." on transactions for select using (auth.uid() = user_id); 