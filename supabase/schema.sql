-- ============================================================
-- FinanceOS Supabase Database Schema
-- ============================================================
-- Tables: profiles, transactions, bills, money_pockets, budgets, notifications, accounts
-- Each table is scoped to a workspace ('indonesia' | 'srilanka')
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- Workspace constraint helper
-- ============================================================
-- All workspace-scoped tables use text columns with this check
-- to enforce valid workspace values: 'indonesia' or 'srilanka'

-- ============================================================
-- profiles
-- Per-workspace financial summary / balance information
-- ============================================================
create table profiles (
  id uuid default uuid_generate_v4() primary key,
  workspace text not null unique check (workspace in ('indonesia', 'srilanka')),
  available_balance numeric not null default 0,
  income numeric not null default 0,
  expenses numeric not null default 0,
  remaining numeric not null default 0,
  safe_spending numeric not null default 0,
  total_balance numeric not null default 0,
  currency text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- ============================================================
-- transactions
-- All financial transactions (income and expense) per workspace
-- ============================================================
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  workspace text not null check (workspace in ('indonesia', 'srilanka')),
  description text not null,
  category text not null,
  date date not null,
  amount numeric not null,
  icon text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  foreign key (workspace) references profiles (workspace) on delete cascade
);

-- ============================================================
-- bills
-- Upcoming bills with unpaid/paid status per workspace
-- ============================================================
create table bills (
  id uuid default uuid_generate_v4() primary key,
  workspace text not null check (workspace in ('indonesia', 'srilanka')),
  title text not null,
  amount numeric not null,
  currency text not null,
  due_date date not null,
  status text not null default 'unpaid' check (status in ('unpaid', 'paid')),
  icon text,
  provider text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  foreign key (workspace) references profiles (workspace) on delete cascade
);

-- ============================================================
-- money_pockets
-- Savings goals / pockets per workspace
-- ============================================================
create table money_pockets (
  id uuid default uuid_generate_v4() primary key,
  workspace text not null check (workspace in ('indonesia', 'srilanka')),
  name text not null,
  icon text not null,
  current_amount numeric not null default 0,
  target_amount numeric not null,
  status text not null check (status in ('on-track', 'behind', 'completed', 'just-started')),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  foreign key (workspace) references profiles (workspace) on delete cascade
);

-- ============================================================
-- budgets
-- Monthly budget categories per workspace
-- ============================================================
create table budgets (
  id uuid default uuid_generate_v4() primary key,
  workspace text not null check (workspace in ('indonesia', 'srilanka')),
  category text not null,
  monthly_limit numeric not null default 0,
  current_spent numeric not null default 0,
  color text,
  icon text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  foreign key (workspace) references profiles (workspace) on delete cascade
);

-- ============================================================
-- notifications
-- System notifications per workspace
-- ============================================================
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  workspace text not null check (workspace in ('indonesia', 'srilanka')),
  type text not null check (type in ('expense', 'income', 'bill', 'transfer', 'savings', 'system', 'low_balance')),
  title text not null,
  description text not null,
  amount numeric,
  currency_code text,
  "timestamp" timestamp with time zone not null default now(),
  priority text not null check (priority in ('low', 'medium', 'high')),
  read boolean not null default false,
  icon text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  foreign key (workspace) references profiles (workspace) on delete cascade
);

-- ============================================================
-- accounts
-- Financial accounts per workspace (checking, savings, cash, digital)
-- ============================================================
create table accounts (
  id uuid default uuid_generate_v4() primary key,
  workspace text not null check (workspace in ('indonesia', 'srilanka')),
  name text not null,
  type text not null,
  icon text not null,
  account_number text not null,
  balance numeric not null default 0,
  status text not null check (status in ('active', 'primary')),
  last_updated date not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  foreign key (workspace) references profiles (workspace) on delete cascade
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table bills enable row level security;
alter table money_pockets enable row level security;
alter table budgets enable row level security;
alter table notifications enable row level security;
alter table accounts enable row level security;

-- Policy: Allow full access to authenticated users
-- (Adjust these policies based on your auth requirements)
create policy "Allow all on profiles" on profiles
  for all using (true) with check (true);

create policy "Allow all on transactions" on transactions
  for all using (true) with check (true);

create policy "Allow all on bills" on bills
  for all using (true) with check (true);

create policy "Allow all on money_pockets" on money_pockets
  for all using (true) with check (true);

create policy "Allow all on budgets" on budgets
  for all using (true) with check (true);

create policy "Allow all on notifications" on notifications
  for all using (true) with check (true);

create policy "Allow all on accounts" on accounts
  for all using (true) with check (true);

-- ============================================================
-- Indexes for performance
-- ============================================================
-- profiles
create index profiles_workspace_idx on profiles (workspace);

-- transactions
create index transactions_workspace_idx on transactions (workspace);
create index transactions_date_idx on transactions (date);
create index transactions_category_idx on transactions (category);

-- bills
create index bills_workspace_idx on bills (workspace);
create index bills_status_idx on bills (status);
create index bills_due_date_idx on bills (due_date);
create index bills_workspace_status_idx on bills (workspace, status);

-- money_pockets
create index pockets_workspace_idx on money_pockets (workspace);

-- budgets
create index budgets_workspace_idx on budgets (workspace);
create index budgets_category_idx on budgets (category);
create index budgets_workspace_category_idx on budgets (workspace, category);

-- notifications
create index notifications_workspace_idx on notifications (workspace);
create index notifications_read_idx on notifications (read);
create index notifications_timestamp_idx on notifications ("timestamp");

-- accounts
create index accounts_workspace_idx on accounts (workspace);
create index accounts_status_idx on accounts (status);
create index accounts_last_updated_idx on accounts (last_updated);

-- ============================================================
-- Triggers for automatic updated_at
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger profiles_updated_at
  before update on profiles for each row
  execute function update_updated_at_column();

create trigger transactions_updated_at
  before update on transactions for each row
  execute function update_updated_at_column();

create trigger bills_updated_at
  before update on bills for each row
  execute function update_updated_at_column();

create trigger money_pockets_updated_at
  before update on money_pockets for each row
  execute function update_updated_at_column();

create trigger budgets_updated_at
  before update on budgets for each row
  execute function update_updated_at_column();

create trigger notifications_updated_at
  before update on notifications for each row
  execute function update_updated_at_column();

create trigger accounts_updated_at
  before update on accounts for each row
  execute function update_updated_at_column();
