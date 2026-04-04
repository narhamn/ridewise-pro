import { Route, RoutePoint, Schedule, Driver, Vehicle, Booking } from '@/types/shuttle';

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

export const dummyRoutePoints: RoutePoint[] = [
  // r1: Hermes → Kualanamu (38km, Rp2/m)
  { id: 'rp1', routeId: 'r1', code: 'J1', name: 'Terminal Hermes', order: 1, lat: 3.5952, lng: 98.6722, distanceFromPrevious: 0, cumulativeDistance: 0, price: 0 },
  { id: 'rp2', routeId: 'r1', code: 'J2', name: 'Simpang Pos', order: 2, lat: 3.5880, lng: 98.6850, distanceFromPrevious: 5000, cumulativeDistance: 5000, price: 10000 },
  { id: 'rp3', routeId: 'r1', code: 'J3', name: 'Tembung', order: 3, lat: 3.5750, lng: 98.7200, distanceFromPrevious: 8000, cumulativeDistance: 13000, price: 26000 },
  { id: 'rp4', routeId: 'r1', code: 'J4', name: 'Batang Kuis', order: 4, lat: 3.5400, lng: 98.7600, distanceFromPrevious: 12000, cumulativeDistance: 25000, price: 50000 },
  { id: 'rp5', routeId: 'r1', code: 'J5', name: 'Bandara Kualanamu', order: 5, lat: 3.6422, lng: 98.8853, distanceFromPrevious: 13000, cumulativeDistance: 38000, price: 76000 },
  // r2: Amplas → Parapat (175km, Rp1.5/m)
  { id: 'rp6', routeId: 'r2', code: 'J1', name: 'Terminal Amplas', order: 1, lat: 3.5570, lng: 98.6950, distanceFromPrevious: 0, cumulativeDistance: 0, price: 0 },
  { id: 'rp7', routeId: 'r2', code: 'J2', name: 'Lubuk Pakam', order: 2, lat: 3.5550, lng: 98.8570, distanceFromPrevious: 25000, cumulativeDistance: 25000, price: 37500 },
  { id: 'rp8', routeId: 'r2', code: 'J3', name: 'Tebing Tinggi', order: 3, lat: 3.3283, lng: 99.1627, distanceFromPrevious: 50000, cumulativeDistance: 75000, price: 112500 },
  { id: 'rp9', routeId: 'r2', code: 'J4', name: 'Seribu Dolok', order: 4, lat: 2.9000, lng: 99.0500, distanceFromPrevious: 55000, cumulativeDistance: 130000, price: 195000 },
  { id: 'rp10', routeId: 'r2', code: 'J5', name: 'Parapat', order: 5, lat: 2.6640, lng: 98.9380, distanceFromPrevious: 45000, cumulativeDistance: 175000, price: 262500 },
  // r3: Pinang Baris → Sibolga (280km, Rp1.2/m)
  { id: 'rp11', routeId: 'r3', code: 'J1', name: 'Pinang Baris', order: 1, lat: 3.6100, lng: 98.6350, distanceFromPrevious: 0, cumulativeDistance: 0, price: 0 },
  { id: 'rp12', routeId: 'r3', code: 'J2', name: 'Binjai', order: 2, lat: 3.6000, lng: 98.4850, distanceFromPrevious: 22000, cumulativeDistance: 22000, price: 26400 },
  { id: 'rp13', routeId: 'r3', code: 'J3', name: 'Sibolga', order: 3, lat: 1.7427, lng: 98.7792, distanceFromPrevious: 258000, cumulativeDistance: 280000, price: 336000 },
  // r4: Medan → Berastagi (66km, Rp2/m)
  { id: 'rp14', routeId: 'r4', code: 'J1', name: 'Medan Center', order: 1, lat: 3.5952, lng: 98.6722, distanceFromPrevious: 0, cumulativeDistance: 0, price: 0 },
  { id: 'rp15', routeId: 'r4', code: 'J2', name: 'Pancur Batu', order: 2, lat: 3.4700, lng: 98.5700, distanceFromPrevious: 30000, cumulativeDistance: 30000, price: 60000 },
  { id: 'rp16', routeId: 'r4', code: 'J3', name: 'Berastagi', order: 3, lat: 3.1972, lng: 98.5081, distanceFromPrevious: 36000, cumulativeDistance: 66000, price: 132000 },
  // r5: Medan → P. Siantar (128km, Rp1.5/m)
  { id: 'rp17', routeId: 'r5', code: 'J1', name: 'Medan Timur', order: 1, lat: 3.6000, lng: 98.7000, distanceFromPrevious: 0, cumulativeDistance: 0, price: 0 },
  { id: 'rp18', routeId: 'r5', code: 'J2', name: 'P. Siantar', order: 2, lat: 2.9540, lng: 99.0478, distanceFromPrevious: 128000, cumulativeDistance: 128000, price: 192000 },
  // r6: Medan → Rantau Prapat (285km, Rp1.2/m)
  { id: 'rp19', routeId: 'r6', code: 'J1', name: 'Medan Barat', order: 1, lat: 3.5900, lng: 98.6600, distanceFromPrevious: 0, cumulativeDistance: 0, price: 0 },
  { id: 'rp20', routeId: 'r6', code: 'J2', name: 'Rantau Prapat', order: 2, lat: 2.0975, lng: 99.8308, distanceFromPrevious: 285000, cumulativeDistance: 285000, price: 342000 },
  // r7: Medan → Padang Sidempuan (390km, Rp1/m)
  { id: 'rp21', routeId: 'r7', code: 'J1', name: 'Medan Selatan', order: 1, lat: 3.5800, lng: 98.6800, distanceFromPrevious: 0, cumulativeDistance: 0, price: 0 },
  { id: 'rp22', routeId: 'r7', code: 'J2', name: 'Padang Sidempuan', order: 2, lat: 1.3790, lng: 99.2718, distanceFromPrevious: 390000, cumulativeDistance: 390000, price: 390000 },
  // r8: Medan → Kisaran (195km, Rp1.3/m)
  { id: 'rp23', routeId: 'r8', code: 'J1', name: 'Medan Utara', order: 1, lat: 3.6200, lng: 98.6700, distanceFromPrevious: 0, cumulativeDistance: 0, price: 0 },
  { id: 'rp24', routeId: 'r8', code: 'J2', name: 'Kisaran', order: 2, lat: 2.9833, lng: 99.6167, distanceFromPrevious: 195000, cumulativeDistance: 195000, price: 253500 },
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
  { id: 'b1', userId: 'u1', userName: 'Siti Aminah', scheduleId: 's1', routeId: 'r1', routeName: 'Hermes → Kualanamu', pickupPointId: 'rp1', pickupPointName: 'Terminal Hermes', seatNumber: 1, price: 76000, status: 'confirmed', bookingDate: '2026-04-02', departureTime: '07:00', paymentStatus: 'paid', paymentMethod: 'bank_transfer' },
  { id: 'b2', userId: 'u1', userName: 'Siti Aminah', scheduleId: 's1', routeId: 'r1', routeName: 'Hermes → Kualanamu', pickupPointId: 'rp2', pickupPointName: 'Simpang Pos', seatNumber: 3, price: 76000, status: 'confirmed', bookingDate: '2026-04-02', departureTime: '07:00', paymentStatus: 'paid', paymentMethod: 'ewallet' },
  { id: 'b3', userId: 'u2', userName: 'Rudi Hartono', scheduleId: 's1', routeId: 'r1', routeName: 'Hermes → Kualanamu', pickupPointId: 'rp3', pickupPointName: 'Tembung', seatNumber: 5, price: 76000, status: 'confirmed', bookingDate: '2026-04-02', departureTime: '07:00', paymentStatus: 'paid', paymentMethod: 'qris' },
  { id: 'b4', userId: 'u3', userName: 'Linda Susanti', scheduleId: 's4', routeId: 'r2', routeName: 'Amplas → Parapat', pickupPointId: 'rp6', pickupPointName: 'Terminal Amplas', seatNumber: 2, price: 262500, status: 'confirmed', bookingDate: '2026-04-02', departureTime: '08:00', paymentStatus: 'pending', paymentMethod: null },
  { id: 'b5', userId: 'u1', userName: 'Siti Aminah', scheduleId: 's6', routeId: 'r3', routeName: 'Pinang Baris → Sibolga', pickupPointId: 'rp11', pickupPointName: 'Pinang Baris', seatNumber: 1, price: 336000, status: 'completed', bookingDate: '2026-04-01', departureTime: '06:00', paymentStatus: 'paid', paymentMethod: 'bank_transfer' },
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
