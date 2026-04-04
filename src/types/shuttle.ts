export type UserRole = 'customer' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'active' | 'inactive';
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  capacity: number;
  type: string;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface Route {
  id: string;
  name: string;
  rayon: 'A' | 'B' | 'C' | 'D';
  origin: string;
  destination: string;
  distanceMeters: number;
  pricePerMeter: number;
  price: number;
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

export interface Schedule {
  id: string;
  routeId: string;
  departureDate: string;
  departureTime: string;
  vehicleId: string;
  driverId: string | null;
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled';
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

// ========== Pickup Point Management ==========

export interface PickupPoint {
  id: string;
  code: string; // Unique code like PK-001
  name: string; // Location name
  rayon: 'A' | 'B' | 'C' | 'D'; // Zone
  address: string; // Full address
  city: string;
  district: string;
  lat: number; // Latitude
  lng: number; // Longitude
  phone: string; // Contact number
  contactPerson: string; // Contact name
  isActive: boolean;
  description?: string;
  estimatedWaitTime?: number; // Minutes
  maxCapacity?: number; // Simultaneous passengers
  facilities?: string[]; // WiFi, Toilet, etc
  operatingHours?: {
    open: string; // HH:mm
    close: string; // HH:mm
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
  updatedBy: string; // User ID
}

export interface Rayon {
  id: string;
  code: 'A' | 'B' | 'C' | 'D';
  name: string;
  label: string;
  description: string;
  pricePerMeter: number;
  coverage: string; // Coverage area description
  pickupPointCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RouteSequence {
  id: string;
  routeId: string;
  pickupPointId: string;
  sequenceOrder: number;
  estimatedTimeFromPrevious: number; // Minutes
  estimatedDistanceFromPrevious: number; // Meters
  cumulativeTime: number; // Minutes from start
  cumulativeDistance: number; // Meters from start
  price: number; // Price from this point to destination
}

export interface ActivityLog {
  id: string;
  entityType: 'pickup_point' | 'rayon' | 'route_sequence' | 'schedule' | 'booking';
  entityId: string;
  entityName: string;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  changes: Record<string, { oldValue: any; newValue: any }>;
  userId: string;
  userName: string;
  timestamp: string;
  ipAddress?: string;
  details?: string;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: 'pickup_point' | 'route_start' | 'route_end' | 'waypoint';
  rayon: 'A' | 'B' | 'C' | 'D';
  isActive: boolean;
  icon?: string;
}

export interface ExportData {
  format: 'excel' | 'pdf';
  entityType: 'pickup_points' | 'rayons' | 'routes' | 'activity_logs';
  filters?: Record<string, any>;
  columns?: string[];
  generatedAt: string;
  generatedBy: string;
}
