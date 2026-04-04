import { Route, RoutePoint, Schedule, Driver, Vehicle, Booking, RayonPricing } from '@/types/shuttle';

export const defaultRayonPricing: RayonPricing[] = [
  { rayon: 'A', pricePerMeter: 2, label: 'Rayon A (Dalam Kota)' },
  { rayon: 'B', pricePerMeter: 1.5, label: 'Rayon B (Antar Kota Dekat)' },
  { rayon: 'C', pricePerMeter: 1.2, label: 'Rayon C (Antar Kota Sedang)' },
  { rayon: 'D', pricePerMeter: 1, label: 'Rayon D (Antar Kota Jauh)' },
];

export const dummyRoutes: Route[] = [
  { id: 'r1', name: 'Hermes → Kualanamu', rayon: 'A', origin: 'Hermes', destination: 'Kualanamu', distanceMeters: 38000, pricePerMeter: 2, price: 76000 },
  { id: 'r2', name: 'Amplas → Parapat', rayon: 'A', origin: 'Amplas', destination: 'Parapat', distanceMeters: 175000, pricePerMeter: 1.5, price: 262500 },
  { id: 'r3', name: 'Pinang Baris → Sibolga', rayon: 'B', origin: 'Pinang Baris', destination: 'Sibolga', distanceMeters: 280000, pricePerMeter: 1.2, price: 336000 },
  { id: 'r4', name: 'Medan → Berastagi', rayon: 'B', origin: 'Medan', destination: 'Berastagi', distanceMeters: 66000, pricePerMeter: 2, price: 132000 },
  { id: 'r5', name: 'Medan → Pematang Siantar', rayon: 'C', origin: 'Medan', destination: 'Pematang Siantar', distanceMeters: 128000, pricePerMeter: 1.5, price: 192000 },
  { id: 'r6', name: 'Medan → Rantau Prapat', rayon: 'C', origin: 'Medan', destination: 'Rantau Prapat', distanceMeters: 285000, pricePerMeter: 1.2, price: 342000 },
  { id: 'r7', name: 'Medan → Padang Sidempuan', rayon: 'D', origin: 'Medan', destination: 'Padang Sidempuan', distanceMeters: 390000, pricePerMeter: 1, price: 390000 },
  { id: 'r8', name: 'Medan → Kisaran', rayon: 'D', origin: 'Medan', destination: 'Kisaran', distanceMeters: 195000, pricePerMeter: 1.3, price: 253500 },
];

// Helper to calculate distanceToDestination and price
const pt = (id: string, routeId: string, code: string, name: string, order: number, lat: number, lng: number, distFromPrev: number, cumDist: number, totalDist: number, ppm: number): RoutePoint => ({
  id, routeId, code, name, order, lat, lng,
  distanceFromPrevious: distFromPrev,
  cumulativeDistance: cumDist,
  distanceToDestination: totalDist - cumDist,
  price: Math.round((totalDist - cumDist) * ppm),
});

export const dummyRoutePoints: RoutePoint[] = [
  // r1: Hermes → Kualanamu (38km, Rp2/m) — price = distToDestination * 2
  pt('rp1', 'r1', 'J1', 'Terminal Hermes', 1, 3.5952, 98.6722, 0, 0, 38000, 2),           // 38000m → Rp76.000
  pt('rp2', 'r1', 'J2', 'Simpang Pos', 2, 3.5880, 98.6850, 5000, 5000, 38000, 2),          // 33000m → Rp66.000
  pt('rp3', 'r1', 'J3', 'Tembung', 3, 3.5750, 98.7200, 8000, 13000, 38000, 2),             // 25000m → Rp50.000
  pt('rp4', 'r1', 'J4', 'Batang Kuis', 4, 3.5400, 98.7600, 12000, 25000, 38000, 2),        // 13000m → Rp26.000
  pt('rp5', 'r1', 'J5', 'Bandara Kualanamu', 5, 3.6422, 98.8853, 13000, 38000, 38000, 2),  // 0m → Rp0 (tujuan)

  // r2: Amplas → Parapat (175km, Rp1.5/m)
  pt('rp6', 'r2', 'J1', 'Terminal Amplas', 1, 3.5570, 98.6950, 0, 0, 175000, 1.5),          // 175000m → Rp262.500
  pt('rp7', 'r2', 'J2', 'Lubuk Pakam', 2, 3.5550, 98.8570, 25000, 25000, 175000, 1.5),      // 150000m → Rp225.000
  pt('rp8', 'r2', 'J3', 'Tebing Tinggi', 3, 3.3283, 99.1627, 50000, 75000, 175000, 1.5),    // 100000m → Rp150.000
  pt('rp9', 'r2', 'J4', 'Seribu Dolok', 4, 2.9000, 99.0500, 55000, 130000, 175000, 1.5),    // 45000m → Rp67.500
  pt('rp10', 'r2', 'J5', 'Parapat', 5, 2.6640, 98.9380, 45000, 175000, 175000, 1.5),        // 0m → Rp0

  // r3: Pinang Baris → Sibolga (280km, Rp1.2/m)
  pt('rp11', 'r3', 'J1', 'Pinang Baris', 1, 3.6100, 98.6350, 0, 0, 280000, 1.2),            // 280000m → Rp336.000
  pt('rp12', 'r3', 'J2', 'Binjai', 2, 3.6000, 98.4850, 22000, 22000, 280000, 1.2),           // 258000m → Rp309.600
  pt('rp13', 'r3', 'J3', 'Sibolga', 3, 1.7427, 98.7792, 258000, 280000, 280000, 1.2),        // 0m → Rp0

  // r4: Medan → Berastagi (66km, Rp2/m)
  pt('rp14', 'r4', 'J1', 'Medan Center', 1, 3.5952, 98.6722, 0, 0, 66000, 2),               // 66000m → Rp132.000
  pt('rp15', 'r4', 'J2', 'Pancur Batu', 2, 3.4700, 98.5700, 30000, 30000, 66000, 2),        // 36000m → Rp72.000
  pt('rp16', 'r4', 'J3', 'Berastagi', 3, 3.1972, 98.5081, 36000, 66000, 66000, 2),          // 0m → Rp0

  // r5: Medan → P. Siantar (128km, Rp1.5/m)
  pt('rp17', 'r5', 'J1', 'Medan Timur', 1, 3.6000, 98.7000, 0, 0, 128000, 1.5),            // 128000m → Rp192.000
  pt('rp18', 'r5', 'J2', 'P. Siantar', 2, 2.9540, 99.0478, 128000, 128000, 128000, 1.5),   // 0m → Rp0

  // r6: Medan → Rantau Prapat (285km, Rp1.2/m)
  pt('rp19', 'r6', 'J1', 'Medan Barat', 1, 3.5900, 98.6600, 0, 0, 285000, 1.2),            // 285000m → Rp342.000
  pt('rp20', 'r6', 'J2', 'Rantau Prapat', 2, 2.0975, 99.8308, 285000, 285000, 285000, 1.2),// 0m → Rp0

  // r7: Medan → Padang Sidempuan (390km, Rp1/m)
  pt('rp21', 'r7', 'J1', 'Medan Selatan', 1, 3.5800, 98.6800, 0, 0, 390000, 1),            // 390000m → Rp390.000
  pt('rp22', 'r7', 'J2', 'Padang Sidempuan', 2, 1.3790, 99.2718, 390000, 390000, 390000, 1),// 0m → Rp0

  // r8: Medan → Kisaran (195km, Rp1.3/m)
  pt('rp23', 'r8', 'J1', 'Medan Utara', 1, 3.6200, 98.6700, 0, 0, 195000, 1.3),            // 195000m → Rp253.500
  pt('rp24', 'r8', 'J2', 'Kisaran', 2, 2.9833, 99.6167, 195000, 195000, 195000, 1.3),      // 0m → Rp0
];

export const dummyDrivers: Driver[] = [
  { id: 'd1', name: 'Budi Santoso', email: 'budi@shuttle.com', phone: '081234567890', licenseNumber: 'SIM-001', status: 'active' },
  { id: 'd2', name: 'Ahmad Ridwan', email: 'ahmad@shuttle.com', phone: '081234567891', licenseNumber: 'SIM-002', status: 'active' },
  { id: 'd3', name: 'Dedi Kurniawan', email: 'dedi@shuttle.com', phone: '081234567892', licenseNumber: 'SIM-003', status: 'active' },
  { id: 'd4', name: 'Eko Prasetyo', email: 'eko@shuttle.com', phone: '081234567893', licenseNumber: 'SIM-004', status: 'inactive' },
  { id: 'd5', name: 'Fajar Nugroho', email: 'fajar@shuttle.com', phone: '081234567894', licenseNumber: 'SIM-005', status: 'active' },
];

export const dummyVehicles: Vehicle[] = [
  { id: 'v1', name: 'Hiace Commuter', plateNumber: 'BK 1234 AB', capacity: 12, type: 'Minibus', status: 'active' },
  { id: 'v2', name: 'Elf Long', plateNumber: 'BK 5678 CD', capacity: 10, type: 'Minibus', status: 'active' },
  { id: 'v3', name: 'Avanza', plateNumber: 'BK 9012 EF', capacity: 8, type: 'MPV', status: 'active' },
  { id: 'v4', name: 'Innova Reborn', plateNumber: 'BK 3456 GH', capacity: 8, type: 'MPV', status: 'maintenance' },
  { id: 'v5', name: 'Hiace Premio', plateNumber: 'BK 7890 IJ', capacity: 12, type: 'Minibus', status: 'active' },
];

export const dummySchedules: Schedule[] = [
  { id: 's1', routeId: 'r1', departureTime: '07:00', vehicleId: 'v1', driverId: 'd1', status: 'scheduled' },
  { id: 's2', routeId: 'r1', departureTime: '10:00', vehicleId: 'v2', driverId: 'd2', status: 'scheduled' },
  { id: 's3', routeId: 'r1', departureTime: '14:00', vehicleId: 'v3', driverId: 'd3', status: 'scheduled' },
  { id: 's4', routeId: 'r2', departureTime: '08:00', vehicleId: 'v5', driverId: 'd5', status: 'scheduled' },
  { id: 's5', routeId: 'r2', departureTime: '13:00', vehicleId: 'v1', driverId: 'd1', status: 'scheduled' },
  { id: 's6', routeId: 'r3', departureTime: '06:00', vehicleId: 'v2', driverId: 'd2', status: 'departed' },
  { id: 's7', routeId: 'r4', departureTime: '09:00', vehicleId: 'v3', driverId: 'd3', status: 'scheduled' },
  { id: 's8', routeId: 'r5', departureTime: '07:30', vehicleId: 'v5', driverId: 'd5', status: 'boarding' },
  { id: 's9', routeId: 'r6', departureTime: '11:00', vehicleId: 'v1', driverId: null, status: 'scheduled' },
  { id: 's10', routeId: 'r7', departureTime: '05:00', vehicleId: 'v2', driverId: null, status: 'scheduled' },
];

export const dummyBookings: Booking[] = [
  { id: 'b1', userId: 'u1', userName: 'Siti Aminah', scheduleId: 's1', routeId: 'r1', routeName: 'Hermes → Kualanamu', pickupPointId: 'rp1', pickupPointName: 'Terminal Hermes', seatNumber: 1, price: 76000, status: 'confirmed', bookingDate: '2026-04-02', departureTime: '07:00', paymentStatus: 'paid', paymentMethod: 'bank_transfer', bookingType: 'scheduled' },
  { id: 'b2', userId: 'u1', userName: 'Siti Aminah', scheduleId: 's1', routeId: 'r1', routeName: 'Hermes → Kualanamu', pickupPointId: 'rp2', pickupPointName: 'Simpang Pos', seatNumber: 3, price: 66000, status: 'confirmed', bookingDate: '2026-04-02', departureTime: '07:00', paymentStatus: 'paid', paymentMethod: 'ewallet', bookingType: 'scheduled' },
  { id: 'b3', userId: 'u2', userName: 'Rudi Hartono', scheduleId: 's1', routeId: 'r1', routeName: 'Hermes → Kualanamu', pickupPointId: 'rp3', pickupPointName: 'Tembung', seatNumber: 5, price: 50000, status: 'confirmed', bookingDate: '2026-04-02', departureTime: '07:00', paymentStatus: 'paid', paymentMethod: 'qris', bookingType: 'scheduled' },
  { id: 'b4', userId: 'u3', userName: 'Linda Susanti', scheduleId: 's4', routeId: 'r2', routeName: 'Amplas → Parapat', pickupPointId: 'rp6', pickupPointName: 'Terminal Amplas', seatNumber: 2, price: 262500, status: 'confirmed', bookingDate: '2026-04-02', departureTime: '08:00', paymentStatus: 'pending', paymentMethod: null, bookingType: 'scheduled' },
  { id: 'b5', userId: 'u1', userName: 'Siti Aminah', scheduleId: 's6', routeId: 'r3', routeName: 'Pinang Baris → Sibolga', pickupPointId: 'rp11', pickupPointName: 'Pinang Baris', seatNumber: 1, price: 336000, status: 'completed', bookingDate: '2026-04-01', departureTime: '06:00', paymentStatus: 'paid', paymentMethod: 'bank_transfer', bookingType: 'scheduled' },
];

export const generateSeats = (vehicleId: string): { seatNumber: number; row: number; column: number }[] => {
  const vehicle = dummyVehicles.find(v => v.id === vehicleId);
  if (!vehicle) return [];
  const seats: { seatNumber: number; row: number; column: number }[] = [];
  const cols = vehicle.capacity <= 8 ? 2 : 3;
  const rows = Math.ceil(vehicle.capacity / cols);
  let num = 1;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (num <= vehicle.capacity) {
        seats.push({ seatNumber: num, row: r, column: c });
        num++;
      }
    }
  }
  return seats;
};

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};
