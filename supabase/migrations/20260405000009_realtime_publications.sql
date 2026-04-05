-- Migration: Realtime Publications
-- Timestamp: 20260405000009

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
