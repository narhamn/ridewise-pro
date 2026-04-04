import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Booking, Schedule, Route, RoutePoint, Driver, Vehicle, RayonPricing, RideRequest } from '@/types/shuttle';
import { dummyRoutes, dummyRoutePoints, dummySchedules, dummyDrivers, dummyVehicles, dummyBookings, defaultRayonPricing } from '@/data/dummy';

interface ShuttleContextType {
  currentUser: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  routes: Route[];
  routePoints: RoutePoint[];
  schedules: Schedule[];
  drivers: Driver[];
  vehicles: Vehicle[];
  bookings: Booking[];
  rayonPricing: RayonPricing[];
  rideRequests: RideRequest[];
  addBooking: (booking: Booking) => void;
  updateScheduleStatus: (scheduleId: string, status: Schedule['status']) => void;
  addRideRequest: (request: RideRequest) => void;
  acceptRideRequest: (requestId: string) => void;
  rejectRideRequest: (requestId: string) => void;
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setRoutePoints: React.Dispatch<React.SetStateAction<RoutePoint[]>>;
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  setRayonPricing: React.Dispatch<React.SetStateAction<RayonPricing[]>>;
  recalcRoutePointPrices: (routeId: string, pricePerMeter: number) => void;
}

const ShuttleContext = createContext<ShuttleContextType | undefined>(undefined);

export const ShuttleProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [routes, setRoutes] = useState<Route[]>(dummyRoutes);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>(dummyRoutePoints);
  const [schedules, setSchedules] = useState<Schedule[]>(dummySchedules);
  const [drivers, setDrivers] = useState<Driver[]>(dummyDrivers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(dummyVehicles);
  const [bookings, setBookings] = useState<Booking[]>(dummyBookings);
  const [rayonPricing, setRayonPricing] = useState<RayonPricing[]>(defaultRayonPricing);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);

  const login = (email: string, _password: string, role: UserRole): boolean => {
    if (role === 'customer') {
      setCurrentUser({ id: 'u1', name: 'Siti Aminah', email, phone: '081200000001', role: 'customer' });
    } else if (role === 'driver') {
      const driver = drivers.find(d => d.email === email);
      if (driver) {
        setCurrentUser({ id: driver.id, name: driver.name, email: driver.email, phone: driver.phone, role: 'driver' });
      } else {
        setCurrentUser({ id: 'd1', name: 'Budi Santoso', email, phone: '081234567890', role: 'driver' });
      }
    } else {
      setCurrentUser({ id: 'admin1', name: 'Administrator', email, phone: '081200000000', role: 'admin' });
    }
    return true;
  };

  const logout = () => setCurrentUser(null);

  const addBooking = (booking: Booking) => setBookings(prev => [...prev, booking]);

  const updateScheduleStatus = (scheduleId: string, status: Schedule['status']) => {
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, status } : s));
  };

  const addRideRequest = (request: RideRequest) => {
    setRideRequests(prev => [...prev, request]);
  };

  const acceptRideRequest = (requestId: string) => {
    setRideRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' as const } : r));
    const request = rideRequests.find(r => r.id === requestId);
    if (!request) return;
    const schedule = schedules.find(s => s.id === request.scheduleId);
    const route = routes.find(r => r.id === request.routeId);
    if (!schedule || !route) return;

    const newBooking: Booking = {
      id: `b${Date.now()}`,
      userId: request.userId,
      userName: request.userName,
      scheduleId: request.scheduleId,
      routeId: request.routeId,
      routeName: route.name,
      pickupPointId: request.pickupPointId,
      pickupPointName: request.pickupPointName,
      seatNumber: request.seatNumber,
      price: request.price,
      status: 'confirmed',
      bookingDate: new Date().toISOString().split('T')[0],
      departureTime: schedule.departureTime,
      paymentStatus: 'paid',
      paymentMethod: 'qris',
      bookingType: 'realtime',
    };
    addBooking(newBooking);
  };

  const rejectRideRequest = (requestId: string) => {
    setRideRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' as const } : r));
  };

  const recalcRoutePointPrices = (routeId: string, pricePerMeter: number) => {
    setRoutePoints(prev => {
      const routePts = prev.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);
      const totalDist = routePts.length > 0 ? routePts[routePts.length - 1].cumulativeDistance : 0;
      const updated = routePts.map(p => ({
        ...p,
        distanceToDestination: totalDist - p.cumulativeDistance,
        price: Math.round((totalDist - p.cumulativeDistance) * pricePerMeter),
      }));
      const others = prev.filter(p => p.routeId !== routeId);
      return [...others, ...updated];
    });
    setRoutes(prev => prev.map(r => {
      if (r.id !== routeId) return r;
      const routePts = routePoints.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);
      const totalDist = routePts.length > 0 ? routePts[routePts.length - 1].cumulativeDistance : 0;
      return { ...r, pricePerMeter, price: Math.round(totalDist * pricePerMeter) };
    }));
  };

  return (
    <ShuttleContext.Provider value={{
      currentUser, login, logout,
      routes, routePoints, schedules, drivers, vehicles, bookings, rayonPricing, rideRequests,
      addBooking, updateScheduleStatus, addRideRequest, acceptRideRequest, rejectRideRequest,
      recalcRoutePointPrices,
      setRoutes, setRoutePoints, setSchedules, setDrivers, setVehicles, setBookings, setRayonPricing,
    }}>
      {children}
    </ShuttleContext.Provider>
  );
};

export const useShuttle = () => {
  const context = useContext(ShuttleContext);
  if (!context) throw new Error('useShuttle must be used within ShuttleProvider');
  return context;
};
