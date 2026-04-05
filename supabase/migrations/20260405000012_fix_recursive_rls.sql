-- Migration: Fix Recursive RLS and Add Role Helper
-- Timestamp: 20260405000012

-- 1. Create a security definer function to check roles without recursion
-- This bypasses RLS for the internal check
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

-- 2. Drop existing problematic policies
drop policy if exists "Profiles: Admin view all" on profiles;
drop policy if exists "Profiles: Admin manage" on profiles;
drop policy if exists "Drivers: Admin view all" on drivers;
drop policy if exists "Drivers: Admin manage" on drivers;
drop policy if exists "Routes: Admin manage" on routes;
drop policy if exists "RoutePoints: Admin manage" on route_points;
drop policy if exists "Bookings: Admin view all" on bookings;
drop policy if exists "DriverLocations: Admin view all" on driver_locations;
drop policy if exists "Tickets: Admin manage all" on tickets;
drop policy if exists "TicketHistory: Admin manage" on ticket_history;

-- 3. Re-create policies using the helper function

-- Profiles
create policy "Profiles: Admin view all" on profiles for select using (public.get_user_role(auth.uid()) = 'admin');
create policy "Profiles: Admin manage" on profiles for all using (public.get_user_role(auth.uid()) = 'admin');

-- Drivers
create policy "Drivers: Admin view all" on drivers for select using (public.get_user_role(auth.uid()) = 'admin');
create policy "Drivers: Admin manage" on drivers for all using (public.get_user_role(auth.uid()) = 'admin');

-- Routes & Points
create policy "Routes: Admin manage" on routes for all using (public.get_user_role(auth.uid()) = 'admin');
create policy "RoutePoints: Admin manage" on route_points for all using (public.get_user_role(auth.uid()) = 'admin');

-- Bookings
create policy "Bookings: Admin view all" on bookings for select using (public.get_user_role(auth.uid()) = 'admin');

-- Driver Locations
create policy "DriverLocations: Admin view all" on driver_locations for select using (public.get_user_role(auth.uid()) = 'admin');

-- Tickets
create policy "Tickets: Admin manage all" on tickets for all using (public.get_user_role(auth.uid()) = 'admin');

-- Ticket History
create policy "TicketHistory: Admin manage" on ticket_history for all using (public.get_user_role(auth.uid()) = 'admin');
