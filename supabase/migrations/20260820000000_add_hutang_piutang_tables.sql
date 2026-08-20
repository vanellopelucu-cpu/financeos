-- ============================================================
-- Migration: Add debt (Hutang) and credit (Piutang) tables
-- ============================================================
-- This migration adds dedicated tables for debt and credit management,
-- with workspace isolation for Indonesia (IDR) and Sri Lanka (LKR).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- debts
-- Records of money the user owes to creditors (Hutang)
-- ============================================================
create table debts (
  id uuid default uuid_generate_v4() primary key,
  workspace text not null check (workspace in ('indonesia', 'srilanka')),
  creditor_name text not null,
  amount numeric not null,
  remaining_amount numeric not null,
  status text not null default 'unpaid' check (status in ('unpaid', 'partial', 'paid')),
  due_date date,
  note text,
  icon text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  foreign key (workspace) references profiles (workspace) on delete cascade
);

-- ============================================================
-- debt_payments
-- Individual payment records for each debt (Riwayat Pembayaran)
-- ============================================================
create table debt_payments (
  id uuid default uuid_generate_v4() primary key,
  debt_id uuid references debts(id) on delete cascade,
  workspace text not null check (workspace in ('indonesia', 'srilanka')),
  amount numeric not null,
  payment_date date not null,
  note text,
  created_at timestamp with time zone default now() not null
);

-- ============================================================
-- credits
-- Records of money owed to the user by debtors (Piutang)
-- ============================================================
create table credits (
  id uuid default uuid_generate_v4() primary key,
  workspace text not null check (workspace in ('indonesia', 'srilanka')),
  debtor_name text not null,
  amount numeric not null,
  remaining_amount numeric not null,
  status text not null default 'unreceived' check (status in ('unreceived', 'partial', 'received')),
  due_date date,
  note text,
  icon text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  foreign key (workspace) references profiles (workspace) on delete cascade
);

-- ============================================================
-- credit_receipts
-- Individual receipt records for each credit (Riwayat Penerimaan)
-- ============================================================
create table credit_receipts (
  id uuid default uuid_generate_v4() primary key,
  credit_id uuid references credits(id) on delete cascade,
  workspace text not null check (workspace in ('indonesia', 'srilanka')),
  amount numeric not null,
  receipt_date date not null,
  note text,
  created_at timestamp with time zone default now() not null
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table debts enable row level security;
alter table debt_payments enable row level security;
alter table credits enable row level security;
alter table credit_receipts enable row level security;

create policy "Allow all on debts" on debts
  for all using (true) with check (true);

create policy "Allow all on debt_payments" on debt_payments
  for all using (true) with check (true);

create policy "Allow all on credits" on credits
  for all using (true) with check (true);

create policy "Allow all on credit_receipts" on credit_receipts
  for all using (true) with check (true);

-- ============================================================
-- Indexes for performance
-- ============================================================
create index debts_workspace_idx on debts (workspace);
create index debts_status_idx on debts (status);
create index debts_due_date_idx on debts (due_date);
create index debts_workspace_status_idx on debts (workspace, status);

create index debt_payments_debt_id_idx on debt_payments (debt_id);
create index debt_payments_workspace_idx on debt_payments (workspace);

create index credits_workspace_idx on credits (workspace);
create index credits_status_idx on credits (status);
create index credits_due_date_idx on credits (due_date);
create index credits_workspace_status_idx on credits (workspace, status);

create index credit_receipts_credit_id_idx on credit_receipts (credit_id);
create index credit_receipts_workspace_idx on credit_receipts (workspace);

-- ============================================================
-- Triggers for automatic updated_at
-- ============================================================
create trigger debts_updated_at
  before update on debts for each row
  execute function update_updated_at_column();

create trigger credits_updated_at
  before update on credits for each row
  execute function update_updated_at_column();
