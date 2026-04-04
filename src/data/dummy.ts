import { Route, RoutePoint, Schedule, Driver, Vehicle, Booking, RayonPricing, Discount, TaxConfig, Ticket, DriverRegistration } from '@/types/shuttle';
import { calculateFinalPrice, formatPrice } from '@/lib/pricing';

export const dummyRegistrations: DriverRegistration[] = [
  {
    id: 'reg-1',
    name: 'Rizky Ramadhan',
    email: 'rizky.ramadhan@example.com',
    phoneNumber: '081299998888',
    licenseNumber: '1234-5678-901234',
    joinDate: '2024-04-03',
    rating: 0,
    totalTrips: 0,
    status: 'offline',
    verificationStatus: 'pending',
    address: 'Jl. Setiabudi No. 45, Medan',
    vehicleDetails: {
      plateNumber: 'BK 9999 RR',
      brandModel: 'Toyota Hiace Premium',
      year: 2023,
      color: 'Silver Metallic',
      verificationStatus: 'pending'
    },
    submittedAt: '2024-04-03T14:20:00Z',
    updatedAt: '2024-04-03T14:20:00Z',
    documents: [
      { id: 'd-1', type: 'KTP', status: 'pending', fileUrl: 'ktp-rizky.jpg', ocrData: { extractedText: 'RIZKY RAMADHAN', confidence: 0.95, fields: { name: 'RIZKY RAMADHAN', nik: '1201010101010001' } }, manipulationScore: 0.05 },
      { id: 'd-2', type: 'SIM', status: 'pending', fileUrl: 'sim-rizky.jpg', ocrData: { extractedText: 'SIM A', confidence: 0.92, fields: { type: 'SIM A', expiry: '2028-12-31' } }, manipulationScore: 0.02 },
      { id: 'd-3', type: 'STNK', status: 'pending', fileUrl: 'stnk-rizky.jpg', manipulationScore: 0.08 },
      { id: 'd-4', type: 'FOTO_DIRI', status: 'pending', fileUrl: 'selfie-rizky.jpg', manipulationScore: 0.01 }
    ],
    logs: [
      { id: 'l-1', registrationId: 'reg-1', status: 'pending', changedBy: 'System', timestamp: '2024-04-03T14:20:00Z', reason: 'Initial submission' }
    ]
  },
  {
    id: 'reg-2',
    name: 'Maya Saputri',
    email: 'maya.s@example.com',
    phoneNumber: '081377776666',
    licenseNumber: '5555-4444-333322',
    joinDate: '2024-04-01',
    rating: 0,
    totalTrips: 0,
    status: 'offline',
    verificationStatus: 'rejected',
    address: 'Jl. Gatot Subroto No. 88, Medan',
    vehicleDetails: {
      plateNumber: 'BK 7777 MS',
      brandModel: 'Isuzu Elf Giga',
      year: 2021,
      color: 'Putih',
      verificationStatus: 'rejected'
    },
    submittedAt: '2024-04-01T09:00:00Z',
    updatedAt: '2024-04-02T10:00:00Z',
    rejectionReason: 'Foto KTP tidak terbaca jelas dan SIM sudah kadaluwarsa.',
    documents: [
      { id: 'd-5', type: 'KTP', status: 'rejected', fileUrl: 'ktp-maya.jpg' },
      { id: 'd-6', type: 'SIM', status: 'rejected', fileUrl: 'sim-maya.jpg', expiryDate: '2023-12-31' }
    ],
    logs: [
      { id: 'l-2', registrationId: 'reg-2', status: 'pending', changedBy: 'System', timestamp: '2024-04-01T09:00:00Z' },
      { id: 'l-3', registrationId: 'reg-2', status: 'rejected', changedBy: 'Admin Ridewise', timestamp: '2024-04-02T10:00:00Z', reason: 'KTP blur & SIM expired' }
    ]
  }
];

export const dummyTickets: Ticket[] = [
  {
    id: 't1',
    ticketNumber: 'TKT-20240401-001',
    title: 'Gagal melakukan pembayaran via E-Wallet',
    description: 'Saya mencoba membayar tiket rute Hermes ke Kualanamu menggunakan e-wallet tetapi muncul error "Internal Server Error" terus menerus.',
    category: 'payment',
    priority: 'high',
    status: 'open',
    reporterId: 'u1',
    reporterName: 'Siti Aminah',
    reporterEmail: 'siti@example.com',
    reporterPhone: '081234567890',
    createdAt: '2024-04-01T08:30:00Z',
    updatedAt: '2024-04-01T08:30:00Z',
    attachments: ['payment_error_screenshot.png'],
    comments: [],
    history: [
      {
        id: 'h1',
        ticketId: 't1',
        status: 'open',
        changedBy: 'System',
        timestamp: '2024-04-01T08:30:00Z',
        note: 'Ticket created by user'
      }
    ]
  },
  {
    id: 't2',
    ticketNumber: 'TKT-20240402-002',
    title: 'Driver tidak menjemput di lokasi',
    description: 'Driver Budi Santoso tidak datang ke titik jemput Terminal Hermes padahal status sudah departed.',
    category: 'driver_report',
    priority: 'critical',
    status: 'in_progress',
    reporterId: 'u2',
    reporterName: 'Rudi Hartono',
    reporterEmail: 'rudi@example.com',
    reporterPhone: '081234567892',
    createdAt: '2024-04-02T10:15:00Z',
    updatedAt: '2024-04-02T11:00:00Z',
    attachments: [],
    comments: [
      {
        id: 'c1',
        ticketId: 't2',
        senderId: 'admin1',
        senderName: 'Admin Ridewise',
        senderRole: 'admin',
        message: 'Mohon maaf atas ketidaknyamanannya. Kami sedang menghubungi driver yang bersangkutan untuk klarifikasi.',
        timestamp: '2024-04-02T11:00:00Z'
      }
    ],
    history: [
      {
        id: 'h2',
        ticketId: 't2',
        status: 'open',
        changedBy: 'System',
        timestamp: '2024-04-02T10:15:00Z'
      },
      {
        id: 'h3',
        ticketId: 't2',
        status: 'in_progress',
        changedBy: 'Admin Ridewise',
        timestamp: '2024-04-02T11:00:00Z',
        note: 'Investigating with driver'
      }
    ]
  }
];

export const defaultRayonPricing: RayonPricing[] = [
  { rayon: 'A', pricePerMeter: 2, label: 'Rayon A (Dalam Kota)' },
  { rayon: 'B', pricePerMeter: 1.5, label: 'Rayon B (Antar Kota Dekat)' },
  { rayon: 'C', pricePerMeter: 1.2, label: 'Rayon C (Antar Kota Sedang)' },
  { rayon: 'D', pricePerMeter: 1, label: 'Rayon D (Antar Kota Jauh)' },
];

export const dummyDiscounts: Discount[] = [
  {
    id: 'promo1',
    code: 'DISKON10',
    type: 'percentage',
    value: 10,
    minBookingAmount: 50000,
    maxDiscountAmount: 20000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 100,
    usageCount: 10,
    isActive: true,
    description: 'Diskon 10% up to Rp 20.000'
  },
  {
    id: 'promo2',
    code: 'HEMAT5K',
    type: 'fixed',
    value: 5000,
    minBookingAmount: 30000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 500,
    usageCount: 50,
    isActive: true,
    description: 'Potongan harga Rp 5.000'
  },
  {
    id: 'promo3',
    code: 'PROMOEXPIRED',
    type: 'percentage',
    value: 50,
    minBookingAmount: 10000,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    usageLimit: 10,
    usageCount: 10,
    isActive: true,
    description: 'Promo sudah kedaluwarsa'
  }
];

export const defaultTaxConfigs: TaxConfig[] = [
  { id: 'tax1', name: 'PPN', rate: 0.11, region: 'Nasional', isActive: true },
];

export const dummyRoutes: Route[] = [
  { id: 'r1', name: 'Hermes → Kualanamu', rayon: 'A', origin: 'Hermes', destination: 'Kualanamu', distanceMeters: 38000, distanceKm: 38, pricePerMeter: 2, price: 76000, roadConditionMultiplier: 1, vehicleTypeMultiplier: 1 },
  { id: 'r2', name: 'Amplas → Parapat', rayon: 'A', origin: 'Amplas', destination: 'Parapat', distanceMeters: 175000, distanceKm: 175, pricePerMeter: 1.5, price: 262500, roadConditionMultiplier: 1.1, vehicleTypeMultiplier: 1 },
  { id: 'r3', name: 'Pinang Baris → Sibolga', rayon: 'B', origin: 'Pinang Baris', destination: 'Sibolga', distanceMeters: 280000, distanceKm: 280, pricePerMeter: 1.2, price: 336000, roadConditionMultiplier: 1.2, vehicleTypeMultiplier: 1 },
  { id: 'r4', name: 'Medan → Berastagi', rayon: 'B', origin: 'Medan', destination: 'Berastagi', distanceMeters: 66000, distanceKm: 66, pricePerMeter: 2, price: 132000, roadConditionMultiplier: 1.1, vehicleTypeMultiplier: 1 },
  { id: 'r5', name: 'Medan → Pematang Siantar', rayon: 'C', origin: 'Medan', destination: 'Pematang Siantar', distanceMeters: 128000, distanceKm: 128, pricePerMeter: 1.5, price: 192000, roadConditionMultiplier: 1, vehicleTypeMultiplier: 1 },
  { id: 'r6', name: 'Medan → Rantau Prapat', rayon: 'C', origin: 'Medan', destination: 'Rantau Prapat', distanceMeters: 285000, distanceKm: 285, pricePerMeter: 1.2, price: 342000, roadConditionMultiplier: 1, vehicleTypeMultiplier: 1 },
  { id: 'r7', name: 'Medan → Padang Sidempuan', rayon: 'D', origin: 'Medan', destination: 'Padang Sidempuan', distanceMeters: 390000, distanceKm: 390, pricePerMeter: 1, price: 390000, roadConditionMultiplier: 1.3, vehicleTypeMultiplier: 1 },
  { id: 'r8', name: 'Medan → Kisaran', rayon: 'D', origin: 'Medan', destination: 'Kisaran', distanceMeters: 195000, distanceKm: 195, pricePerMeter: 1.3, price: 253500, roadConditionMultiplier: 1, vehicleTypeMultiplier: 1 },
];

// Helper to calculate distanceToDestination and price
const pt = (id: string, routeId: string, code: string, name: string, order: number, lat: number, lng: number, distFromPrev: number, cumDist: number, totalDist: number, ppm: number): RoutePoint => {
  const { finalPrice } = calculateFinalPrice(totalDist - cumDist, ppm);
  return {
    id, routeId, code, name, order, lat, lng,
    distanceFromPrevious: distFromPrev,
    cumulativeDistance: cumDist,
    distanceToDestination: totalDist - cumDist,
    price: finalPrice,
  };
};

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
  { 
    id: 'd1', 
    name: 'Budi Santoso', 
    phoneNumber: '081234567890', 
    email: 'budi@ridewise.com',
    licenseNumber: 'SIM-001', 
    status: 'online', 
    verificationStatus: 'approved',
    rating: 4.8, 
    totalTrips: 120, 
    joinDate: '2023-01-15',
    birthDate: '1985-05-20',
    address: 'Jl. Merdeka No. 123, Medan',
    vehicleDetails: {
      plateNumber: 'BK 1234 AB',
      brandModel: 'Toyota Hiace Commuter',
      year: 2022,
      color: 'Putih',
      vin: 'MHF1234567890ABCD',
      engineNumber: '2KD-FTV123456',
      verificationStatus: 'approved'
    },
    documents: [
      { id: 'doc1', type: 'KTP', status: 'approved', expiryDate: '2030-05-20', fileUrl: '#' },
      { id: 'doc2', type: 'SIM', status: 'approved', expiryDate: '2028-05-20', fileUrl: '#' },
      { id: 'doc3', type: 'STNK', status: 'approved', expiryDate: '2027-01-15', fileUrl: '#' }
    ],
    security: {
      twoFactorEnabled: false,
      loginHistory: [
        { id: 'log1', device: 'Samsung Galaxy S21', location: 'Medan, Indonesia', timestamp: '2024-04-04T08:00:00Z' },
        { id: 'log2', device: 'Chrome Windows', location: 'Medan, Indonesia', timestamp: '2024-04-03T10:30:00Z' }
      ]
    }
  },
  { id: 'd2', name: 'Ahmad Ridwan', phoneNumber: '081234567891', email: 'ahmad@ridewise.com', licenseNumber: 'SIM-002', status: 'online', verificationStatus: 'approved', rating: 4.9, totalTrips: 85, joinDate: '2023-03-10' },
  { id: 'd3', name: 'Dedi Kurniawan', phoneNumber: '081234567892', email: 'dedi@ridewise.com', licenseNumber: 'SIM-003', status: 'online', verificationStatus: 'approved', rating: 4.7, totalTrips: 210, joinDate: '2022-11-20' },
  { id: 'd4', name: 'Eko Prasetyo', phoneNumber: '081234567893', email: 'eko@ridewise.com', licenseNumber: 'SIM-004', status: 'offline', verificationStatus: 'approved', rating: 4.5, totalTrips: 45, joinDate: '2023-06-05' },
  { id: 'd5', name: 'Fajar Nugroho', phoneNumber: '081234567894', email: 'fajar@ridewise.com', licenseNumber: 'SIM-005', status: 'online', verificationStatus: 'approved', rating: 4.8, totalTrips: 132, joinDate: '2023-02-28' },
];

export const dummyVehicles: Vehicle[] = [
  {
    id: 'v1',
    name: 'Hiace Commuter',
    plateNumber: 'BK 1234 AB',
    capacity: 12,
    type: 'Minibus',
    status: 'active',
    brand: 'Toyota',
    model: 'Hiace',
    year: 2020,
    color: 'Putih',
    vin: 'MHKM1BA1AKJ123456',
    engineNumber: '1TR123456',
    fuelType: 'diesel',
    transmission: 'manual',
    stnkNumber: 'STNK-001234567890',
    stnkExpiryDate: '2027-12-31',
    stnkOwnerName: 'PT Ridewise Transport',
    documents: [
      {
        id: 'doc-v1-stnk',
        type: 'STNK',
        status: 'approved',
        fileUrl: '/documents/stnk-v1.pdf',
        expiryDate: '2027-12-31',
        uploadedAt: '2024-01-15T10:00:00Z',
        verifiedAt: '2024-01-16T14:30:00Z',
        verifiedBy: 'admin1'
      },
      {
        id: 'doc-v1-foto',
        type: 'FOTO_KENDARAAN',
        status: 'approved',
        fileUrl: '/images/vehicles/v1-exterior.jpg',
        uploadedAt: '2024-01-15T10:00:00Z',
        verifiedAt: '2024-01-16T14:30:00Z',
        verifiedBy: 'admin1'
      }
    ],
    photos: {
      exterior: '/images/vehicles/v1-exterior.jpg',
      interior: '/images/vehicles/v1-interior.jpg',
      dashboard: '/images/vehicles/v1-dashboard.jpg'
    },
    lastServiceDate: '2024-03-01',
    nextServiceDate: '2024-09-01',
    mileage: 45000,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T08:00:00Z',
    createdBy: 'admin1'
  },
  {
    id: 'v2',
    name: 'Elf Long',
    plateNumber: 'BK 5678 CD',
    capacity: 10,
    type: 'Minibus',
    status: 'active',
    brand: 'Isuzu',
    model: 'Elf',
    year: 2019,
    color: 'Biru',
    vin: 'JHMCM56557C123456',
    engineNumber: '4JJ1-123456',
    fuelType: 'diesel',
    transmission: 'manual',
    stnkNumber: 'STNK-005678901234',
    stnkExpiryDate: '2026-08-15',
    stnkOwnerName: 'PT Ridewise Transport',
    documents: [
      {
        id: 'doc-v2-stnk',
        type: 'STNK',
        status: 'approved',
        fileUrl: '/documents/stnk-v2.pdf',
        expiryDate: '2026-08-15',
        uploadedAt: '2024-02-01T09:00:00Z',
        verifiedAt: '2024-02-02T11:15:00Z',
        verifiedBy: 'admin1'
      }
    ],
    photos: {
      exterior: '/images/vehicles/v2-exterior.jpg'
    },
    lastServiceDate: '2024-02-15',
    nextServiceDate: '2024-08-15',
    mileage: 52000,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-15T07:30:00Z',
    createdBy: 'admin1'
  },
  {
    id: 'v3',
    name: 'Avanza',
    plateNumber: 'BK 9012 EF',
    capacity: 8,
    type: 'MPV',
    status: 'active',
    brand: 'Toyota',
    model: 'Avanza',
    year: 2021,
    color: 'Hitam',
    vin: 'MHFE3BJ3AKJ789012',
    engineNumber: 'K3VE-789012',
    fuelType: 'bensin',
    transmission: 'manual',
    stnkNumber: 'STNK-009012345678',
    stnkExpiryDate: '2028-03-20',
    stnkOwnerName: 'PT Ridewise Transport',
    documents: [
      {
        id: 'doc-v3-stnk',
        type: 'STNK',
        status: 'approved',
        fileUrl: '/documents/stnk-v3.pdf',
        expiryDate: '2028-03-20',
        uploadedAt: '2024-03-10T14:00:00Z',
        verifiedAt: '2024-03-11T16:45:00Z',
        verifiedBy: 'admin1'
      },
      {
        id: 'doc-v3-bpkb',
        type: 'BPKB',
        status: 'approved',
        fileUrl: '/documents/bpkb-v3.pdf',
        uploadedAt: '2024-03-10T14:00:00Z',
        verifiedAt: '2024-03-11T16:45:00Z',
        verifiedBy: 'admin1'
      }
    ],
    photos: {
      exterior: '/images/vehicles/v3-exterior.jpg',
      interior: '/images/vehicles/v3-interior.jpg'
    },
    lastServiceDate: '2024-03-15',
    nextServiceDate: '2024-09-15',
    mileage: 28000,
    createdAt: '2024-03-10T14:00:00Z',
    updatedAt: '2024-03-15T10:20:00Z',
    createdBy: 'admin1'
  },
  {
    id: 'v4',
    name: 'Innova Reborn',
    plateNumber: 'BK 3456 GH',
    capacity: 8,
    type: 'MPV',
    status: 'maintenance',
    brand: 'Toyota',
    model: 'Innova',
    year: 2022,
    color: 'Silver',
    vin: 'MHFM1BA3AKJ345678',
    engineNumber: '2TR-FE-345678',
    fuelType: 'bensin',
    transmission: 'automatic',
    stnkNumber: 'STNK-003456789012',
    stnkExpiryDate: '2029-01-10',
    stnkOwnerName: 'PT Ridewise Transport',
    documents: [
      {
        id: 'doc-v4-stnk',
        type: 'STNK',
        status: 'approved',
        fileUrl: '/documents/stnk-v4.pdf',
        expiryDate: '2029-01-10',
        uploadedAt: '2024-04-01T11:30:00Z',
        verifiedAt: '2024-04-02T13:20:00Z',
        verifiedBy: 'admin1'
      }
    ],
    photos: {
      exterior: '/images/vehicles/v4-exterior.jpg',
      dashboard: '/images/vehicles/v4-dashboard.jpg'
    },
    lastServiceDate: '2024-04-05',
    nextServiceDate: '2024-10-05',
    mileage: 15000,
    createdAt: '2024-04-01T11:30:00Z',
    updatedAt: '2024-04-05T09:15:00Z',
    createdBy: 'admin1'
  },
  {
    id: 'v5',
    name: 'Hiace Premio',
    plateNumber: 'BK 7890 IJ',
    capacity: 12,
    type: 'Minibus',
    status: 'active',
    brand: 'Toyota',
    model: 'Hiace',
    year: 2018,
    color: 'Merah',
    vin: 'MHKM1BA1AKJ901234',
    engineNumber: '1TR901234',
    fuelType: 'diesel',
    transmission: 'manual',
    stnkNumber: 'STNK-007890123456',
    stnkExpiryDate: '2025-11-25',
    stnkOwnerName: 'PT Ridewise Transport',
    documents: [
      {
        id: 'doc-v5-stnk',
        type: 'STNK',
        status: 'approved',
        fileUrl: '/documents/stnk-v5.pdf',
        expiryDate: '2025-11-25',
        uploadedAt: '2024-01-20T12:00:00Z',
        verifiedAt: '2024-01-21T15:10:00Z',
        verifiedBy: 'admin1'
      },
      {
        id: 'doc-v5-service',
        type: 'SERVICE_RECORD',
        status: 'approved',
        fileUrl: '/documents/service-v5.pdf',
        uploadedAt: '2024-01-20T12:00:00Z',
        verifiedAt: '2024-01-21T15:10:00Z',
        verifiedBy: 'admin1'
      }
    ],
    photos: {
      exterior: '/images/vehicles/v5-exterior.jpg',
      interior: '/images/vehicles/v5-interior.jpg',
      dashboard: '/images/vehicles/v5-dashboard.jpg'
    },
    lastServiceDate: '2024-01-25',
    nextServiceDate: '2024-07-25',
    mileage: 65000,
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-01-25T08:45:00Z',
    createdBy: 'admin1'
  }
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
  return formatPrice(amount, 'IDR');
};
