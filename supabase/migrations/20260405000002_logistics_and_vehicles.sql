-- Migration: Logistics and Vehicles
-- Timestamp: 20260405000002

-- Vehicles
create table vehicles (
  id uuid default gen_random_uuid() primary key,
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
  id uuid default gen_random_uuid() primary key,
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
  id uuid default gen_random_uuid() primary key,
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
