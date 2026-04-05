-- Migration: Schema Gaps and Refinements
-- Timestamp: 20260405000010

-- 1. Drivers Refinements
alter table drivers 
add column if not exists last_status_change timestamp with time zone,
add column if not exists submitted_at timestamp with time zone,
add column if not exists documents jsonb default '[]'::jsonb,
add column if not exists security jsonb default '{"twoFactorEnabled": false, "loginHistory": []}'::jsonb;

-- 2. Vehicles Refinements
alter table vehicles
add column if not exists created_by uuid references profiles(id),
add column if not exists stnk_owner_name text,
add column if not exists documents jsonb default '[]'::jsonb;

-- 3. Routes Refinements
alter table routes
add column if not exists distance_km decimal;

-- 4. Bookings Refinements (Cached fields for performance)
alter table bookings
add column if not exists user_name text,
add column if not exists route_name text,
add column if not exists pickup_point_name text,
add column if not exists departure_time time;

-- 5. Ride Requests Refinements
alter table ride_requests
add column if not exists user_name text;

-- 6. Notifications Refinements
alter table notifications
add column if not exists role user_role;

-- 7. Tickets Refinements
alter table tickets
add column if not exists reporter_name text,
add column if not exists reporter_email text,
add column if not exists reporter_phone text;

-- 8. Ticket Comments Refinements
alter table ticket_comments
add column if not exists sender_name text,
add column if not exists sender_role user_role;

-- 9. Ticket History Table
create table if not exists ticket_history (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references tickets(id) on delete cascade,
  status ticket_status not null,
  changed_by_name text, -- Name of user who changed it
  timestamp timestamp with time zone default now(),
  note text
);

-- Enable RLS for Ticket History
alter table ticket_history enable row level security;

create policy "TicketHistory: User view own" on ticket_history for select using (
  exists (
    select 1 from tickets where tickets.id = ticket_history.ticket_id and tickets.reporter_id = auth.uid()
  )
);

create policy "TicketHistory: Admin manage" on ticket_history for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
