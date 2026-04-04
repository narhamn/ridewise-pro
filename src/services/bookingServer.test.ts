import { describe, it, expect } from 'vitest';
import { processBookingOnServer, BookingRequest } from './bookingServer';
import { User, Schedule, Route, RoutePoint, Discount, TaxConfig, Booking } from '@/types/shuttle';

describe('Booking Server Service (Secure Calculation)', () => {
  const mockData = {
    users: [{ id: 'u1', name: 'Test User' }] as User[],
    schedules: [{ id: 's1', routeId: 'r1', vehicleId: 'v1', departureTime: '10:00' }] as Schedule[],
    routes: [{ id: 'r1', name: 'Test Route', rayon: 'A' }] as Route[],
    routePoints: [
      { id: 'p1', routeId: 'r1', name: 'Start', price: 50000, order: 1 }
    ] as RoutePoint[],
    discounts: [
      { code: 'PROMO10', type: 'percentage', value: 10, isActive: true, minBookingAmount: 10000, usageCount: 0, usageLimit: 10, startDate: '2020-01-01', endDate: '2030-12-31' }
    ] as Discount[],
    taxConfigs: [{ id: 't1', name: 'PPN', rate: 0.1, isActive: true }] as TaxConfig[],
    existingBookings: [] as Booking[]
  };

  it('should calculate final price on server and ignore client input', () => {
    const request: BookingRequest = {
      userId: 'u1',
      scheduleId: 's1',
      pickupPointId: 'p1',
      seatNumber: 5,
      promoCode: 'PROMO10',
      bookingType: 'scheduled'
    };

    const response = processBookingOnServer(request, mockData as any);

    expect(response.success).toBe(true);
    // Calculation:
    // Base Price from pickup point: 50000
    // Discount 10%: 5000
    // Subtotal: 45000
    // Tax 10%: 4500
    // Final Price: 49500
    expect(response.booking?.price).toBe(49500);
    
    // Check that there's no way to pass 'price' in the request (Type safety check)
    // @ts-expect-error - Price should not be allowed in request
    const illegalRequest: BookingRequest = { ...request, price: 1000 };
    const response2 = processBookingOnServer(illegalRequest, mockData as any);
    expect(response2.booking?.price).toBe(49500); // Still 49500, not 1000
  });

  it('should reject booking if seat is already taken', () => {
    const dataWithBooking = {
      ...mockData,
      existingBookings: [{ scheduleId: 's1', seatNumber: 5, status: 'confirmed' }] as Booking[]
    };

    const request: BookingRequest = {
      userId: 'u1',
      scheduleId: 's1',
      pickupPointId: 'p1',
      seatNumber: 5,
      bookingType: 'scheduled'
    };

    const response = processBookingOnServer(request, dataWithBooking as any);
    expect(response.success).toBe(false);
    expect(response.error).toBe("Kursi sudah dipesan");
  });

  it('should apply rate limiting', () => {
    const request: BookingRequest = {
      userId: 'limiter-user',
      scheduleId: 's1',
      pickupPointId: 'p1',
      seatNumber: 1,
      bookingType: 'scheduled'
    };

    // Call 5 times (allowed)
    for (let i = 0; i < 5; i++) {
      processBookingOnServer(request, mockData as any);
    }

    // 6th call should fail
    const response = processBookingOnServer(request, mockData as any);
    expect(response.success).toBe(false);
    expect(response.error).toContain("Rate Limited");
  });
});
