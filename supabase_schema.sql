-- RIDEWISE-PRO SUPABASE DATABASE SCHEMA & RLS POLICIES

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "postgis"; -- For location-based queries

-- 2. ENUMS
create type user_role as enum ('customer', 'driver', 'admin');
create type verification_status as enum ('pending', 'approved', 'rejected');
create type trip_status as enum ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'expired', 'failed');
create type payment_method as enum ('bank_transfer', 'ewallet', 'qris');
create type vehicle_status as enum ('active', 'maintenance', 'inactive');
create type driver_status as enum ('online', 'offline', 'active', 'inactive');
create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type ticket_category as enum ('payment', 'driver_report', 'route', 'app_issue', 'other');
create type ticket_priority as enum ('low', 'medium', 'high', 'critical');

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

-- Verification Logs
create table verification_logs (
  id uuid default uuid_generate_v4() primary key,
  registration_id uuid references drivers(id) on delete cascade,
  status verification_status not null,
  changed_by uuid references profiles(id),
  timestamp timestamp with time zone default now(),
  reason text
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

-- Ride Requests (Realtime Ride-Hailing)
create table ride_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  origin_lat decimal not null,
  origin_lng decimal not null,
  destination_lat decimal not null,
  destination_lng decimal not null,
  origin_address text,
  destination_address text,
  status text check (status in ('pending', 'accepted', 'rejected', 'cancelled')) default 'pending',
  driver_id uuid references drivers(id),
  price decimal not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Discounts
create table discounts (
  id uuid default uuid_generate_v4() primary key,
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
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  rate decimal not null,
  region text default 'Nasional',
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Audit Logs (Pricing & Security)
create table audit_logs (
  id uuid default uuid_generate_v4() primary key,
  entity_type text not null, -- route, discount, tax, user
  entity_id uuid not null,
  action text not null, -- create, update, delete
  old_value jsonb,
  new_value jsonb,
  changed_by uuid references profiles(id),
  change_date timestamp with time zone default now()
);

-- Tickets (Support)
create table tickets (
  id uuid default uuid_generate_v4() primary key,
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
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references tickets(id) on delete cascade,
  sender_id uuid references profiles(id),
  message text not null,
  attachments jsonb default '[]'::jsonb,
  timestamp timestamp with time zone default now()
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
  updated_at timestamp with time zone default now(),
  location_geog geography(POINT) -- PostGIS point for spatial queries
);

-- 4. RLS POLICIES

-- Helper function to get user role without recursion
create or replace function public.get_user_role(user_id uuid)
returns user_role
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role user_role;
begin
  select role into v_role from public.profiles where id = user_id;
  return v_role;
end;
$$;

-- Enable RLS on all tables
alter table profiles enable row level security;
... (lines 256-270) ...
alter table driver_locations enable row level security;

-- Profiles: Users see themselves, Admins see all
create policy "Profiles: View own" on profiles for select using (auth.uid() = id);
create policy "Profiles: Admin view all" on profiles for select using (public.get_user_role(auth.uid()) = 'admin');
create policy "Profiles: Admin manage" on profiles for all using (public.get_user_role(auth.uid()) = 'admin');

-- Drivers: Public see approved, Admins see all, Driver sees own
create policy "Drivers: Public view approved" on drivers for select using (verification_status = 'approved');
create policy "Drivers: Admin view all" on drivers for select using (public.get_user_role(auth.uid()) = 'admin');
create policy "Drivers: Own profile view" on drivers for select using (auth.uid() = id);
create policy "Drivers: Admin manage" on drivers for all using (public.get_user_role(auth.uid()) = 'admin');
create policy "Drivers: Update own location/status" on drivers for update using (auth.uid() = id);

-- Routes & Points: Everyone can view, Admins manage
create policy "Routes: Public view" on routes for select using (true);
create policy "Routes: Admin manage" on routes for all using (public.get_user_role(auth.uid()) = 'admin');
create policy "RoutePoints: Public view" on route_points for select using (true);
create policy "RoutePoints: Admin manage" on route_points for all using (public.get_user_role(auth.uid()) = 'admin');

-- Bookings: Customers see own, Admins see all, Assigned drivers see related
create policy "Bookings: Customer view own" on bookings for select using (auth.uid() = user_id);
create policy "Bookings: Admin view all" on bookings for select using (public.get_user_role(auth.uid()) = 'admin');
create policy "Bookings: Driver view assigned" on bookings for select using (
... (lines 304-313) ...
create policy "Bookings: Customer insert own" on bookings for insert with check (auth.uid() = user_id);

-- Notifications: User view/update own
create policy "Notifications: View own" on notifications for select using (auth.uid() = user_id);
create policy "Notifications: Update own (mark as read)" on notifications for update using (auth.uid() = user_id);

-- Driver Locations: Admins see all, Customers see assigned drivers, Driver manage own
create policy "DriverLocations: Admin view all" on driver_locations for select using (public.get_user_role(auth.uid()) = 'admin');
create policy "DriverLocations: Customer view assigned" on driver_locations for select using (
... (lines 319-327) ...
);
create policy "DriverLocations: Driver manage own" on driver_locations for all using (auth.uid() = driver_id);

-- Tickets: User manage own, Admin manage all
create policy "Tickets: User manage own" on tickets for all using (auth.uid() = reporter_id);
create policy "Tickets: Admin manage all" on tickets for all using (public.get_user_role(auth.uid()) = 'admin');

-- 5. FUNCTIONS & TRIGGERS

-- Update updated_at column
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
create trigger update_tickets_updated_at before update on tickets for each row execute procedure update_updated_at_column();

-- PostGIS: Automatically update location_geog point when lat/lng changes
create or replace function update_driver_geog()
returns trigger as $$
begin
    new.location_geog = st_setsrid(st_point(new.longitude, new.latitude), 4326)::geography;
    return new;
end;
$$ language 'plpgsql';

create trigger update_driver_locations_geog before insert or update on driver_locations for each row execute procedure update_driver_geog();

-- Notification Trigger: When booking created
create or replace function notify_booking_created()
returns trigger as $$
begin
    insert into notifications (user_id, title, message, type)
    values (new.user_id, 'Booking Berhasil', 'Booking Anda telah dikonfirmasi. Terima kasih telah menggunakan Ridewise.', 'booking');
    return new;
end;
$$ language 'plpgsql';

create trigger on_booking_created after insert on bookings for each row execute procedure notify_booking_created();

-- 6. REALTIME REPLICATION (Publications)
-- Enable realtime for key tables
begin;
  -- drop the publication if it exists
  drop publication if exists supabase_realtime;
  -- create the publication
  create publication supabase_realtime for table 
    schedules, 
    driver_locations, 
    notifications, 
    ride_requests,
    bookings;
commit;
