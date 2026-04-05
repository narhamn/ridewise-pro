-- Migration: Ride Requests and Tracking
-- Timestamp: 20260405000004

-- Ride Requests (Realtime Ride-Hailing)
create table ride_requests (
  id uuid default gen_random_uuid() primary key,
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
