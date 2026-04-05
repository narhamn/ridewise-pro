// @ts-nocheck - Deno context
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { schedule_id, user_id, seat_number } = await req.json()

    // 1. Validate seat availability
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('schedule_id', schedule_id)
      .eq('seat_number', seat_number)
      .eq('status', 'confirmed')
      .maybeSingle()

    if (existingBooking) {
      return new Response(
        JSON.stringify({ error: 'Kursi sudah dipesan' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 2. Perform booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        schedule_id,
        user_id,
        seat_number,
        status: 'confirmed',
        payment_status: 'pending'
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    return new Response(
      JSON.stringify({ success: true, booking }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
