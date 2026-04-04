import { useState, useEffect, useRef, useCallback } from 'react';
import { DriverLocation, GPSStatus } from '@/types/shuttle';

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  syncIntervalMs?: number;
}

export const useGeolocation = (options: GeolocationOptions = {}, enabled: boolean = true) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    syncIntervalMs = 30000 // 30 seconds default
  } = options;

  const [location, setLocation] = useState<DriverLocation | null>(() => {
    const saved = localStorage.getItem('last_known_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [status, setStatus] = useState<GPSStatus>('searching');
  const [error, setError] = useState<string | null>(null);
  
  const watchId = useRef<number | null>(null);
  const lastSyncTime = useRef<number>(0);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    const newLocation: DriverLocation = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      altitude: pos.coords.altitude,
      accuracy: pos.coords.accuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
      timestamp: new Date(pos.timestamp).toISOString()
    };

    // Accuracy Check: if accuracy > 100m, consider it weak
    if (pos.coords.accuracy > 100) {
      setStatus('weak');
    } else {
      setStatus('active');
    }

    setLocation(newLocation);
    setError(null);
    localStorage.setItem('last_known_location', JSON.stringify(newLocation));

    // Adaptive Sync Logic: 
    // If speed is 0 (stopped), sync less often (e.g. every 2 mins)
    // If speed is high, sync every 30s.
    const speed = pos.coords.speed || 0;
    const currentInterval = speed > 0.5 ? syncIntervalMs : 120000; // 30s vs 2min
    
    const now = Date.now();
    if (now - lastSyncTime.current >= currentInterval) {
      syncLocationToServer(newLocation);
      lastSyncTime.current = now;
    }
  }, [syncIntervalMs]);

  const handleError = useCallback((err: GeolocationPositionError) => {
    console.error('Geolocation Error:', err);
    setStatus('error');
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setError("Izin lokasi ditolak. Aktifkan GPS di pengaturan browser.");
        break;
      case err.POSITION_UNAVAILABLE:
        setError("Informasi lokasi tidak tersedia.");
        break;
      case err.TIMEOUT:
        setError("Waktu pengambilan lokasi habis (Signal Lemah).");
        setStatus('weak');
        break;
      default:
        setError("Terjadi kesalahan pada GPS.");
    }
  }, []);

  const syncLocationToServer = async (loc: DriverLocation) => {
    // Mock API call
    try {
      // In a real app: await fetch('/api/driver/location', { method: 'POST', body: JSON.stringify(loc) });
      console.log(`[GPS SYNC] Data sent to server: ${loc.latitude}, ${loc.longitude} (Acc: ${loc.accuracy}m)`);
    } catch (e) {
      console.error('Failed to sync location:', e);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setStatus('inactive');
      return;
    }

    if (!navigator.geolocation) {
      setError("Browser tidak mendukung Geolocation.");
      setStatus('error');
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge
    });

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [handleSuccess, handleError, enableHighAccuracy, timeout, maximumAge]);

  return { location, status, error, syncLocationToServer };
};
