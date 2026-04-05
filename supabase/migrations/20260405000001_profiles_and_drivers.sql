-- Migration: Profiles and Drivers
-- Timestamp: 20260405000001

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
  id uuid default gen_random_uuid() primary key,
  registration_id uuid references drivers(id) on delete cascade,
  status verification_status not null,
  changed_by uuid references profiles(id),
  timestamp timestamp with time zone default now(),
  reason text
);
