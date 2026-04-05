export type UserRole = 'customer' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface DriverVehicleDetails {
  plateNumber: string;
  brandModel: string;
  year: number;
  color: string;
  vin?: string; // Nomor Rangka
  engineNumber?: string;
  image?: string;
  verificationStatus: VerificationStatus;
}

export interface OCRData {
  extractedText?: string;
  confidence?: number;
  fields?: Record<string, string | number | boolean>;
  rawData?: Record<string, unknown>;
}

export interface DriverDocument {
  id: string;
  type: 'KTP' | 'SIM' | 'STNK' | 'SKCK' | 'FOTO_DIRI' | 'FOTO_KENDARAAN';
  status: VerificationStatus;
  fileUrl: string;
  expiryDate?: string;
  ocrData?: OCRData;
  manipulationScore?: number; // 0 to 1, higher means likely manipulated
}

export interface VerificationLog {
  id: string;
  registrationId: string;
  status: VerificationStatus;
  changedBy: string;
  timestamp: string;
  reason?: string;
}

export interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  ktpNumber?: string;
  licenseNumber: string;
  status: 'online' | 'offline' | 'active' | 'inactive'; // active/inactive for admin management
  lastStatusChange?: string;
  rating: number;
  totalTrips: number;
  joinDate: string;
  // Verification Info
  verificationStatus: VerificationStatus;
  submittedAt?: string;
  updatedAt?: string;
  rejectionReason?: string;
  // Profile Fields
  birthDate?: string;
  address?: string;
  profileImage?: string;
  vehicleDetails?: DriverVehicleDetails;
  documents?: DriverDocument[];
  logs?: VerificationLog[];
  security?: {
    twoFactorEnabled: boolean;
    loginHistory: {
      id: string;
      device: string;
      location: string;
      timestamp: string;
    }[];
  };
}

// Deprecated in favor of Driver with verificationStatus='pending'
// but kept for backward compatibility during migration
export type DriverRegistration = Driver;

export interface VehicleDocument {
  id: string;
  type: 'STNK' | 'FOTO_KENDARAAN' | 'BPKB' | 'SERVICE_RECORD';
  status: VerificationStatus;
  fileUrl: string;
  expiryDate?: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  capacity: number;
  type: string;
  status: 'active' | 'maintenance' | 'inactive';
  // New detailed fields
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string; // Vehicle Identification Number
  engineNumber?: string;
  fuelType?: 'bensin' | 'diesel' | 'listrik' | 'hybrid';
  transmission?: 'manual' | 'automatic';
  // STNK Information
  stnkNumber?: string;
  stnkExpiryDate?: string;
  stnkOwnerName?: string;
  // Documents
  documents?: VehicleDocument[];
  // Photos
  photos?: {
    exterior?: string;
    interior?: string;
    dashboard?: string;
  };
  // Maintenance
  lastServiceDate?: string;
  nextServiceDate?: string;
  mileage?: number;
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Route {
  id: string;
  name: string;
  rayon: 'A' | 'B' | 'C' | 'D';
  origin: string;
  destination: string;
  distanceMeters: number;
  distanceKm: number; // Added distance in KM
  pricePerMeter: number;
  price: number;
  roadConditionMultiplier?: number; // Added road condition factor
  vehicleTypeMultiplier?: number; // Added vehicle type factor
}

export interface RoutePoint {
  id: string;
  routeId: string;
  code: string;
  name: string;
  order: number;
  lat: number;
  lng: number;
  distanceFromPrevious: number;
  cumulativeDistance: number;
  distanceToDestination: number;
  price: number;
}

export interface RayonPricing {
  rayon: 'A' | 'B' | 'C' | 'D';
  pricePerMeter: number;
  label: string;
}

export type TripStatus = 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';

export interface Schedule {
  id: string;
  routeId: string;
  departureDate: string;
  departureTime: string;
  vehicleId: string;
  driverId: string | null;
  status: TripStatus;
}

export interface Seat {
  id: string;
  vehicleId: string;
  seatNumber: number;
  row: number;
  column: number;
  isAvailable: boolean;
}

export type PaymentMethod = 'bank_transfer' | 'ewallet' | 'qris';
export type PaymentStatus = 'pending' | 'paid' | 'expired' | 'failed';

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  scheduleId: string;
  routeId: string;
  routeName: string;
  pickupPointId: string;
  pickupPointName: string;
  seatNumber: number;
  price: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  bookingDate: string;
  departureTime: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  bookingType: 'scheduled' | 'realtime';
  checkedIn?: boolean;
}

export interface TripDetail {
  schedule: Schedule;
  route: Route;
  vehicle: Vehicle;
  driver: Driver | null;
  passengers: Booking[];
  seats: SeatStatus[];
}

export interface SeatStatus {
  seatNumber: number;
  row: number;
  column: number;
  isBooked: boolean;
  passengerName?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'trip' | 'system';
  read: boolean;
  timestamp: string;
  role: UserRole;
}

export interface RideRequest {
  id: string;
  userId: string;
  userName: string;
  scheduleId: string;
  routeId: string;
  pickupPointId: string;
  pickupPointName: string;
  seatNumber: number;
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface PaymentConfig {
  provider: 'midtrans' | 'xendit';
  serverKey: string;
  clientKey: string;
  environment: 'sandbox' | 'production';
  enabled: boolean;
}

export type DiscountType = 'percentage' | 'fixed';

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number; // percentage (0-100) or fixed amount
  minBookingAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  description: string;
}

export interface TaxConfig {
  id: string;
  name: string;
  rate: number; // percentage as decimal, e.g., 0.11 for 11%
  region: string;
  isActive: boolean;
}

export interface PricingAuditLog {
  id: string;
  rayon?: 'A' | 'B' | 'C' | 'D';
  oldPrice?: number;
  newPrice?: number;
  changedBy: string; // User Name or ID
  changeDate: string; // ISO String
  reason?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  oldValue?: any;
  newValue?: any;
}

export interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: string; // ISO String
}

export interface TrackingLog {
  id: string;
  entityId: string; // driverId or scheduleId
  entityType: 'driver' | 'shuttle';
  latitude: number;
  longitude: number;
  speed: number | null;
  accuracy?: number;
  heading?: number | null;
  altitude?: number | null;
  timestamp: string;
}

export type GPSStatus = 'searching' | 'active' | 'weak' | 'error' | 'inactive';

export interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  type: 'pickup' | 'restricted' | 'destination';
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'booking' | 'payment' | 'app_issue' | 'driver_report' | 'other';

export interface TicketComment {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  status: TicketStatus;
  changedBy: string; // User Name
  timestamp: string;
  note?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  createdAt: string;
  updatedAt: string;
  comments: TicketComment[];
  history: TicketHistory[];
  attachments?: string[];
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

