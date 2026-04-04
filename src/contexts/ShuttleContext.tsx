import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  User,
  UserRole,
  Booking,
  Schedule,
  Route,
  RoutePoint,
  Driver,
  Vehicle,
  RayonPricing,
  RideRequest,
  PickupPoint,
  Rayon,
  RouteSequence,
  ActivityLog,
} from '@/types/shuttle';
import {
  dummyRoutes,
  dummyRoutePoints,
  dummySchedules,
  dummyDrivers,
  dummyVehicles,
  dummyBookings,
  defaultRayonPricing,
  dummyPickupPoints,
  dummyRayons,
  dummyRouteSequences,
  dummyActivityLogs,
  generateNewActivityLog,
} from '@/data/dummy';

interface ShuttleContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;

  // Original data
  routes: Route[];
  routePoints: RoutePoint[];
  schedules: Schedule[];
  drivers: Driver[];
  vehicles: Vehicle[];
  bookings: Booking[];
  rayonPricing: RayonPricing[];
  rideRequests: RideRequest[];

  // Pickup Point Management
  pickupPoints: PickupPoint[];
  addPickupPoint: (pickupPoint: Omit<PickupPoint, 'id' | 'createdAt' | 'updatedAt'>) => PickupPoint;
  updatePickupPoint: (id: string, updates: Partial<PickupPoint>) => void;
  deletePickupPoint: (id: string) => void;
  getPickupPointsByRayon: (rayon: Rayon['code']) => PickupPoint[];
  getPickupPointById: (id: string) => PickupPoint | undefined;
  searchPickupPoints: (query: string) => PickupPoint[];
  togglePickupPointStatus: (id: string) => void;

  // Rayon Management
  rayons: Rayon[];
  updateRayonInfo: (rayonCode: Rayon['code'], updates: Partial<Rayon>) => void;
  getRayonByCode: (code: Rayon['code']) => Rayon | undefined;
  getRayonPickupPointCount: (code: Rayon['code']) => number;

  // Route Sequences
  routeSequences: RouteSequence[];
  addRouteSequence: (sequence: Omit<RouteSequence, 'id'>) => void;
  updateRouteSequence: (id: string, updates: Partial<RouteSequence>) => void;
  deleteRouteSequence: (id: string) => void;
  getRouteSequences: (routeId: string) => RouteSequence[];
  reorderRouteSequence: (routeId: string, sequences: RouteSequence[]) => void;

  // Activity Logging
  activityLogs: ActivityLog[];
  getActivityLogs: (entityType?: ActivityLog['entityType']) => ActivityLog[];
  getActivityLogsByEntity: (entityId: string) => ActivityLog[];

  // Original operations
  addBooking: (booking: Booking) => void;
  updateScheduleStatus: (scheduleId: string, status: Schedule['status']) => void;
  addRideRequest: (request: RideRequest) => void;
  acceptRideRequest: (requestId: string) => void;
  rejectRideRequest: (requestId: string) => void;
  checkInPassenger: (bookingId: string) => void;

  // Setters
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setRoutePoints: React.Dispatch<React.SetStateAction<RoutePoint[]>>;
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  setRayonPricing: React.Dispatch<React.SetStateAction<RayonPricing[]>>;
  setPickupPoints: React.Dispatch<React.SetStateAction<PickupPoint[]>>;
  setRayons: React.Dispatch<React.SetStateAction<Rayon[]>>;
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;

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
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>(dummyPickupPoints);
  const [rayons, setRayons] = useState<Rayon[]>(dummyRayons);
  const [routeSequences, setRouteSequences] = useState<RouteSequence[]>(dummyRouteSequences);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(dummyActivityLogs);

  // Auth
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

  // ========== Pickup Point Management ==========

  const addPickupPoint = (pickupPoint: Omit<PickupPoint, 'id' | 'createdAt' | 'updatedAt'>): PickupPoint => {
    const newPickupPoint: PickupPoint = {
      ...pickupPoint,
      id: `pk${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPickupPoints(prev => [...prev, newPickupPoint]);

    // Log activity
    const log = generateNewActivityLog(
      'pickup_point',
      newPickupPoint.id,
      newPickupPoint.name,
      'create',
      { name: { oldValue: null, newValue: newPickupPoint.name }, rayon: { oldValue: null, newValue: newPickupPoint.rayon } },
      currentUser?.id || 'system',
      currentUser?.name || 'System',
      `Pickup point "${newPickupPoint.name}" created successfully`
    );
    setActivityLogs(prev => [log, ...prev]);

    return newPickupPoint;
  };

  const updatePickupPoint = (id: string, updates: Partial<PickupPoint>) => {
    const oldPickupPoint = pickupPoints.find(p => p.id === id);
    if (!oldPickupPoint) return;

    const changes: Record<string, { oldValue: any; newValue: any }> = {};
    const updatedPickupPoint: PickupPoint = { ...oldPickupPoint, ...updates, updatedAt: new Date().toISOString() };

    Object.entries(updates).forEach(([key, newValue]) => {
      const oldValue = oldPickupPoint[key as keyof PickupPoint];
      if (oldValue !== newValue) {
        changes[key] = { oldValue, newValue };
      }
    });

    setPickupPoints(prev => prev.map(p => (p.id === id ? updatedPickupPoint : p)));

    // Log activity
    const log = generateNewActivityLog(
      'pickup_point',
      id,
      updatedPickupPoint.name,
      'update',
      changes,
      currentUser?.id || 'system',
      currentUser?.name || 'System',
      `Pickup point "${updatedPickupPoint.name}" updated`
    );
    setActivityLogs(prev => [log, ...prev]);
  };

  const deletePickupPoint = (id: string) => {
    const pickupPoint = pickupPoints.find(p => p.id === id);
    if (!pickupPoint) return;

    setPickupPoints(prev => prev.filter(p => p.id !== id));

    // Log activity
    const log = generateNewActivityLog(
      'pickup_point',
      id,
      pickupPoint.name,
      'delete',
      { isActive: { oldValue: pickupPoint.isActive, newValue: false } },
      currentUser?.id || 'system',
      currentUser?.name || 'System',
      `Pickup point "${pickupPoint.name}" deleted`
    );
    setActivityLogs(prev => [log, ...prev]);
  };

  const togglePickupPointStatus = (id: string) => {
    const pickupPoint = pickupPoints.find(p => p.id === id);
    if (!pickupPoint) return;

    const newStatus = !pickupPoint.isActive;
    updatePickupPoint(id, { isActive: newStatus });

    // Log activity
    const log = generateNewActivityLog(
      'pickup_point',
      id,
      pickupPoint.name,
      newStatus ? 'activate' : 'deactivate',
      { isActive: { oldValue: pickupPoint.isActive, newValue: newStatus } },
      currentUser?.id || 'system',
      currentUser?.name || 'System',
      `Pickup point "${pickupPoint.name}" ${newStatus ? 'activated' : 'deactivated'}`
    );
    setActivityLogs(prev => [log, ...prev]);
  };

  const getPickupPointsByRayon = (rayon: Rayon['code']): PickupPoint[] => {
    return pickupPoints.filter(p => p.rayon === rayon && p.isActive);
  };

  const getPickupPointById = (id: string): PickupPoint | undefined => {
    return pickupPoints.find(p => p.id === id);
  };

  const searchPickupPoints = (query: string): PickupPoint[] => {
    const lowerQuery = query.toLowerCase();
    return pickupPoints.filter(
      p => p.name.toLowerCase().includes(lowerQuery) ||
           p.code.toLowerCase().includes(lowerQuery) ||
           p.address.toLowerCase().includes(lowerQuery) ||
           p.city.toLowerCase().includes(lowerQuery)
    );
  };

  // ========== Rayon Management ==========

  const updateRayonInfo = (rayonCode: Rayon['code'], updates: Partial<Rayon>) => {
    setRayons(prev => prev.map(r => (r.code === rayonCode ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r)));

    const rayon = rayons.find(r => r.code === rayonCode);
    if (rayon) {
      const log = generateNewActivityLog(
        'rayon',
        rayon.id,
        rayon.name,
        'update',
        Object.entries(updates).reduce((acc, [key, value]) => {
          acc[key] = { oldValue: rayon[key as keyof Rayon], newValue: value };
          return acc;
        }, {} as Record<string, any>),
        currentUser?.id || 'system',
        currentUser?.name || 'System',
        `Rayon "${rayonCode}" information updated`
      );
      setActivityLogs(prev => [log, ...prev]);
    }
  };

  const getRayonByCode = (code: Rayon['code']): Rayon | undefined => {
    return rayons.find(r => r.code === code);
  };

  const getRayonPickupPointCount = (code: Rayon['code']): number => {
    return pickupPoints.filter(p => p.rayon === code && p.isActive).length;
  };

  // ========== Route Sequences ==========

  const addRouteSequence = (sequence: Omit<RouteSequence, 'id'>) => {
    const newSequence: RouteSequence = {
      ...sequence,
      id: `rs${Date.now()}`,
    };
    setRouteSequences(prev => [...prev, newSequence]);

    const pickupPoint = pickupPoints.find(p => p.id === newSequence.pickupPointId);
    const log = generateNewActivityLog(
      'route_sequence',
      newSequence.id,
      `${sequence.routeId} - ${pickupPoint?.name || 'Unknown'}`,
      'create',
      { sequenceOrder: { oldValue: null, newValue: sequence.sequenceOrder } },
      currentUser?.id || 'system',
      currentUser?.name || 'System',
      `Route sequence added for route ${sequence.routeId}`
    );
    setActivityLogs(prev => [log, ...prev]);
  };

  const updateRouteSequence = (id: string, updates: Partial<RouteSequence>) => {
    const oldSequence = routeSequences.find(s => s.id === id);
    if (!oldSequence) return;

    setRouteSequences(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));

    const changes = Object.entries(updates).reduce((acc, [key, value]) => {
      acc[key] = { oldValue: oldSequence[key as keyof RouteSequence], newValue: value };
      return acc;
    }, {} as Record<string, any>);

    const pickupPoint = pickupPoints.find(p => p.id === oldSequence.pickupPointId);
    const log = generateNewActivityLog(
      'route_sequence',
      id,
      `${oldSequence.routeId} - ${pickupPoint?.name || 'Unknown'}`,
      'update',
      changes,
      currentUser?.id || 'system',
      currentUser?.name || 'System',
      `Route sequence updated for route ${oldSequence.routeId}`
    );
    setActivityLogs(prev => [log, ...prev]);
  };

  const deleteRouteSequence = (id: string) => {
    const sequence = routeSequences.find(s => s.id === id);
    if (!sequence) return;

    setRouteSequences(prev => prev.filter(s => s.id !== id));

    const pickupPoint = pickupPoints.find(p => p.id === sequence.pickupPointId);
    const log = generateNewActivityLog(
      'route_sequence',
      id,
      `${sequence.routeId} - ${pickupPoint?.name || 'Unknown'}`,
      'delete',
      { deleted: { oldValue: false, newValue: true } },
      currentUser?.id || 'system',
      currentUser?.name || 'System',
      `Route sequence deleted for route ${sequence.routeId}`
    );
    setActivityLogs(prev => [log, ...prev]);
  };

  const getRouteSequences = (routeId: string): RouteSequence[] => {
    return routeSequences.filter(s => s.routeId === routeId).sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  };

  const reorderRouteSequence = (routeId: string, sequences: RouteSequence[]) => {
    setRouteSequences(prev => {
      const updated = sequences.map(s => ({ ...s, routeId }));
      const others = prev.filter(s => s.routeId !== routeId);
      return [...others, ...updated];
    });

    const log = generateNewActivityLog(
      'route_sequence',
      routeId,
      routeId,
      'update',
      { sequenceOrder: { oldValue: 'previous', newValue: 'reordered' } },
      currentUser?.id || 'system',
      currentUser?.name || 'System',
      `Route sequences reordered for route ${routeId}`
    );
    setActivityLogs(prev => [log, ...prev]);
  };

  // ========== Activity Logging ==========

  const getActivityLogs = (entityType?: ActivityLog['entityType']): ActivityLog[] => {
    if (!entityType) return activityLogs;
    return activityLogs.filter(log => log.entityType === entityType);
  };

  const getActivityLogsByEntity = (entityId: string): ActivityLog[] => {
    return activityLogs.filter(log => log.entityId === entityId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // ========== Original operations ==========

  const addBooking = (booking: Booking) => setBookings(prev => [...prev, booking]);

  const updateScheduleStatus = (scheduleId: string, status: Schedule['status']) => {
    setSchedules(prev => prev.map(s => (s.id === scheduleId ? { ...s, status } : s)));
  };

  const addRideRequest = (request: RideRequest) => {
    setRideRequests(prev => [...prev, request]);
  };

  const acceptRideRequest = (requestId: string) => {
    setRideRequests(prev => prev.map(r => (r.id === requestId ? { ...r, status: 'accepted' as const } : r)));
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
    setRideRequests(prev => prev.map(r => (r.id === requestId ? { ...r, status: 'rejected' as const } : r)));
  };

  const checkInPassenger = (bookingId: string) => {
    setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, checkedIn: true } : b)));
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
    <ShuttleContext.Provider
      value={{
        currentUser,
        login,
        logout,
        routes,
        routePoints,
        schedules,
        drivers,
        vehicles,
        bookings,
        rayonPricing,
        rideRequests,
        pickupPoints,
        rayons,
        routeSequences,
        activityLogs,
        addPickupPoint,
        updatePickupPoint,
        deletePickupPoint,
        getPickupPointsByRayon,
        getPickupPointById,
        searchPickupPoints,
        togglePickupPointStatus,
        updateRayonInfo,
        getRayonByCode,
        getRayonPickupPointCount,
        addRouteSequence,
        updateRouteSequence,
        deleteRouteSequence,
        getRouteSequences,
        reorderRouteSequence,
        getActivityLogs,
        getActivityLogsByEntity,
        addBooking,
        updateScheduleStatus,
        addRideRequest,
        acceptRideRequest,
        rejectRideRequest,
        checkInPassenger,
        recalcRoutePointPrices,
        setRoutes,
        setRoutePoints,
        setSchedules,
        setDrivers,
        setVehicles,
        setBookings,
        setRayonPricing,
        setPickupPoints,
        setRayons,
        setActivityLogs,
      }}
    >
      {children}
    </ShuttleContext.Provider>
  );
};

export const useShuttle = () => {
  const context = useContext(ShuttleContext);
  if (!context) throw new Error('useShuttle must be used within ShuttleProvider');
  return context;
};
