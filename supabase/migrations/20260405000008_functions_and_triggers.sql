-- Migration: Functions and Triggers
-- Timestamp: 20260405000008

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

-- Trigger to create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', 'New User'), 
    new.email, 
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  return new;
end;
$$ language 'plpgsql' security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
