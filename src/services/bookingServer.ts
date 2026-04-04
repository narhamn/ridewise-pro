/**
 * Mock Booking Server Service
 * Mensimulasikan logika backend untuk validasi dan kalkulasi harga terpusat.
 * Mencegah manipulasi harga dari client-side.
 */

import { Booking, Schedule, Route, RoutePoint, Discount, TaxConfig, User } from '@/types/shuttle';
import { calculateFinalPrice } from '@/lib/pricing';

export interface BookingRequest {
  userId: string;
  scheduleId: string;
  pickupPointId: string;
  seatNumber: number;
  promoCode?: string;
  bookingType: 'scheduled' | 'realtime';
  // CATATAN: Tidak ada field 'price' di sini. Harga dihitung secara eksklusif di server.
}

export interface BookingResponse {
  success: boolean;
  booking?: Booking;
  error?: string;
  calculationDetails?: any;
}

// Simple Rate Limiting State (Mock)
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();
const MAX_REQUESTS_PER_MINUTE = 5;

/**
 * Validasi dan Proses Pembuatan Booking di "Server"
 */
export const processBookingOnServer = (
  request: BookingRequest,
  contextData: {
    users: User[],
    schedules: Schedule[],
    routes: Route[],
    routePoints: RoutePoint[],
    discounts: Discount[],
    taxConfigs: TaxConfig[],
    existingBookings: Booking[]
  }
): BookingResponse => {
  const { userId, scheduleId, pickupPointId, seatNumber, promoCode, bookingType } = request;

  // 1. Rate Limiting Check
  const now = Date.now();
  const userRate = rateLimitMap.get(userId) || { count: 0, lastReset: now };
  if (now - userRate.lastReset > 60000) {
    userRate.count = 0;
    userRate.lastReset = now;
  }
  userRate.count++;
  rateLimitMap.set(userId, userRate);

  if (userRate.count > MAX_REQUESTS_PER_MINUTE) {
    return { success: false, error: "Terlalu banyak permintaan. Silakan coba lagi nanti (Rate Limited)." };
  }

  // 2. Input Validation (Integrity Check)
  const user = contextData.users.find(u => u.id === userId) || { name: 'Guest' };
  const schedule = contextData.schedules.find(s => s.id === scheduleId);
  if (!schedule) return { success: false, error: "Jadwal tidak valid" };

  const route = contextData.routes.find(r => r.id === schedule.routeId);
  if (!route) return { success: false, error: "Rute tidak ditemukan" };

  const pickupPoint = contextData.routePoints.find(p => p.id === pickupPointId);
  if (!pickupPoint) return { success: false, error: "Titik penjemputan tidak valid" };

  // Check seat availability
  const isSeatTaken = contextData.existingBookings.some(b => 
    b.scheduleId === scheduleId && 
    b.seatNumber === seatNumber && 
    b.status !== 'cancelled'
  );
  if (isSeatTaken) return { success: false, error: "Kursi sudah dipesan" };

  // 3. Centralized Price Calculation (Server-Side Logic)
  // Logic: Base price is derived from pickup point price (which already includes route multipliers)
  const baseAmount = pickupPoint.price;
  
  let appliedDiscount: Discount | undefined;
  if (promoCode) {
    appliedDiscount = contextData.discounts.find(d => 
      d.code.toUpperCase() === promoCode.toUpperCase() && 
      d.isActive &&
      new Date() >= new Date(d.startDate) &&
      new Date() <= new Date(d.endDate) &&
      d.usageCount < d.usageLimit &&
      baseAmount >= d.minBookingAmount
    );
  }

  const activeTax = contextData.taxConfigs.find(t => t.isActive);
  
  // RE-CALCULATE EVERYTHING FROM SCRATCH
  const calculation = calculateFinalPrice(1, baseAmount, {
    discountRate: appliedDiscount?.type === 'percentage' ? appliedDiscount.value / 100 : 0,
    discountFixed: appliedDiscount?.type === 'fixed' ? appliedDiscount.value : 0,
    maxDiscount: appliedDiscount?.maxDiscountAmount,
    taxRate: activeTax?.rate || 0,
  });

  // 4. Create Immutable Booking Record
  const newBooking: Booking = {
    id: `b-srv-${Date.now()}`,
    userId,
    userName: user.name || 'User',
    scheduleId,
    routeId: route.id,
    routeName: route.name,
    pickupPointId,
    pickupPointName: pickupPoint.name,
    seatNumber,
    price: calculation.finalPrice, // HASIL KALKULASI SERVER
    status: 'confirmed',
    bookingDate: new Date().toISOString().split('T')[0],
    departureTime: schedule.departureTime,
    paymentStatus: 'pending',
    paymentMethod: null,
    bookingType,
  };

  // 5. Audit Logging (Mock)
  console.info(`[SERVER AUDIT] Booking Created: ${newBooking.id} | User: ${userId} | Final Price: ${newBooking.price} | Promo: ${promoCode || 'None'}`);

  return { 
    success: true, 
    booking: newBooking,
    calculationDetails: calculation 
  };
};
