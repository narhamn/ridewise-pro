import {
  Route,
  RoutePoint,
  Schedule,
  Driver,
  Vehicle,
  Booking,
  RayonPricing,
  PickupPoint,
  Rayon,
  RouteSequence,
  ActivityLog,
} from '@/types/shuttle';

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

// Helper: today, tomorrow, day after
const todayStr = new Date().toISOString().split('T')[0];
const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const dayAfterStr = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

export const dummySchedules: Schedule[] = [
  { id: 's1', routeId: 'r1', departureDate: todayStr, departureTime: '07:00', vehicleId: 'v1', driverId: 'd1', status: 'scheduled' },
  { id: 's2', routeId: 'r1', departureDate: todayStr, departureTime: '10:00', vehicleId: 'v2', driverId: 'd2', status: 'scheduled' },
  { id: 's3', routeId: 'r1', departureDate: tomorrowStr, departureTime: '14:00', vehicleId: 'v3', driverId: 'd3', status: 'scheduled' },
  { id: 's4', routeId: 'r2', departureDate: todayStr, departureTime: '08:00', vehicleId: 'v5', driverId: 'd5', status: 'scheduled' },
  { id: 's5', routeId: 'r2', departureDate: tomorrowStr, departureTime: '13:00', vehicleId: 'v1', driverId: 'd1', status: 'scheduled' },
  { id: 's6', routeId: 'r3', departureDate: todayStr, departureTime: '06:00', vehicleId: 'v2', driverId: 'd2', status: 'departed' },
  { id: 's7', routeId: 'r4', departureDate: dayAfterStr, departureTime: '09:00', vehicleId: 'v3', driverId: 'd3', status: 'scheduled' },
  { id: 's8', routeId: 'r5', departureDate: todayStr, departureTime: '07:30', vehicleId: 'v5', driverId: 'd5', status: 'boarding' },
  { id: 's9', routeId: 'r6', departureDate: tomorrowStr, departureTime: '11:00', vehicleId: 'v1', driverId: null, status: 'scheduled' },
  { id: 's10', routeId: 'r7', departureDate: dayAfterStr, departureTime: '05:00', vehicleId: 'v2', driverId: null, status: 'scheduled' },
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

// ========== Pickup Points Data ==========

export const dummyPickupPoints: PickupPoint[] = [
  // Rayon A (Dalam Kota)
  {
    id: 'pk1',
    code: 'PK-A-001',
    name: 'Terminal Hermes',
    rayon: 'A',
    address: 'Jl. Gatot Subroto No. 1',
    city: 'Medan',
    district: 'Medan Helvetia',
    lat: 3.5952,
    lng: 98.6722,
    phone: '061-4516543',
    contactPerson: 'Pak Hendra',
    isActive: true,
    description: 'Terminal utama di pusat kota',
    estimatedWaitTime: 10,
    maxCapacity: 50,
    facilities: ['WiFi', 'Toilet', 'Mushola', 'Kantin'],
    operatingHours: { open: '05:00', close: '22:00' },
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
    createdBy: 'admin1',
    updatedBy: 'admin1',
  },
  {
    id: 'pk2',
    code: 'PK-A-002',
    name: 'Simpang Pos',
    rayon: 'A',
    address: 'Jl. Sisingamangaraja No. 245',
    city: 'Medan',
    district: 'Medan Sunggal',
    lat: 3.5880,
    lng: 98.6850,
    phone: '061-7863425',
    contactPerson: 'Ibu Siti',
    isActive: true,
    description: 'Titik jemput di area Simpang Pos',
    estimatedWaitTime: 5,
    maxCapacity: 30,
    facilities: ['WiFi', 'Toilet'],
    operatingHours: { open: '06:00', close: '21:00' },
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
    createdBy: 'admin1',
    updatedBy: 'admin1',
  },
  {
    id: 'pk3',
    code: 'PK-A-003',
    name: 'Tembung',
    rayon: 'A',
    address: 'Jl. Jamin Ginting KM 10',
    city: 'Medan',
    district: 'Medan Kota',
    lat: 3.5750,
    lng: 98.7200,
    phone: '061-5483729',
    contactPerson: 'Pak Budi',
    isActive: true,
    description: 'Titik jemput Tembung',
    estimatedWaitTime: 8,
    maxCapacity: 25,
    facilities: ['Toilet', 'Mushola'],
    operatingHours: { open: '05:30', close: '21:30' },
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
    createdBy: 'admin1',
    updatedBy: 'admin1',
  },
  {
    id: 'pk4',
    code: 'PK-A-004',
    name: 'Batang Kuis',
    rayon: 'A',
    address: 'Jl. Batang Kuis No. 567',
    city: 'Medan',
    district: 'Batang Kuis',
    lat: 3.5400,
    lng: 98.7600,
    phone: '061-6234521',
    contactPerson: 'Pak Andi',
    isActive: true,
    description: 'Terminal Batang Kuis',
    estimatedWaitTime: 7,
    maxCapacity: 35,
    facilities: ['WiFi', 'Toilet', 'Kantin', 'Mushola'],
    operatingHours: { open: '06:00', close: '20:00' },
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
    createdBy: 'admin1',
    updatedBy: 'admin1',
  },
  {
    id: 'pk5',
    code: 'PK-A-005',
    name: 'Bandara Kualanamu',
    rayon: 'A',
    address: 'Jl. Bandara Kualanamu KM 38',
    city: 'Medan',
    district: 'Deli Serdang',
    lat: 3.6422,
    lng: 98.8853,
    phone: '061-6565656',
    contactPerson: 'Customer Service',
    isActive: true,
    description: 'Terminal Bandara Internasional Kualanamu',
    estimatedWaitTime: 15,
    maxCapacity: 100,
    facilities: ['WiFi', 'Toilet', 'Mushola', 'Kantin', 'Lounge'],
    operatingHours: { open: '04:00', close: '23:59' },
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
    createdBy: 'admin1',
    updatedBy: 'admin1',
  },
  // Rayon B (Antar Kota Dekat)
  {
    id: 'pk6',
    code: 'PK-B-001',
    name: 'Terminal Amplas',
    rayon: 'B',
    address: 'Jln. Amplas No. 100',
    city: 'Medan',
    district: 'Medan Amplas',
    lat: 3.5570,
    lng: 98.6950,
    phone: '061-7541263',
    contactPerson: 'Pak Ridho',
    isActive: true,
    description: 'Terminal Amplas untuk rute regional',
    estimatedWaitTime: 10,
    maxCapacity: 40,
    facilities: ['WiFi', 'Toilet', 'Mushola'],
    operatingHours: { open: '05:00', close: '21:00' },
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
    createdBy: 'admin1',
    updatedBy: 'admin1',
  },
  {
    id: 'pk7',
    code: 'PK-B-002',
    name: 'Lubuk Pakam',
    rayon: 'B',
    address: 'Jln. Medan-Tebing Tinggi KM 45',
    city: 'Lubuk Pakam',
    district: 'Deli Serdang',
    lat: 3.5550,
    lng: 98.8570,
    phone: '0621-24681',
    contactPerson: 'Ibu Lina',
    isActive: true,
    description: 'Titik jemput Lubuk Pakam',
    estimatedWaitTime: 8,
    maxCapacity: 20,
    facilities: ['Toilet'],
    operatingHours: { open: '06:00', close: '20:00' },
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
    createdBy: 'admin1',
    updatedBy: 'admin1',
  },
  {
    id: 'pk8',
    code: 'PK-B-003',
    name: 'Tebing Tinggi',
    rayon: 'B',
    address: 'Jln. Ahmad Yani No. 78',
    city: 'Tebing Tinggi',
    district: 'Tebing Tinggi',
    lat: 3.3283,
    lng: 99.1627,
    phone: '0623-325081',
    contactPerson: 'Pak Tarno',
    isActive: true,
    description: 'Terminal Tebing Tinggi',
    estimatedWaitTime: 10,
    maxCapacity: 45,
    facilities: ['WiFi', 'Toilet', 'Mushola', 'Kantin'],
    operatingHours: { open: '05:30', close: '20:30' },
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
    createdBy: 'admin1',
    updatedBy: 'admin1',
  },
  {
    id: 'pk9',
    code: 'PK-B-004',
    name: 'Pancur Batu',
    rayon: 'B',
    address: 'Jln. Medan-Berastagi KM 30',
    city: 'Pancur Batu',
    district: 'Deli Serdang',
    lat: 3.4700,
    lng: 98.5700,
    phone: '061-8765432',
    contactPerson: 'Pak Syaiful',
    isActive: true,
    description: 'Titik istirahat Pancur Batu',
    estimatedWaitTime: 5,
    maxCapacity: 15,
    facilities: ['Toilet', 'Warung'],
    operatingHours: { open: '06:00', close: '19:00' },
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
    createdBy: 'admin1',
    updatedBy: 'admin1',
  },
  // Rayon C & D
  {
    id: 'pk10',
    code: 'PK-C-001',
    name: 'Pematang Siantar',
    rayon: 'C',
    address: 'Jln. Merdeka No. 123',
    city: 'Pematang Siantar',
    district: 'Pematang Siantar',
    lat: 2.9540,
    lng: 99.0478,
    phone: '0621-51234',
    contactPerson: 'Ibu Yuni',
    isActive: true,
    description: 'Terminal Pematang Siantar',
    estimatedWaitTime: 10,
    maxCapacity: 50,
    facilities: ['WiFi', 'Toilet', 'Mushola', 'Kantin'],
    operatingHours: { open: '05:00', close: '20:00' },
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
    createdBy: 'admin1',
    updatedBy: 'admin1',
  },
  {
    id: 'pk11',
    code: 'PK-D-001',
    name: 'Padang Sidempuan',
    rayon: 'D',
    address: 'Jln. Sudirman No. 456',
    city: 'Padang Sidempuan',
    district: 'Padang Sidempuan',
    lat: 1.3790,
    lng: 99.2718,
    phone: '0634-21234',
    contactPerson: 'Pak Muhammad',
    isActive: true,
    description: 'Terminal Padang Sidempuan',
    estimatedWaitTime: 15,
    maxCapacity: 60,
    facilities: ['WiFi', 'Toilet', 'Mushola', 'Kantin', 'Hotel'],
    operatingHours: { open: '05:00', close: '21:00' },
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
    createdBy: 'admin1',
    updatedBy: 'admin1',
  },
];

// ========== Rayons Data ==========

export const dummyRayons: Rayon[] = [
  {
    id: 'rayon-a',
    code: 'A',
    name: 'Rayon A - Dalam Kota',
    label: 'Dalam Kota (Medan)',
    description: 'Area dalam kota Medan dan sekitarnya',
    pricePerMeter: 2,
    coverage: 'Medan dan radius 40 km',
    pickupPointCount: 5,
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'rayon-b',
    code: 'B',
    name: 'Rayon B - Antar Kota Dekat',
    label: 'Antar Kota Dekat',
    description: 'Area antar kota dengan jarak dekat (40-100 km)',
    pricePerMeter: 1.5,
    coverage: 'Tebing Tinggi, Lubuk Pakam, Deli Serdang',
    pickupPointCount: 4,
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'rayon-c',
    code: 'C',
    name: 'Rayon C - Antar Kota Sedang',
    label: 'Antar Kota Sedang',
    description: 'Area antar kota dengan jarak sedang (100-250 km)',
    pricePerMeter: 1.2,
    coverage: 'Pematang Siantar, Sibolga, Rantau Prapat',
    pickupPointCount: 1,
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'rayon-d',
    code: 'D',
    name: 'Rayon D - Antar Kota Jauh',
    label: 'Antar Kota Jauh',
    description: 'Area antar kota dengan jarak jauh (>250 km)',
    pricePerMeter: 1,
    coverage: 'Padang Sidempuan, Kisaran, Jambi',
    pickupPointCount: 1,
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-05T10:00:00Z',
  },
];

// ========== Route Sequences Data ==========

export const dummyRouteSequences: RouteSequence[] = [
  // Route 1: Hermes → Kualanamu
  { id: 'rs1', routeId: 'r1', pickupPointId: 'pk1', sequenceOrder: 1, estimatedTimeFromPrevious: 0, estimatedDistanceFromPrevious: 0, cumulativeTime: 0, cumulativeDistance: 0, price: 76000 },
  { id: 'rs2', routeId: 'r1', pickupPointId: 'pk2', sequenceOrder: 2, estimatedTimeFromPrevious: 12, estimatedDistanceFromPrevious: 10000, cumulativeTime: 12, cumulativeDistance: 10000, price: 56000 },
  { id: 'rs3', routeId: 'r1', pickupPointId: 'pk3', sequenceOrder: 3, estimatedTimeFromPrevious: 15, estimatedDistanceFromPrevious: 8000, cumulativeTime: 27, cumulativeDistance: 18000, price: 40000 },
  { id: 'rs4', routeId: 'r1', pickupPointId: 'pk4', sequenceOrder: 4, estimatedTimeFromPrevious: 20, estimatedDistanceFromPrevious: 12000, cumulativeTime: 47, cumulativeDistance: 30000, price: 16000 },
  { id: 'rs5', routeId: 'r1', pickupPointId: 'pk5', sequenceOrder: 5, estimatedTimeFromPrevious: 25, estimatedDistanceFromPrevious: 8000, cumulativeTime: 72, cumulativeDistance: 38000, price: 0 },
  // Route 2: Amplas → Parapat
  { id: 'rs6', routeId: 'r2', pickupPointId: 'pk6', sequenceOrder: 1, estimatedTimeFromPrevious: 0, estimatedDistanceFromPrevious: 0, cumulativeTime: 0, cumulativeDistance: 0, price: 262500 },
  { id: 'rs7', routeId: 'r2', pickupPointId: 'pk7', sequenceOrder: 2, estimatedTimeFromPrevious: 60, estimatedDistanceFromPrevious: 25000, cumulativeTime: 60, cumulativeDistance: 25000, price: 225000 },
  { id: 'rs8', routeId: 'r2', pickupPointId: 'pk8', sequenceOrder: 3, estimatedTimeFromPrevious: 90, estimatedDistanceFromPrevious: 50000, cumulativeTime: 150, cumulativeDistance: 75000, price: 150000 },
];

// ========== Activity Logs Data ==========

export const dummyActivityLogs: ActivityLog[] = [
  {
    id: 'log1',
    entityType: 'pickup_point',
    entityId: 'pk1',
    entityName: 'Terminal Hermes',
    action: 'create',
    changes: { name: { oldValue: null, newValue: 'Terminal Hermes' }, rayon: { oldValue: null, newValue: 'A' } },
    userId: 'admin1',
    userName: 'Administrator',
    timestamp: '2026-01-01T08:00:00Z',
    ipAddress: '192.168.1.1',
    details: 'Pickup point created successfully',
  },
  {
    id: 'log2',
    entityType: 'pickup_point',
    entityId: 'pk1',
    entityName: 'Terminal Hermes',
    action: 'update',
    changes: { contactPerson: { oldValue: 'Pak Hendra', newValue: 'Pak Hendra Wijaya' }, phone: { oldValue: '061-4516543', newValue: '061-4516543' } },
    userId: 'admin1',
    userName: 'Administrator',
    timestamp: '2026-04-01T10:30:00Z',
    ipAddress: '192.168.1.100',
    details: 'Contact person name updated',
  },
  {
    id: 'log3',
    entityType: 'rayon',
    entityId: 'rayon-a',
    entityName: 'Rayon A - Dalam Kota',
    action: 'update',
    changes: { pickupPointCount: { oldValue: 4, newValue: 5 } },
    userId: 'admin1',
    userName: 'Administrator',
    timestamp: '2026-04-02T14:00:00Z',
    ipAddress: '192.168.1.100',
    details: 'Pickup point count updated',
  },
  {
    id: 'log4',
    entityType: 'pickup_point',
    entityId: 'pk2',
    entityName: 'Simpang Pos',
    action: 'activate',
    changes: { isActive: { oldValue: false, newValue: true } },
    userId: 'admin1',
    userName: 'Administrator',
    timestamp: '2026-04-03T09:15:00Z',
    ipAddress: '192.168.1.100',
    details: 'Pickup point activated after maintenance',
  },
];

export const generateNewActivityLog = (
  entityType: ActivityLog['entityType'],
  entityId: string,
  entityName: string,
  action: ActivityLog['action'],
  changes: Record<string, { oldValue: any; newValue: any }>,
  userId: string,
  userName: string,
  details?: string,
): ActivityLog => ({
  id: `log${Date.now()}`,
  entityType,
  entityId,
  entityName,
  action,
  changes,
  userId,
  userName,
  timestamp: new Date().toISOString(),
  ipAddress: '192.168.1.100', // In real app, get from server
  details,
});
