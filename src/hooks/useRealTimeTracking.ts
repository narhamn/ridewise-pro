import { useEffect, useState, useCallback, useRef } from 'react';
import { DriverLocation, TrackingLog, Schedule } from '@/types/shuttle';
import { RealTimeEvent, getRealTimeTrackingService, RealTimeTrackingConfig } from '@/services/realTimeTracking';
import { toast } from 'sonner';

interface UseRealTimeTrackingOptions {
  config?: Partial<RealTimeTrackingConfig>;
  autoInitialize?: boolean;
  onLocationUpdate?: (location: DriverLocation) => void;
  onScheduleUpdate?: (schedule: Schedule) => void;
  onDriverStatusChange?: (data: { driverId: string; status: string }) => void;
}

interface UseRealTimeTrackingReturn {
  // Data
  driverLocations: Record<string, DriverLocation>;
  trackingLogs: TrackingLog[];
  activeSchedules: Schedule[];

  // Connection status
  isConnected: boolean;
  connectionType: 'websocket' | 'polling';

  // Actions
  sendLocationUpdate: (location: DriverLocation) => Promise<void>;
  sendDriverStatusChange: (driverId: string, status: string) => Promise<void>;

  // Service control
  initialize: () => Promise<void>;
  destroy: () => void;
}

export const useRealTimeTracking = ({
  config,
  autoInitialize = true,
  onLocationUpdate,
  onScheduleUpdate,
  onDriverStatusChange
}: UseRealTimeTrackingOptions = {}): UseRealTimeTrackingReturn => {
  const [driverLocations, setDriverLocations] = useState<Record<string, DriverLocation>>({});
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([]);
  const [activeSchedules, setActiveSchedules] = useState<Schedule[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'websocket' | 'polling'>('polling');

  const serviceRef = useRef(getRealTimeTrackingService(config));
  const unsubscribersRef = useRef<(() => void)[]>([]);
  const initializedRef = useRef(false);
  
  // Use refs to store latest callbacks without triggering re-initialization
  const callbacksRef = useRef({
    onLocationUpdate,
    onScheduleUpdate,
    onDriverStatusChange
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onLocationUpdate,
      onScheduleUpdate,
      onDriverStatusChange
    };
  }, [onLocationUpdate, onScheduleUpdate, onDriverStatusChange]);

  // Initialize the service
  const initialize = useCallback(async () => {
    try {
      await serviceRef.current.initialize();

      // Subscribe to events
      const unsubLocation = serviceRef.current.subscribe('location_update', (event: RealTimeEvent) => {
        if (event.type === 'location_update') {
          const location = event.data as DriverLocation;
          setDriverLocations(prev => ({
            ...prev,
            [location.driverId]: location
          }));

          // Add to tracking logs
          const log: TrackingLog = {
            id: `${location.driverId}-${Date.now()}`,
            entityId: location.driverId,
            entityType: 'driver',
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: location.timestamp,
            accuracy: location.accuracy,
            speed: location.speed,
            heading: location.heading,
            altitude: location.altitude
          };

          setTrackingLogs(prev => {
            const newLogs = [...prev, log];
            // Keep only last 100 logs per driver for performance
            const driverLogs = newLogs.filter(l => l.entityId === location.driverId);
            if (driverLogs.length > 100) {
              const oldestLog = driverLogs[0];
              return newLogs.filter(l => l.id !== oldestLog.id);
            }
            return newLogs;
          });

          if (callbacksRef.current.onLocationUpdate) {
            callbacksRef.current.onLocationUpdate(location);
          }
        }
      });

      const unsubSchedule = serviceRef.current.subscribe('schedule_update', (event: RealTimeEvent) => {
        if (event.type === 'schedule_update') {
          const schedule = event.data as Schedule;
          setActiveSchedules(prev => {
            const existing = prev.find(s => s.id === schedule.id);
            if (existing) {
              return prev.map(s => s.id === schedule.id ? schedule : s);
            } else {
              return [...prev, schedule];
            }
          });

          if (callbacksRef.current.onScheduleUpdate) {
            callbacksRef.current.onScheduleUpdate(schedule);
          }
        }
      });

      const unsubStatus = serviceRef.current.subscribe('driver_status_change', (event: RealTimeEvent) => {
        if (event.type === 'driver_status_change') {
          if (callbacksRef.current.onDriverStatusChange) {
            callbacksRef.current.onDriverStatusChange(event.data as { driverId: string; status: string });
          }
        }
      });

      const unsubConnection = serviceRef.current.subscribe('connection_status', (event: RealTimeEvent) => {
        if (event.type === 'connection_status') {
          const connectionData = event.data as { status: 'connected' | 'disconnected' | 'error' };
          if (connectionData.status === 'connected') {
            setIsConnected(true);
            const status = serviceRef.current.getConnectionStatus();
            setConnectionType(status.type);
            // Show success toast only in production
            if (import.meta.env.PROD) {
              toast.success('Real-time tracking connected');
            }
          } else if (connectionData.status === 'disconnected') {
            setIsConnected(false);
            // Show warning toast only in production
            if (import.meta.env.PROD) {
              toast.warning('Real-time tracking disconnected');
            }
          }
        }
      });

      unsubscribersRef.current = [unsubLocation, unsubSchedule, unsubStatus, unsubConnection];

      const status = serviceRef.current.getConnectionStatus();
      setIsConnected(status.connected);
      setConnectionType(status.type);

    } catch (error) {
      console.warn('Failed to initialize real-time tracking:', error);
      // Don't show error toast in development - API endpoints may not be available yet
      if (import.meta.env.PROD) {
        toast.error('Failed to connect to real-time tracking');
      }
    }
  }, []);

  // Send location update
  const sendLocationUpdate = useCallback(async (location: DriverLocation) => {
    try {
      await serviceRef.current.sendLocationUpdate(location);
    } catch (error) {
      console.error('Failed to send location update:', error);
      toast.error('Failed to update location');
    }
  }, []);

  // Send driver status change
  const sendDriverStatusChange = useCallback(async (driverId: string, status: string) => {
    try {
      await serviceRef.current.sendDriverStatusChange(driverId, status);
    } catch (error) {
      console.error('Failed to send driver status change:', error);
      toast.error('Failed to update driver status');
    }
  }, []);

  // Destroy the service
  const destroy = useCallback(() => {
    unsubscribersRef.current.forEach(unsub => unsub());
    unsubscribersRef.current = [];
    serviceRef.current.destroy();
    setIsConnected(false);
  }, []);

  // Auto-initialize if requested
  useEffect(() => {
    let mounted = true;

    if (autoInitialize && !initializedRef.current) {
      initializedRef.current = true;
      initialize();
    }

    return () => {
      mounted = false;
      if (autoInitialize) {
        destroy();
      }
    };
  }, [autoInitialize, initialize, destroy]);

  // Cleanup on unmount - ensure destroy is called when component unmounts
  useEffect(() => {
    return () => {
      if (initializedRef.current) {
        destroy();
        initializedRef.current = false;
      }
    };
  }, [destroy]);

  return {
    driverLocations,
    trackingLogs,
    activeSchedules,
    isConnected,
    connectionType,
    sendLocationUpdate,
    sendDriverStatusChange,
    initialize,
    destroy
  };
};