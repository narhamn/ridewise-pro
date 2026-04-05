-- Migration: Booking RPC and Transactions
-- Timestamp: 20260405000011

-- 1. Create a function to process booking atomically
create or replace function process_booking(
  p_user_id uuid,
  p_schedule_id uuid,
  p_seat_number integer,
  p_discount_code text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_schedule record;
  v_route record;
  v_point record;
  v_discount record;
  v_booking_id uuid;
  v_final_price decimal;
  v_tax_rate decimal := 0.11; -- Default 11% PPN
  v_discount_amount decimal := 0;
begin
  -- 1. Get Schedule & Route Info
  select s.*, r.price, r.name as route_name 
  into v_schedule 
  from schedules s
  join routes r on s.route_id = r.id
  where s.id = p_schedule_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Jadwal tidak ditemukan');
  end if;

  -- 2. Check Seat Availability (Atomic Check)
  if exists (
    select 1 from bookings 
    where schedule_id = p_schedule_id 
    and seat_number = p_seat_number 
    and status != 'cancelled'
  ) then
    return jsonb_build_object('success', false, 'error', 'Kursi sudah dipesan');
  end if;

  -- 3. Calculate Base Price
  v_final_price := v_schedule.price;

  -- 4. Apply Discount if exists
  if p_discount_code is not null then
    select * into v_discount 
    from discounts 
    where code = p_discount_code 
    and is_active = true 
    and usage_count < usage_limit
    and start_date <= now()
    and end_date >= now();

    if found then
      if v_discount.type = 'percentage' then
        v_discount_amount := v_final_price * (v_discount.value / 100);
        if v_discount.max_discount_amount is not null then
          v_discount_amount := least(v_discount_amount, v_discount.max_discount_amount);
        end if;
      else
        v_discount_amount := v_discount.value;
      end if;

      v_final_price := v_final_price - v_discount_amount;
      
      -- Update usage count
      update discounts set usage_count = usage_count + 1 where id = v_discount.id;
    end if;
  end if;

  -- 5. Add Tax
  v_final_price := v_final_price * (1 + v_tax_rate);

  -- 6. Insert Booking
  insert into bookings (
    user_id,
    schedule_id,
    seat_number,
    price,
    status,
    payment_status,
    booking_type,
    user_name,
    route_name,
    departure_time
  )
  values (
    p_user_id,
    p_schedule_id,
    p_seat_number,
    v_final_price,
    'confirmed',
    'pending',
    'scheduled',
    (select name from profiles where id = p_user_id),
    v_schedule.route_name,
    v_schedule.departure_time
  )
  returning id into v_booking_id;

  -- 7. Audit Log
  insert into audit_logs (entity_type, entity_id, action, new_value, changed_by)
  values ('booking', v_booking_id, 'create', jsonb_build_object('price', v_final_price, 'seat', p_seat_number), p_user_id);

  return jsonb_build_object(
    'success', true, 
    'booking_id', v_booking_id, 
    'price', v_final_price
  );

exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;
