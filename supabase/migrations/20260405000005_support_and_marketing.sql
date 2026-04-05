-- Migration: Support and Marketing
-- Timestamp: 20260405000005

-- Discounts
create table discounts (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  type text check (type in ('percentage', 'fixed')) not null,
  value decimal not null,
  min_booking_amount decimal default 0,
  max_discount_amount decimal,
  start_date date not null,
  end_date date not null,
  usage_limit integer not null,
  usage_count integer default 0,
  is_active boolean default true,
  description text,
  created_at timestamp with time zone default now()
);

-- Tax Configs
create table tax_configs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  rate decimal not null,
  region text default 'Nasional',
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Tickets (Support)
create table tickets (
  id uuid default gen_random_uuid() primary key,
  ticket_number text not null unique,
  title text not null,
  description text not null,
  category ticket_category not null,
  priority ticket_priority default 'medium',
  status ticket_status default 'open',
  reporter_id uuid references profiles(id),
  attachments jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Ticket Comments
create table ticket_comments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references tickets(id) on delete cascade,
  sender_id uuid references profiles(id),
  message text not null,
  attachments jsonb default '[]'::jsonb,
  timestamp timestamp with time zone default now()
);
