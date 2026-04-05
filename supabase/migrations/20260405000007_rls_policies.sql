-- Migration: RLS Policies
-- Timestamp: 20260405000007

-- 1. Helper function to get user role without recursion
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
... (lines 5-21) ...
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
... (lines 43-52) ...
create policy "Bookings: Customer insert own" on bookings for insert with check (auth.uid() = user_id);

-- Notifications: User view/update own
create policy "Notifications: View own" on notifications for select using (auth.uid() = user_id);
create policy "Notifications: Update own (mark as read)" on notifications for update using (auth.uid() = user_id);

-- Driver Locations: Admins see all, Customers see assigned drivers, Driver manage own
create policy "DriverLocations: Admin view all" on driver_locations for select using (public.get_user_role(auth.uid()) = 'admin');
create policy "DriverLocations: Customer view assigned" on driver_locations for select using (
... (lines 58-66) ...
);
create policy "DriverLocations: Driver manage own" on driver_locations for all using (auth.uid() = driver_id);

-- Tickets: User manage own, Admin manage all
create policy "Tickets: User manage own" on tickets for all using (auth.uid() = reporter_id);
create policy "Tickets: Admin manage all" on tickets for all using (public.get_user_role(auth.uid()) = 'admin');
