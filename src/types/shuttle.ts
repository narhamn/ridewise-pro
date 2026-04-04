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
