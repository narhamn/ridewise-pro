-- Migration: Audit and Notifications
-- Timestamp: 20260405000006

-- Audit Logs (Pricing & Security)
create table audit_logs (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null, -- route, discount, tax, user
  entity_id uuid not null,
  action text not null, -- create, update, delete
  old_value jsonb,
  new_value jsonb,
  changed_by uuid references profiles(id),
  change_date timestamp with time zone default now()
);

-- Notifications
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  title text not null,
  message text not null,
  type text not null, -- booking, payment, trip, system
  read boolean default false,
  timestamp timestamp with time zone default now()
);
