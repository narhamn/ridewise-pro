-- Migration: RLS Policies
-- Timestamp: 20260405000007

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table drivers enable row level security;
alter table verification_logs enable row level security;
alter table vehicles enable row level security;
alter table routes enable row level security;
alter table route_points enable row level security;
alter table schedules enable row level security;
alter table bookings enable row level security;
alter table ride_requests enable row level security;
alter table discounts enable row level security;
alter table tax_configs enable row level security;
alter table audit_logs enable row level security;
alter table tickets enable row level security;
alter table ticket_comments enable row level security;
alter table notifications enable row level security;
alter table driver_locations enable row level security;

-- Profiles: Users see themselves, Admins see all
create policy "Profiles: View own" on profiles for select using (auth.uid() = id);
create policy "Profiles: Admin view all" on profiles for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Profiles: Admin manage" on profiles for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Drivers: Public see approved, Admins see all, Driver sees own
create policy "Drivers: Public view approved" on drivers for select using (verification_status = 'approved');
create policy "Drivers: Admin view all" on drivers for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Drivers: Own profile view" on drivers for select using (auth.uid() = id);
create policy "Drivers: Admin manage" on drivers for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Drivers: Update own location/status" on drivers for update using (auth.uid() = id);

-- Routes & Points: Everyone can view, Admins manage
create policy "Routes: Public view" on routes for select using (true);
create policy "Routes: Admin manage" on routes for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "RoutePoints: Public view" on route_points for select using (true);
create policy "RoutePoints: Admin manage" on route_points for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Bookings: Customers see own, Admins see all, Assigned drivers see related
create policy "Bookings: Customer view own" on bookings for select using (auth.uid() = user_id);
create policy "Bookings: Admin view all" on bookings for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Bookings: Driver view assigned" on bookings for select using (
  exists (
    select 1 from schedules 
    where schedules.id = bookings.schedule_id 
    and schedules.driver_id = auth.uid()
  )
);
create policy "Bookings: Customer insert own" on bookings for insert with check (auth.uid() = user_id);

-- Notifications: User view/update own
create policy "Notifications: View own" on notifications for select using (auth.uid() = user_id);
create policy "Notifications: Update own (mark as read)" on notifications for update using (auth.uid() = user_id);

-- Driver Locations: Admins see all, Customers see assigned drivers, Driver manage own
create policy "DriverLocations: Admin view all" on driver_locations for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "DriverLocations: Customer view assigned" on driver_locations for select using (
  exists (
    select 1 from bookings
    join schedules on bookings.schedule_id = schedules.id
    where schedules.driver_id = driver_locations.driver_id
    and bookings.user_id = auth.uid()
    and schedules.status in ('scheduled', 'boarding', 'departed')
  )
);
create policy "DriverLocations: Driver manage own" on driver_locations for all using (auth.uid() = driver_id);

-- Tickets: User manage own, Admin manage all
create policy "Tickets: User manage own" on tickets for all using (auth.uid() = reporter_id);
create policy "Tickets: Admin manage all" on tickets for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
