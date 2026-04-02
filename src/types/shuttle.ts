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
  code: string; // J1, J2, etc.
  name: string;
  order: number;
}

export interface Schedule {
  id: string;
  routeId: string;
  departureTime: string; // "07:00"
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
