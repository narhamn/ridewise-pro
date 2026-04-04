import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole, Booking, Schedule, Route, RoutePoint, Driver, Vehicle, RayonPricing, RideRequest, Discount, TaxConfig, PricingAuditLog, DriverLocation, TrackingLog, Ticket, TicketStatus, TicketComment, DriverRegistration, VerificationStatus, VerificationLog } from '@/types/shuttle';
import { dummyRoutes, dummyRoutePoints, dummySchedules, dummyDrivers, dummyVehicles, dummyBookings, defaultRayonPricing, dummyDiscounts, defaultTaxConfigs, dummyTickets, dummyRegistrations } from '@/data/dummy';
import { calculateHaversineDistance, isValidRouteData } from '@/lib/utils';
import { calculateFinalPrice } from '@/lib/pricing';
import { processBookingOnServer, BookingRequest, BookingResponse } from '@/services/bookingServer';
import { useNotifications } from './NotificationContext';
import { toast } from 'sonner';

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
  discounts: Discount[];
  taxConfigs: TaxConfig[];
  auditLogs: PricingAuditLog[];
  driverLocations: Record<string, DriverLocation>;
  trackingLogs: TrackingLog[];
  tickets: Ticket[];
  registrations: DriverRegistration[];
  updateDriverLocation: (driverId: string, location: DriverLocation) => void;
  addAuditLog: (log: Omit<PricingAuditLog, 'id' | 'changeDate'>) => void;
  createSecureBooking: (request: BookingRequest) => BookingResponse;
  addBooking: (booking: Booking) => void;
  updateScheduleStatus: (scheduleId: string, status: Schedule['status']) => void;
  addRideRequest: (request: RideRequest) => void;
  acceptRideRequest: (requestId: string) => void;
  rejectRideRequest: (requestId: string) => void;
  checkInPassenger: (bookingId: string) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, note?: string) => void;
  addTicketComment: (ticketId: string, message: string, attachments?: string[]) => void;
  submitDriverRegistration: (registration: Omit<Driver, 'id' | 'verificationStatus' | 'submittedAt' | 'updatedAt' | 'logs' | 'status' | 'rating' | 'totalTrips' | 'joinDate'>) => void;
  updateRegistrationStatus: (registrationId: string, status: VerificationStatus, reason?: string) => void;
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
  assignDriverToSchedule: (scheduleId: string, driverId: string) => void;
  removeDriverFromSchedule: (scheduleId: string) => void;
  updateTripStatus: (scheduleId: string, status: Schedule['status'], notes?: string) => void;
  notifyBookingCreated: (booking: Booking) => void;
  notifyTripUpdate: (scheduleId: string, status: Schedule['status']) => void;
  getAvailableDrivers: (date: string, timeSlot?: string) => Driver[];
  getDriverSchedule: (driverId: string, date?: string) => Schedule[];
}

const ShuttleContext = createContext<ShuttleContextType | undefined>(undefined);

export const ShuttleProvider = ({ children }: { children: ReactNode }) => {
  const { addNotification } = useNotifications();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [routes, setRoutes] = useState<Route[]>(dummyRoutes);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>(dummyRoutePoints);
  const [schedules, setSchedules] = useState<Schedule[]>(dummySchedules);
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('shuttle_drivers');
    const loadedDrivers = saved ? JSON.parse(saved) : [...dummyDrivers, ...dummyRegistrations];
    return loadedDrivers;
  });

  useEffect(() => {
    localStorage.setItem('shuttle_drivers', JSON.stringify(drivers));
  }, [drivers]);

  // Derived state for backward compatibility
  const registrations = drivers.filter(d => d.verificationStatus !== 'approved');
  
  const [vehicles, setVehicles] = useState<Vehicle[]>(dummyVehicles);
  const [bookings, setBookings] = useState<Booking[]>(dummyBookings);
  const [rayonPricing, setRayonPricing] = useState<RayonPricing[]>(defaultRayonPricing);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>(dummyDiscounts);
  const [taxConfigs, setTaxConfigs] = useState<TaxConfig[]>(defaultTaxConfigs);
  const [auditLogs, setAuditLogs] = useState<PricingAuditLog[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>(dummyTickets);
  // Removed separate registrations state

  
  // Real-time tracking states
  const [driverLocations, setDriverLocations] = useState<Record<string, DriverLocation>>({});
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([]);

  const updateDriverLocation = useCallback((driverId: string, location: DriverLocation) => {
    setDriverLocations(prev => ({
      ...prev,
      [driverId]: location
    }));

    // Record to tracking log
    const newLog: TrackingLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityId: driverId,
      entityType: 'driver',
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed,
      timestamp: location.timestamp
    };

    setTrackingLogs(prev => {
      const updated = [newLog, ...prev];
      // Keep only last 1000 logs for performance
      return updated.slice(0, 1000);
    });
  }, []);

  const addAuditLog = (log: Omit<PricingAuditLog, 'id' | 'changeDate'>) => {
    const newLog: PricingAuditLog = {
      ...log,
      id: `audit-${Date.now()}`,
      changeDate: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
    // Simulated backup: in a real app, this would be a persistent store or external API
    console.log("Audit log backed up:", newLog);
  };

  const login = (email: string, _password: string, role: UserRole): boolean => {
    if (role === 'customer') {
      setCurrentUser({ id: 'u1', name: 'Siti Aminah', email, phone: '081200000001', role: 'customer' });
    } else if (role === 'driver') {
      const driver = drivers.find(d => d.phoneNumber === email || d.name.toLowerCase().includes(email.toLowerCase()));
      if (driver) {
        setCurrentUser({ id: driver.id, name: driver.name, email: `${driver.id}@ridewise.com`, phone: driver.phoneNumber, role: 'driver' });
      } else {
        setCurrentUser({ id: 'd1', name: 'Budi Santoso', email: 'budi@ridewise.com', phone: '081234567890', role: 'driver' });
      }
    } else {
      setCurrentUser({ id: 'admin1', name: 'Administrator', email, phone: '081200000000', role: 'admin' });
    }
    return true;
  };

  const logout = () => setCurrentUser(null);

  const addBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
    notifyBookingCreated(booking);
  };

  const createSecureBooking = (request: BookingRequest): BookingResponse => {
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
      addBooking(response.booking);
    }

    return response;
  };

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

  const checkInPassenger = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, checkedIn: true } : b));
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus, note?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const historyItem = {
        id: `h-${Date.now()}`,
        ticketId,
        status,
        changedBy: currentUser?.name || 'System',
        timestamp: new Date().toISOString(),
        note
      };
      return {
        ...t,
        status,
        updatedAt: new Date().toISOString(),
        history: [...t.history, historyItem]
      };
    }));
    toast.success(`Status tiket diperbarui menjadi ${status}`);
  };

  const addTicketComment = (ticketId: string, message: string, attachments?: string[]) => {
    if (!currentUser) return;
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
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
      return {
        ...t,
        updatedAt: new Date().toISOString(),
        comments: [...t.comments, newComment]
      };
    }));
    toast.success('Komentar ditambahkan');
  };

  const submitDriverRegistration = (reg: Omit<Driver, 'id' | 'verificationStatus' | 'submittedAt' | 'updatedAt' | 'logs' | 'status' | 'rating' | 'totalTrips' | 'joinDate'>) => {
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
    setDrivers(prev => [...prev, newReg]);
    toast.success('Pendaftaran driver berhasil dikirim. Mohon tunggu verifikasi admin.');
  };

  const updateRegistrationStatus = (registrationId: string, status: VerificationStatus, reason?: string) => {
    // 1. Role-based access control (Only admin can verify)
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Hanya administrator yang dapat melakukan verifikasi.');
      return;
    }

    const registration = drivers.find(r => r.id === registrationId);
    if (!registration) {
      toast.error('Pendaftaran tidak ditemukan.');
      return;
    }

    // 2. Duplicate Validation (Only check on approval)
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

    // 3. Update Status and Audit Log
    setDrivers(prev => prev.map(r => {
      if (r.id !== registrationId) return r;
      
      const newLog: VerificationLog = {
        id: `l-${Date.now()}`,
        registrationId,
        status,
        changedBy: currentUser.name,
        timestamp: new Date().toISOString(),
        reason
      };

      return {
        ...r,
        verificationStatus: status,
        rejectionReason: status === 'rejected' ? reason : r.rejectionReason,
        updatedAt: new Date().toISOString(),
        logs: r.logs ? [...r.logs, newLog] : [newLog],
        // If approved, update vehicle details status too
        vehicleDetails: r.vehicleDetails ? {
          ...r.vehicleDetails,
          verificationStatus: status,
          vin: r.vehicleDetails.vin || `VIN-${Date.now()}`,
          engineNumber: r.vehicleDetails.engineNumber || `ENG-${Date.now()}`
        } : undefined
      };
    }));

    // 5. Send Real-time Notification to Driver (Simulated)
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

  const updateDriverStatus = async (driverId: string, status: 'online' | 'offline', retryCount = 0): Promise<boolean> => {
    const MAX_RETRIES = 3;
    const WAIT_TIME = 2000; // 2 seconds minimum between changes

    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return false;

    // 1. Validation: Wait time check
    if (driver.lastStatusChange) {
      const lastChange = new Date(driver.lastStatusChange).getTime();
      const now = Date.now();
      if (now - lastChange < WAIT_TIME) {
        toast.error(`Mohon tunggu sebentar sebelum mengubah status kembali.`);
        return false;
      }
    }

    // 2. Mock Server Sync with Retry Mechanism
    const syncWithServer = async (): Promise<boolean> => {
      // Simulate network failure 20% of the time for testing retry
      const isSuccess = Math.random() > 0.2;
      return new Promise((resolve) => {
        setTimeout(() => resolve(isSuccess), 500);
      });
    };

    const success = await syncWithServer();
    if (!success) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`[SYNC RETRY] Gagal sinkronisasi status ke server. Mencoba ulang (${retryCount + 1}/${MAX_RETRIES})...`);
        return updateDriverStatus(driverId, status, retryCount + 1);
      } else {
        toast.error('Gagal sinkronisasi status ke server setelah beberapa kali percobaan.');
        return false;
      }
    }

    // 3. Update Local State
    setDrivers(prev => prev.map(d => 
      d.id === driverId 
        ? { ...d, status, lastStatusChange: new Date().toISOString() } 
        : d
    ));

    // 4. Notifications
    const statusMsg = status === 'online' ? 'Anda sekarang ONLINE dan dapat menerima pesanan.' : 'Anda sekarang OFFLINE.';
    toast.success(statusMsg);
    
    // In a real app, we would emit a socket event here:
    // socket.emit('driver_status_changed', { driverId, status });
    console.log(`[SERVER NOTIFY] Driver ${driverId} status changed to ${status}`);
    return true;
  };

  const updateDriverProfile = (driverId: string, updates: Partial<Driver>) => {
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

  const assignDriverToSchedule = useCallback((scheduleId: string, driverId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    const driver = drivers.find(d => d.id === driverId);

    if (!schedule || !driver) {
      toast.error('Jadwal atau driver tidak ditemukan');
      return;
    }

    // Check if driver is already assigned to another schedule at the same time
    const conflictingSchedule = schedules.find(s =>
      s.id !== scheduleId &&
      s.driverId === driverId &&
      s.departureDate === schedule.departureDate &&
      Math.abs(new Date(`2000-01-01T${s.departureTime}`).getTime() - new Date(`2000-01-01T${schedule.departureTime}`).getTime()) < 2 * 60 * 60 * 1000 // 2 hours buffer
    );

    if (conflictingSchedule) {
      toast.error('Driver sudah memiliki jadwal di waktu yang sama');
      return;
    }

    // Update schedule with driver assignment
    setSchedules(prev => prev.map(s =>
      s.id === scheduleId ? { ...s, driverId, status: 'scheduled' as const } : s
    ));

    // Notify driver
    addNotification({
      title: 'Jadwal Baru Ditugaskan',
      message: `Anda ditugaskan untuk rute ${routes.find(r => r.id === schedule.routeId)?.name} pada ${schedule.departureDate} jam ${schedule.departureTime}`,
      type: 'trip',
      role: 'driver'
    });

    // Notify admin
    addNotification({
      title: 'Driver Ditugaskan',
      message: `${driver.name} ditugaskan ke jadwal ${routes.find(r => r.id === schedule.routeId)?.name}`,
      type: 'system',
      role: 'admin'
    });

    toast.success(`Driver ${driver.name} berhasil ditugaskan ke jadwal`);
  }, [schedules, drivers, routes, addNotification]);

  const removeDriverFromSchedule = useCallback((scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    setSchedules(prev => prev.map(s =>
      s.id === scheduleId ? { ...s, driverId: undefined, status: 'cancelled' as const } : s
    ));

    // Notify driver if assigned
    if (schedule.driverId) {
      addNotification({
        title: 'Jadwal Dibatalkan',
        message: `Penugasan untuk rute ${routes.find(r => r.id === schedule.routeId)?.name} telah dibatalkan`,
        type: 'trip',
        role: 'driver'
      });
    }

    toast.success('Driver berhasil dihapus dari jadwal');
  }, [schedules, routes, addNotification]);

  const updateTripStatus = useCallback((scheduleId: string, status: Schedule['status'], notes?: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    const route = routes.find(r => r.id === schedule.routeId);
    const driver = drivers.find(d => d.id === schedule.driverId);

    setSchedules(prev => prev.map(s =>
      s.id === scheduleId ? { ...s, status, updatedAt: new Date().toISOString() } : s
    ));

    // Notify passengers
    const affectedBookings = bookings.filter(b => b.scheduleId === scheduleId && b.status === 'confirmed');
    affectedBookings.forEach(booking => {
      let message = '';
      switch (status) {
        case 'boarding':
          message = `Shuttle ${route?.name} sedang boarding. Silakan menuju halte keberangkatan.`;
          break;
        case 'departed':
          message = `Shuttle ${route?.name} telah berangkat dari halte keberangkatan.`;
          break;
        case 'arrived':
          message = `Shuttle ${route?.name} telah tiba di tujuan. Terima kasih telah menggunakan layanan kami.`;
          break;
        case 'cancelled':
          message = `Maaf, perjalanan ${route?.name} telah dibatalkan. ${notes || ''}`;
          break;
      }

      if (message) {
        addNotification({
          title: `Update Perjalanan - ${route?.name}`,
          message,
          type: 'trip',
          role: 'customer'
        });
      }
    });

    // Notify driver
    if (driver) {
      let driverMessage = '';
      switch (status) {
        case 'boarding':
          driverMessage = `Waktunya boarding untuk rute ${route?.name}. Pastikan semua penumpang sudah naik.`;
          break;
        case 'departed':
          driverMessage = `Perjalanan ${route?.name} telah dimulai. Selamat berkendara!`;
          break;
        case 'arrived':
          driverMessage = `Perjalanan ${route?.name} telah selesai. Terima kasih atas dedikasinya.`;
          break;
      }

      if (driverMessage) {
        addNotification({
          title: 'Update Status Trip',
          message: driverMessage,
          type: 'trip',
          role: 'driver'
        });
      }
    }

    // Notify admin
    addNotification({
      title: 'Update Status Trip',
      message: `Trip ${route?.name} status: ${status}${notes ? ` - ${notes}` : ''}`,
      type: 'trip',
      role: 'admin'
    });

    toast.success(`Status trip diperbarui menjadi ${status}`);
  }, [schedules, routes, drivers, bookings, addNotification]);

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
