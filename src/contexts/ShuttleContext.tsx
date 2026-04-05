import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole, Booking, Schedule, Route, RoutePoint, Driver, Vehicle, RayonPricing, RideRequest, Discount, TaxConfig, PricingAuditLog, DriverLocation, TrackingLog, Ticket, TicketStatus, TicketComment, DriverRegistration, VerificationStatus, VerificationLog } from '@/types/shuttle';
import { dummyRoutes, dummyRoutePoints, dummySchedules, dummyDrivers, dummyVehicles, dummyBookings, defaultRayonPricing, dummyDiscounts, defaultTaxConfigs, dummyTickets, dummyRegistrations } from '@/data/dummy';
import { calculateHaversineDistance, isValidRouteData } from '@/lib/utils';
import { calculateFinalPrice } from '@/lib/pricing';
import { processBookingOnServer, BookingRequest, BookingResponse } from '@/services/bookingServer';
import { useNotifications } from './NotificationContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ShuttleContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  routes: Route[];
  routePoints: RoutePoint[];
  schedules: Schedule[];
  drivers: Driver[];
  vehicles: Vehicle[];
  bookings: Booking[];
  rayonPricing: RayonPricing[];
  rideRequests: RideRequest[];
  discounts: Discount[];
  taxConfigs: TaxConfig[];
  auditLogs: PricingAuditLog[];
  driverLocations: Record<string, DriverLocation>;
  trackingLogs: TrackingLog[];
  tickets: Ticket[];
  registrations: DriverRegistration[];
  updateDriverLocation: (driverId: string, location: DriverLocation) => void;
  addAuditLog: (log: Omit<PricingAuditLog, 'id' | 'changeDate'>) => void;
  createSecureBooking: (request: BookingRequest) => Promise<BookingResponse>;
  addBooking: (booking: Booking) => Promise<void>;
  updateScheduleStatus: (scheduleId: string, status: Schedule['status']) => Promise<void>;
  addRideRequest: (request: RideRequest) => Promise<void>;
  acceptRideRequest: (requestId: string) => Promise<void>;
  rejectRideRequest: (requestId: string) => Promise<void>;
  checkInPassenger: (bookingId: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus, note?: string) => Promise<void>;
  addTicketComment: (ticketId: string, message: string, attachments?: string[]) => Promise<void>;
  submitDriverRegistration: (registration: Omit<Driver, 'id' | 'verificationStatus' | 'submittedAt' | 'updatedAt' | 'logs' | 'status' | 'rating' | 'totalTrips' | 'joinDate'>) => Promise<void>;
  updateRegistrationStatus: (registrationId: string, status: VerificationStatus, reason?: string) => Promise<void>;
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setRoutePoints: React.Dispatch<React.SetStateAction<RoutePoint[]>>;
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  setRayonPricing: React.Dispatch<React.SetStateAction<RayonPricing[]>>;
  setDiscounts: React.Dispatch<React.SetStateAction<Discount[]>>;
  setTaxConfigs: React.Dispatch<React.SetStateAction<TaxConfig[]>>;
  updateDriverStatus: (driverId: string, status: 'online' | 'offline') => Promise<boolean>;
  assignDriverToSchedule: (scheduleId: string, driverId: string) => Promise<void>;
  removeDriverFromSchedule: (scheduleId: string) => Promise<void>;
  updateTripStatus: (scheduleId: string, status: Schedule['status'], notes?: string) => Promise<void>;
  notifyBookingCreated: (booking: Booking) => void;
  notifyTripUpdate: (scheduleId: string, status: Schedule['status']) => void;
  getAvailableDrivers: (date: string, timeSlot?: string) => Driver[];
  getDriverSchedule: (driverId: string, date?: string) => Schedule[];
  updateDriverProfile: (driverId: string, updates: Partial<Driver>) => Promise<void>;
  recalcRoutePointPrices: (routeId: string, pricePerMeter: number, roadConditionMultiplier?: number, vehicleTypeMultiplier?: number) => void;
  recalculateRouteDistanceAndPrice: (routeId: string, roadConditionMultiplier?: number, vehicleTypeMultiplier?: number) => void;
}

const ShuttleContext = createContext<ShuttleContextType | undefined>(undefined);

export const ShuttleProvider = ({ children }: { children: ReactNode }) => {
  const { addNotification } = useNotifications();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<Route[]>(dummyRoutes);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>(dummyRoutePoints);
  const [schedules, setSchedules] = useState<Schedule[]>(dummySchedules);
  const [drivers, setDrivers] = useState<Driver[]>(dummyDrivers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(dummyVehicles);
  const [bookings, setBookings] = useState<Booking[]>(dummyBookings);
  const [rayonPricing, setRayonPricing] = useState<RayonPricing[]>(defaultRayonPricing);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>(dummyDiscounts);
  const [taxConfigs, setTaxConfigs] = useState<TaxConfig[]>(defaultTaxConfigs);
  const [auditLogs, setAuditLogs] = useState<PricingAuditLog[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>(dummyTickets);
  
  // Real-time tracking states
  const [driverLocations, setDriverLocations] = useState<Record<string, DriverLocation>>({});
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([]);

  // Fetch data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Auth Session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) setCurrentUser(profile);
        }

        // Fetch Business Data (Routes, Vehicles, etc.)
        const [
          { data: dbRoutes },
          { data: dbPoints },
          { data: dbSchedules },
          { data: dbVehicles },
          { data: dbDrivers },
          { data: dbBookings }
        ] = await Promise.all([
          supabase.from('routes').select('*'),
          supabase.from('route_points').select('*'),
          supabase.from('schedules').select('*'),
          supabase.from('vehicles').select('*'),
          supabase.from('drivers').select('*'),
          supabase.from('bookings').select('*')
        ]);

        if (dbRoutes) setRoutes(dbRoutes);
        if (dbPoints) setRoutePoints(dbPoints);
        if (dbSchedules) setSchedules(dbSchedules);
        if (dbVehicles) setVehicles(dbVehicles);
        if (dbDrivers) setDrivers(dbDrivers);
        if (dbBookings) setBookings(dbBookings);

      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        toast.error('Gagal memuat data dari server. Menggunakan data lokal.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup Realtime Subscriptions
    const schedulesSubscription = supabase
      .channel('public:schedules')
      .on('postgres_changes', { event: '*', table: 'schedules' }, payload => {
        const updatedSchedule = payload.new as Schedule;
        setSchedules(prev => {
          if (payload.eventType === 'INSERT') return [...prev, updatedSchedule];
          if (payload.eventType === 'UPDATE') return prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s);
          if (payload.eventType === 'DELETE') return prev.filter(s => s.id === payload.old.id);
          return prev;
        });
        
        // Notify on status update
        if (payload.eventType === 'UPDATE' && payload.old.status !== updatedSchedule.status) {
          notifyTripUpdate(updatedSchedule.id, updatedSchedule.status);
        }
      })
      .subscribe();

    const locationsSubscription = supabase
      .channel('public:driver_locations')
      .on('postgres_changes', { event: '*', table: 'driver_locations' }, payload => {
        const newLocation = payload.new as DriverLocation;
        setDriverLocations(prev => ({ ...prev, [newLocation.driverId]: newLocation }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(schedulesSubscription);
      supabase.removeChannel(locationsSubscription);
    };
  }, []);

  const updateDriverLocation = useCallback(async (driverId: string, location: DriverLocation) => {
    // Update Supabase
    const { error } = await supabase
      .from('driver_locations')
      .upsert({
        driver_id: driverId,
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        accuracy: location.accuracy,
        updated_at: location.timestamp
      });

    if (error) {
      console.error('Error updating driver location:', error);
      return;
    }

    setDriverLocations(prev => ({
      ...prev,
      [driverId]: location
    }));

    // Record to tracking log (Optional: Can be done via DB Trigger or Edge Function)
    const newLog: TrackingLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityId: driverId,
      entityType: 'driver',
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed,
      timestamp: location.timestamp
    };

    setTrackingLogs(prev => [newLog, ...prev].slice(0, 1000));
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profile) {
          if (profile.role !== role) {
            await supabase.auth.signOut();
            toast.error(`Akses ditolak. Akun Anda terdaftar sebagai ${profile.role}.`);
            return false;
          }
          setCurrentUser(profile);
          toast.success(`Selamat datang kembali, ${profile.name}!`);
          return true;
        }
      }
      return false;
    } catch (error: any) {
      toast.error(`Login gagal: ${error.message}`);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const addBooking = async (booking: Booking) => {
    const { error } = await supabase.from('bookings').insert(booking);
    if (error) {
      toast.error('Gagal menyimpan booking ke server.');
      return;
    }
    setBookings(prev => [...prev, booking]);
    notifyBookingCreated(booking);
  };

  const createSecureBooking = async (request: BookingRequest): Promise<BookingResponse> => {
    // In a real Supabase setup, this would call an Edge Function
    // const { data, error } = await supabase.functions.invoke('process-booking', { body: request });
    
    const response = processBookingOnServer(request, {
      users: currentUser ? [currentUser] : [],
      schedules,
      routes,
      routePoints,
      discounts,
      taxConfigs,
      existingBookings: bookings
    });

    if (response.success && response.booking) {
      await addBooking(response.booking);
    }

    return response;
  };

  const updateScheduleStatus = async (scheduleId: string, status: Schedule['status']) => {
    const { error } = await supabase
      .from('schedules')
      .update({ status })
      .eq('id', scheduleId);

    if (error) {
      toast.error('Gagal memperbarui status jadwal.');
      return;
    }
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, status } : s));
  };

  const addRideRequest = async (request: RideRequest) => {
    const { error } = await supabase.from('ride_requests').insert(request);
    if (error) {
      toast.error('Gagal mengirim permintaan tumpangan.');
      return;
    }
    setRideRequests(prev => [...prev, request]);
  };

  const acceptRideRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('ride_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) {
      toast.error('Gagal menyetujui permintaan.');
      return;
    }

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
    await addBooking(newBooking);
  };

  const rejectRideRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('ride_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      toast.error('Gagal menolak permintaan.');
      return;
    }
    setRideRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' as const } : r));
  };

  const checkInPassenger = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ checked_in: true })
      .eq('id', bookingId);

    if (error) {
      toast.error('Gagal melakukan check-in.');
      return;
    }
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, checkedIn: true } : b));
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus, note?: string) => {
    const historyItem = {
      id: `h-${Date.now()}`,
      ticketId,
      status,
      changedBy: currentUser?.name || 'System',
      timestamp: new Date().toISOString(),
      note
    };

    const { error } = await supabase
      .from('tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (error) {
      toast.error('Gagal memperbarui status tiket.');
      return;
    }

    // Insert history
    await supabase.from('ticket_history').insert(historyItem);

    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        status,
        updatedAt: new Date().toISOString(),
        history: [...t.history, historyItem]
      };
    }));
    toast.success(`Status tiket diperbarui menjadi ${status}`);
  };

  const addTicketComment = async (ticketId: string, message: string, attachments?: string[]) => {
    if (!currentUser) return;
    const newComment: TicketComment = {
      id: `c-${Date.now()}`,
      ticketId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message,
      timestamp: new Date().toISOString(),
      attachments
    };

    const { error } = await supabase.from('ticket_comments').insert(newComment);
    if (error) {
      toast.error('Gagal menambahkan komentar.');
      return;
    }

    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        updatedAt: new Date().toISOString(),
        comments: [...t.comments, newComment]
      };
    }));
    toast.success('Komentar ditambahkan');
  };

  const submitDriverRegistration = async (reg: Omit<Driver, 'id' | 'verificationStatus' | 'submittedAt' | 'updatedAt' | 'logs' | 'status' | 'rating' | 'totalTrips' | 'joinDate'>) => {
    const regId = `reg-${Date.now()}`;
    const newReg: Driver = {
      ...reg,
      id: regId,
      status: 'offline',
      verificationStatus: 'pending', 
      rating: 0,
      totalTrips: 0,
      joinDate: new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [
        { id: `l-${Date.now()}`, registrationId: regId, status: 'pending', changedBy: 'System', timestamp: new Date().toISOString(), reason: 'Initial submission' }
      ]
    };

    const { error } = await supabase.from('drivers').insert(newReg);
    if (error) {
      toast.error('Gagal mengirim pendaftaran.');
      return;
    }

    setDrivers(prev => [...prev, newReg]);
    toast.success('Pendaftaran driver berhasil dikirim. Mohon tunggu verifikasi admin.');
  };

  const updateRegistrationStatus = async (registrationId: string, status: VerificationStatus, reason?: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Hanya administrator yang dapat melakukan verifikasi.');
      return;
    }

    const registration = drivers.find(r => r.id === registrationId);
    if (!registration) {
      toast.error('Pendaftaran tidak ditemukan.');
      return;
    }

    if (status === 'approved') {
      const isDuplicate = drivers.some(d => 
        d.id !== registrationId && d.verificationStatus === 'approved' && (
          d.licenseNumber === registration.licenseNumber || 
          d.phoneNumber === registration.phoneNumber ||
          d.vehicleDetails?.plateNumber === registration.vehicleDetails?.plateNumber
        )
      );

      if (isDuplicate) {
        toast.error('Gagal menyetujui: Data driver atau kendaraan sudah terdaftar dalam sistem.');
        return;
      }
    }

    const newLog: VerificationLog = {
      id: `l-${Date.now()}`,
      registrationId,
      status,
      changedBy: currentUser.name,
      timestamp: new Date().toISOString(),
      reason
    };

    const { error } = await supabase
      .from('drivers')
      .update({
        verification_status: status,
        rejection_reason: status === 'rejected' ? reason : registration.rejectionReason,
        updated_at: new Date().toISOString(),
        vehicle_details: registration.vehicleDetails ? {
          ...registration.vehicleDetails,
          verificationStatus: status,
        } : undefined
      })
      .eq('id', registrationId);

    if (error) {
      toast.error('Gagal memperbarui status pendaftaran.');
      return;
    }

    // Insert log
    await supabase.from('verification_logs').insert(newLog);

    setDrivers(prev => prev.map(r => {
      if (r.id !== registrationId) return r;
      return {
        ...r,
        verificationStatus: status,
        rejectionReason: status === 'rejected' ? reason : r.rejectionReason,
        updatedAt: new Date().toISOString(),
        logs: r.logs ? [...r.logs, newLog] : [newLog],
        vehicleDetails: r.vehicleDetails ? {
          ...r.vehicleDetails,
          verificationStatus: status,
        } : undefined
      };
    }));

    addNotification({
      title: status === 'approved' ? 'Pendaftaran Disetujui' : 'Pendaftaran Ditolak',
      message: status === 'approved' 
        ? `Selamat ${registration.name}, pendaftaran Anda telah disetujui. Anda sekarang dapat login sebagai driver.`
        : `Mohon maaf, pendaftaran Anda ditolak. Alasan: ${reason || 'Data tidak lengkap'}`,
      type: 'system',
      role: 'driver'
    });
    
    toast.success(`Status pendaftaran diperbarui menjadi ${status}`);
  };

  const updateDriverStatus = async (driverId: string, status: 'online' | 'offline'): Promise<boolean> => {
    const { error } = await supabase
      .from('drivers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', driverId);

    if (error) {
      toast.error('Gagal memperbarui status driver di server.');
      return false;
    }

    setDrivers(prev => prev.map(d => 
      d.id === driverId 
        ? { ...d, status, lastStatusChange: new Date().toISOString() } 
        : d
    ));

    toast.success(status === 'online' ? 'Anda sekarang ONLINE.' : 'Anda sekarang OFFLINE.');
    return true;
  };

  const updateDriverProfile = async (driverId: string, updates: Partial<Driver>) => {
    const { error } = await supabase
      .from('drivers')
      .update(updates)
      .eq('id', driverId);

    if (error) {
      toast.error('Gagal memperbarui profil di server.');
      return;
    }

    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, ...updates } : d));
    toast.success('Profil berhasil diperbarui');
  };

  /**
   * Recalculates total route distance and price using Haversine formula
   * based on coordinates of all route points.
   */
  const recalculateRouteDistanceAndPrice = (
    routeId: string,
    roadConditionMultiplier = 1,
    vehicleTypeMultiplier = 1
  ) => {
    const routePts = routePoints.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);
    if (routePts.length < 2) return;

    let totalDistanceKm = 0;
    const updatedPoints: RoutePoint[] = [...routePts];

    // Calculate distance between sequential points
    for (let i = 0; i < updatedPoints.length; i++) {
      if (i === 0) {
        updatedPoints[i].distanceFromPrevious = 0;
        updatedPoints[i].cumulativeDistance = 0;
      } else {
        const prev = updatedPoints[i - 1];
        const curr = updatedPoints[i];
        
        if (isValidRouteData(prev.lat, prev.lng, curr.lat, curr.lng)) {
          const dist = calculateHaversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
          totalDistanceKm += dist;
          updatedPoints[i].distanceFromPrevious = Math.round(dist * 1000); // meters
          updatedPoints[i].cumulativeDistance = Math.round(totalDistanceKm * 1000); // meters
        }
      }
    }

    const totalDistanceMeters = Math.round(totalDistanceKm * 1000);

    setRoutePoints(prev => {
      const others = prev.filter(p => p.routeId !== routeId);
      const finalizedPoints = updatedPoints.map(p => ({
        ...p,
        distanceToDestination: totalDistanceMeters - p.cumulativeDistance,
      }));
      return [...others, ...finalizedPoints];
    });

    setRoutes(prev => prev.map(r => {
      if (r.id !== routeId) return r;
      
      const pricePerMeter = r.pricePerMeter || 2;
      const { finalPrice } = calculateFinalPrice(totalDistanceMeters, pricePerMeter, {
        multipliers: { roadCondition: roadConditionMultiplier, vehicleType: vehicleTypeMultiplier }
      });

      return {
        ...r,
        distanceMeters: totalDistanceMeters,
        distanceKm: Number(totalDistanceKm.toFixed(2)),
        price: finalPrice,
        roadConditionMultiplier,
        vehicleTypeMultiplier
      };
    }));
  };

  const recalcRoutePointPrices = (
    routeId: string, 
    pricePerMeter: number, 
    roadConditionMultiplier?: number, 
    vehicleTypeMultiplier?: number
  ) => {
    setRoutePoints(prev => {
      const routePts = prev.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);
      const totalDist = routePts.length > 0 ? routePts[routePts.length - 1].cumulativeDistance : 0;
      
      // Use provided multipliers or fallback to current route state
      const route = routes.find(r => r.id === routeId);
      const roadMultiplier = roadConditionMultiplier !== undefined ? roadConditionMultiplier : (route?.roadConditionMultiplier || 1);
      const vehicleMultiplier = vehicleTypeMultiplier !== undefined ? vehicleTypeMultiplier : (route?.vehicleTypeMultiplier || 1);

      const updated = routePts.map(p => {
        const { finalPrice } = calculateFinalPrice(totalDist - p.cumulativeDistance, pricePerMeter, {
          multipliers: { roadCondition: roadMultiplier, vehicleType: vehicleMultiplier }
        });
        return {
          ...p,
          distanceToDestination: totalDist - p.cumulativeDistance,
          price: finalPrice,
        };
      });
      const others = prev.filter(p => p.routeId !== routeId);
      return [...others, ...updated];
    });
    setRoutes(prev => prev.map(r => {
      if (r.id !== routeId) return r;
      const routePts = routePoints.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);
      const totalDist = routePts.length > 0 ? routePts[routePts.length - 1].cumulativeDistance : 0;
      
      const roadMultiplier = roadConditionMultiplier !== undefined ? roadConditionMultiplier : (r.roadConditionMultiplier || 1);
      const vehicleMultiplier = vehicleTypeMultiplier !== undefined ? vehicleTypeMultiplier : (r.vehicleTypeMultiplier || 1);
      
      const { finalPrice } = calculateFinalPrice(totalDist, pricePerMeter, {
        multipliers: { roadCondition: roadMultiplier, vehicleType: vehicleMultiplier }
      });
      return { 
        ...r, 
        pricePerMeter, 
        price: finalPrice,
        roadConditionMultiplier: roadMultiplier,
        vehicleTypeMultiplier: vehicleMultiplier
      };
    }));
  };

  const assignDriverToSchedule = async (scheduleId: string, driverId: string) => {
    const { error } = await supabase
      .from('schedules')
      .update({ driver_id: driverId, status: 'scheduled' })
      .eq('id', scheduleId);

    if (error) {
      toast.error('Gagal menugaskan driver.');
      return;
    }

    setSchedules(prev => prev.map(s =>
      s.id === scheduleId ? { ...s, driverId, status: 'scheduled' as const } : s
    ));

    toast.success(`Driver berhasil ditugaskan.`);
  };

  const removeDriverFromSchedule = async (scheduleId: string) => {
    const { error } = await supabase
      .from('schedules')
      .update({ driver_id: null, status: 'cancelled' })
      .eq('id', scheduleId);

    if (error) {
      toast.error('Gagal membatalkan penugasan.');
      return;
    }

    setSchedules(prev => prev.map(s =>
      s.id === scheduleId ? { ...s, driverId: null, status: 'cancelled' as const } : s
    ));

    toast.success('Penugasan berhasil dibatalkan');
  };

  const updateTripStatus = async (scheduleId: string, status: Schedule['status'], notes?: string) => {
    const { error } = await supabase
      .from('schedules')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', scheduleId);

    if (error) {
      toast.error('Gagal memperbarui status perjalanan.');
      return;
    }

    setSchedules(prev => prev.map(s =>
      s.id === scheduleId ? { ...s, status } : s
    ));
    toast.success(`Status perjalanan diperbarui menjadi ${status}`);
  };

  const notifyBookingCreated = useCallback((booking: Booking) => {
    const route = routes.find(r => r.id === booking.routeId);
    const schedule = schedules.find(s => s.id === booking.scheduleId);

    // Notify passenger
    addNotification({
      title: 'Booking Berhasil',
      message: `Booking ${route?.name} kursi ${booking.seatNumber} telah dikonfirmasi`,
      type: 'booking',
      role: 'customer'
    });

    // Notify driver if assigned
    if (schedule?.driverId) {
      const driver = drivers.find(d => d.id === schedule.driverId);
      if (driver) {
        addNotification({
          title: 'Penumpang Baru',
          message: `${booking.userName} telah booking kursi ${booking.seatNumber} untuk rute ${route?.name}`,
          type: 'booking',
          role: 'driver'
        });
      }
    }

    // Notify admin
    addNotification({
      title: 'Booking Baru',
      message: `Booking baru: ${booking.userName} - ${route?.name} kursi ${booking.seatNumber}`,
      type: 'booking',
      role: 'admin'
    });
  }, [routes, schedules, drivers, addNotification]);

  const notifyTripUpdate = useCallback((scheduleId: string, status: Schedule['status']) => {
    updateTripStatus(scheduleId, status);
  }, [updateTripStatus]);

  const getAvailableDrivers = useCallback((date: string, timeSlot?: string) => {
    return drivers.filter(driver => {
      // Driver must be approved and online
      if (driver.verificationStatus !== 'approved' || driver.status !== 'online') {
        return false;
      }

      // Check if driver has conflicting schedules
      const hasConflict = schedules.some(schedule =>
        schedule.driverId === driver.id &&
        schedule.departureDate === date &&
        (!timeSlot || Math.abs(new Date(`2000-01-01T${schedule.departureTime}`).getTime() - new Date(`2000-01-01T${timeSlot}`).getTime()) < 2 * 60 * 60 * 1000)
      );

      return !hasConflict;
    });
  }, [drivers, schedules]);

  const getDriverSchedule = useCallback((driverId: string, date?: string) => {
    return schedules.filter(schedule =>
      schedule.driverId === driverId &&
      (!date || schedule.departureDate === date)
    );
  }, [schedules]);

  return (
    <ShuttleContext.Provider value={{
      currentUser, login, logout,
      routes, routePoints, schedules, drivers, vehicles, bookings, rayonPricing, rideRequests,
      discounts, taxConfigs, auditLogs,
      driverLocations, trackingLogs, updateDriverLocation,
      tickets, updateTicketStatus, addTicketComment,
      registrations, submitDriverRegistration, updateRegistrationStatus,
      addAuditLog, createSecureBooking, addBooking, updateScheduleStatus, addRideRequest, acceptRideRequest, rejectRideRequest, checkInPassenger,
      updateDriverStatus, updateDriverProfile,
      recalcRoutePointPrices, recalculateRouteDistanceAndPrice,
      assignDriverToSchedule, removeDriverFromSchedule, updateTripStatus, notifyBookingCreated, notifyTripUpdate, getAvailableDrivers, getDriverSchedule,
      setRoutes, setRoutePoints, setSchedules, setDrivers, setVehicles, setBookings, setRayonPricing,
      setDiscounts, setTaxConfigs,
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
