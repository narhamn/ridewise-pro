-- Migration: Schedules and Bookings
-- Timestamp: 20260405000003

-- Schedules
create table schedules (
  id uuid default gen_random_uuid() primary key,
  route_id uuid references routes(id),
  vehicle_id uuid references vehicles(id),
  driver_id uuid references drivers(id),
  departure_date date not null,
  departure_time time not null,
  status trip_status default 'scheduled',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Bookings
create table bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  schedule_id uuid references schedules(id),
  pickup_point_id uuid references route_points(id),
  seat_number integer not null,
  price decimal not null,
  status text check (status in ('confirmed', 'completed', 'cancelled')) default 'confirmed',
  payment_status payment_status default 'pending',
  payment_method payment_method,
  booking_type text default 'scheduled',
  checked_in boolean default false,
  booking_date timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);
