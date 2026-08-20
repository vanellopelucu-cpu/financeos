-- Migration: Add bill_id column to transactions table for bill payment reference
-- This allows linking expense transactions to their originating bills
-- Used by payBill/unpayBill to create and delete payment transactions

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS bill_id text;

CREATE INDEX IF NOT EXISTS transactions_bill_id_idx ON transactions (bill_id);

-- Optional: Add foreign key constraint (requires bills table to have id column)
-- ALTER TABLE transactions
--   ADD CONSTRAINT transactions_bill_id_fkey
--   FOREIGN KEY (bill_id) REFERENCES bills (id) ON DELETE SET NULL;
