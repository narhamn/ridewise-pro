-- RIDEWISE-PRO SUPABASE DATABASE SCHEMA & RLS POLICIES

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
create type user_role as enum ('customer', 'driver', 'admin');
create type verification_status as enum ('pending', 'approved', 'rejected');
create type trip_status as enum ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'expired', 'failed');
create type payment_method as enum ('bank_transfer', 'ewallet', 'qris');
create type vehicle_status as enum ('active', 'maintenance', 'inactive');
create type driver_status as enum ('online', 'offline', 'active', 'inactive');

-- 3. TABLES

-- Profiles (linked to auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  phone text,
  role user_role not null default 'customer',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Drivers
create table drivers (
  id uuid references profiles(id) on delete cascade primary key,
  license_number text,
  ktp_number text,
  status driver_status default 'offline',
  verification_status verification_status default 'pending',
  rating decimal default 0,
  total_trips integer default 0,
  join_date date default current_date,
  birth_date date,
  address text,
  profile_image text,
  vehicle_details jsonb, -- {plateNumber, brandModel, year, color, vin, engineNumber}
  rejection_reason text,
  updated_at timestamp with time zone default now()
);

-- Vehicles
create table vehicles (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  plate_number text not null unique,
  capacity integer not null,
  type text not null,
  status vehicle_status default 'active',
  brand text,
  model text,
  year integer,
  color text,
  vin text,
  engine_number text,
  fuel_type text,
  transmission text,
  stnk_number text,
  stnk_expiry_date date,
  photos jsonb, -- {exterior, interior, dashboard}
  last_service_date date,
  next_service_date date,
  mileage integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Routes
create table routes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  rayon text not null check (rayon in ('A', 'B', 'C', 'D')),
  origin text not null,
  destination text not null,
  distance_meters integer not null,
  price_per_meter decimal not null,
  price decimal not null,
  road_condition_multiplier decimal default 1,
  vehicle_type_multiplier decimal default 1,
  created_at timestamp with time zone default now()
);

-- Route Points
create table route_points (
  id uuid default uuid_generate_v4() primary key,
  route_id uuid references routes(id) on delete cascade,
  code text not null,
  name text not null,
  "order" integer not null,
  lat decimal not null,
  lng decimal not null,
  distance_from_previous integer not null,
  cumulative_distance integer not null,
  distance_to_destination integer not null,
  price decimal not null
);

-- Schedules
create table schedules (
  id uuid default uuid_generate_v4() primary key,
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
  id uuid default uuid_generate_v4() primary key,
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

-- Notifications
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  title text not null,
  message text not null,
  type text not null, -- booking, payment, trip, system
  read boolean default false,
  timestamp timestamp with time zone default now()
);

-- Driver Locations (Realtime)
create table driver_locations (
  driver_id uuid references drivers(id) primary key,
  latitude decimal not null,
  longitude decimal not null,
  altitude decimal,
  accuracy decimal,
  heading decimal,
  speed decimal,
  updated_at timestamp with time zone default now()
);

-- 4. RLS POLICIES (Example for some tables)

alter table profiles enable row level security;
alter table drivers enable row level security;
alter table routes enable row level security;
alter table schedules enable row level security;
alter table bookings enable row level security;

-- Profiles: Users see themselves, Admins see all
create policy "Users see own profile" on profiles for select using (auth.uid() = id);
create policy "Admins see all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Routes: Everyone can see
create policy "Public can see routes" on routes for select using (true);
create policy "Admins manage routes" on routes all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Bookings: Customers see own, Admins see all
create policy "Users see own bookings" on bookings for select using (auth.uid() = user_id);
create policy "Admins see all bookings" on bookings for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 5. FUNCTIONS & TRIGGERS
-- Trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_profiles_updated_at before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_drivers_updated_at before update on drivers for each row execute procedure update_updated_at_column();
create trigger update_vehicles_updated_at before update on vehicles for each row execute procedure update_updated_at_column();
