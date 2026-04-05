import { BaseRepository } from './BaseRepository';
import { Booking, BookingRequest, BookingResponse } from '@/types/shuttle';
import { supabase } from '@/lib/supabase';

export class BookingRepository extends BaseRepository<Booking> {
  constructor() {
    super('bookings');
  }

  async getByUser(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data as Booking[];
  }

  async createSecureBooking(request: BookingRequest): Promise<BookingResponse> {
    // Ideally this would be an RPC or Edge Function for atomicity
    const { data, error } = await supabase.rpc('process_booking', { 
      p_user_id: request.userId,
      p_schedule_id: request.scheduleId,
      p_seat_number: request.seatNumber,
      p_discount_code: request.discountCode
    });

    if (error) {
      console.error('Booking RPC error:', error);
      return { success: false, error: error.message };
    }

    return data as BookingResponse;
  }
}

export const bookingRepository = new BookingRepository();
