import { useEffect, useRef, useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Signal, Clock, Check, ChevronRight, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapView from '@/components/MapView';
import MapLegend from '@/components/MapLegend';
import { cn } from '@/lib/utils';
import { DRIVER_TYPOGRAPHY, DRIVER_LAYOUT } from '@/lib/driver-ui';
import { toast } from 'sonner';
import { useRouteTracking, ETADisplay } from '@/components/RouteTrackingDisplay';
import {
  createRoutePointIcon,
  createRouteLine,
  createRoutePointPopup,
} from '@/lib/map-icons';

const DriverTracking = () => {
  const { schedules, routes, routePoints, currentUser, updateDriverLocation } = useShuttle();
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  const markerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const activeSchedule = schedules.find(s => s.driverId === currentUser?.id && (s.status === 'departed' || s.status === 'boarding' || s.status === 'scheduled'));
  const route = routes.find(r => r.id === activeSchedule?.routeId);
  const points = routePoints.filter(p => p.routeId === activeSchedule?.routeId).sort((a, b) => a.order - b.order);

  // Setup route tracking for ETA calculation
  const pickupPoint = points[0];
  const dropoffPoint = points[points.length - 1];

  const { routeInfo, isLoading: routeLoading } = useRouteTracking(
    pickupPoint ? { lat: pickupPoint.lat, lng: pickupPoint.lng } : null,
    dropoffPoint ? { lat: dropoffPoint.lat, lng: dropoffPoint.lng } : null,
    points.slice(1, -1).map(p => ({ lat: p.lat, lng: p.lng })),
    mapReady ? map || undefined : undefined
  );

  // Detect when map is ready
  useEffect(() => {
    if (map) {
      setMapReady(true);
    }
  }, [map]);

  // Setup Map Layers with improved visualization
  useEffect(() => {
    if (!map || points.length === 0) return;

    // Draw route line using the library
    const latlngs = points.map(p => [p.lat, p.lng] as [number, number]);
    const routeLine = createRouteLine(latlngs, activeSchedule?.status || 'scheduled', true);
    routeLine.addTo(map);

    // Fit map to route with padding
    map.fitBounds(routeLine.getBounds(), { padding: [80, 80] });

    // Add route point markers using the library
    points.forEach((p, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === points.length - 1;
      const pointType = isFirst ? 'origin' : isLast ? 'destination' : 'intermediate';
      
      const icon = createRoutePointIcon(pointType, idx + 1, false, false);
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
      
      // Create popup with route point info
      const nextPoint = points[idx + 1];
      const distanceFromStart = idx === 0 ? 0 : 
        Math.sqrt(Math.pow(p.lat - points[0].lat, 2) + Math.pow(p.lng - points[0].lng, 2)) * 111;
      
      const popupHTML = createRoutePointPopup(p, idx + 1, nextPoint, distanceFromStart * 1000);
      marker.bindPopup(L.popup({ className: 'route-point-popup', maxWidth: 300 }).setContent(popupHTML));
    });

    // Add current driver position indicator
    if (points.length > 0) {
      const currentPointIdx = currentPointIndex >= points.length ? points.length - 1 : currentPointIndex;
      const currentPoint = points[currentPointIdx];

      const driverIconHTML = `
        <div style="
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: white;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          border: 4px solid white;
          position: relative;
        ">
          🚐
          ${isTracking ? '<div style="position:absolute;top:-6px;right:-6px;width:14px;height:14px;background:#10b981;border-radius:50%;border:3px solid white;animation:pulse 1.5s infinite;"></div>' : ''}
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.3); }
          }
        </style>
      `;

      const driverIcon = L.divIcon({
        className: 'current-driver-marker',
        html: driverIconHTML,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50],
      });

      markerRef.current = L.marker([currentPoint.lat, currentPoint.lng], {
        icon: driverIcon,
        zIndexOffset: 1000
      }).addTo(map);

      const driverPopupHTML = `
        <div style="font-family: system-ui; font-size: 13px;">
          <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; padding: 12px; border-radius: 8px 8px 0 0; font-weight: bold;">
            🚐 Driver Current Position
          </div>
          <div style="background: white; padding: 12px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <div style="margin-bottom: 8px;">
              <span style="color: #6b7280; font-size: 12px;">📍 Lokasi Sekarang:</span> <br/>
              <span style="font-weight: bold; color: #1e40af;">Point #${currentPointIdx + 1} - ${currentPoint.name}</span>
            </div>
            <div style="color: #6b7280; font-size: 12px; line-height: 1.4;">
              <p>Koordinat: ${currentPoint.lat.toFixed(6)}, ${currentPoint.lng.toFixed(6)}</p>
              <p>Status: ${isTracking ? '<span style="color: #10b981; font-weight: bold;">🟢 Tracking Active</span>' : '<span style="color: #9ca3af; font-weight: bold;">⚫ Tracking Inactive</span>'}</p>
            </div>
          </div>
        </div>
      `;

      markerRef.current.bindPopup(L.popup({ className: 'driver-marker-popup', maxWidth: 300 }).setContent(driverPopupHTML));
    }

    return () => {
      // Clean up non-basemap layers
      map.eachLayer(l => {
        if (!(l instanceof L.TileLayer)) {
          map.removeLayer(l);
        }
      });
    };
  }, [map, points, isTracking, currentUser, currentPointIndex, activeSchedule]);

  // Real GPS Tracking Implementation
  useEffect(() => {
    if (!isTracking || !currentUser) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setGpsError("Geolocation tidak didukung oleh browser Anda.");
      setIsTracking(false);
      return;
    }

    toast.info("Memulai tracking GPS...");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, accuracy, heading, altitude } = position.coords;
        
        setGpsError(null);
        
        // Update context
        updateDriverLocation(currentUser.id, {
          latitude,
          longitude,
          speed,
          accuracy,
          heading,
          altitude,
          timestamp: new Date().toISOString()
        });

        // Update local map
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        }
        if (map) {
          map.panTo([latitude, longitude], { animate: true });
        }

        // Simple logic to detect nearest point for UI
        if (points.length > 0) {
          let minIdx = 0;
          let minDist = Infinity;
          points.forEach((p, i) => {
            const d = Math.sqrt(Math.pow(p.lat - latitude, 2) + Math.pow(p.lng - longitude, 2));
            if (d < minDist) {
              minDist = d;
              minIdx = i;
            }
          });
          // Only update if within 500m (rough estimation)
          if (minDist < 0.005) {
            setCurrentPointIndex(minIdx);
          }
        }
      },
      (error) => {
        let msg = "Gagal mendapatkan lokasi.";
        switch(error.code) {
          case error.PERMISSION_DENIED: msg = "Izin lokasi ditolak."; break;
          case error.POSITION_UNAVAILABLE: msg = "Informasi lokasi tidak tersedia."; break;
          case error.TIMEOUT: msg = "Waktu permintaan lokasi habis."; break;
        }
        setGpsError(msg);
        toast.error(msg);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTracking, currentUser, map, points, updateDriverLocation]);

  return (
    <div className={cn("p-4 pb-24", DRIVER_LAYOUT.sectionGap)}>
      <div className="flex items-center justify-between px-1">
        <h2 className={DRIVER_TYPOGRAPHY.heading2}>GPS Tracking</h2>
        <Badge className={cn(
          "px-3 py-1 font-black uppercase tracking-widest text-[10px] border-none",
          isTracking ? "bg-emerald-500 text-white animate-pulse" : "bg-slate-200 text-slate-500"
        )}>
          {isTracking ? '📡 LIVE' : 'OFFLINE'}
        </Badge>
      </div>

      {gpsError && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-500">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-xs font-bold leading-tight">{gpsError}</p>
        </div>
      )}

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
        <CardContent className="p-0 relative">
          <div className="h-[400px] w-full">
            <MapView onMapReady={setMap} />
            {/* Map Legend */}
            <MapLegend variant="compact" position="bottom-right" />
          </div>
          
          {/* Floating Route Info */}
          {route && (
            <div className="absolute top-4 left-4 right-4 z-[400] space-y-3">
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center justify-between">
                <div>
                  <p className={DRIVER_TYPOGRAPHY.caption + " text-primary mb-1"}>Rute Aktif</p>
                  <p className="font-black text-slate-800 tracking-tight leading-none">{route.name}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Navigation className="h-5 w-5 text-primary" />
                </div>
              </div>

              {/* ETA Display */}
              {routeInfo && !routeLoading && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-2xl shadow-lg">
                  <ETADisplay 
                    durationSeconds={routeInfo.totalDuration} 
                    compact={true}
                  />
                  <p className="text-xs text-emerald-700 font-bold mt-2">
                    📍 {(routeInfo.totalDistance / 1000).toFixed(1)} km ke tujuan
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Floating Tracking Toggle */}
          <div className="absolute bottom-6 left-6 right-6 z-[400]">
            <Button
              className={cn(
                "w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95",
                isTracking ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
              )}
              onClick={() => setIsTracking(!isTracking)}
            >
              {isTracking ? <Signal className="h-5 w-5 mr-2 animate-pulse" /> : <MapPin className="h-5 w-5 mr-2" />}
              {isTracking ? 'Hentikan Tracking' : 'Aktifkan GPS'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Route points list */}
      <div className="space-y-4">
        <h3 className={DRIVER_TYPOGRAPHY.caption + " px-1"}>Titik Penjemputan ({points.length})</h3>
        <div className="space-y-3">
          {points.map((p, i) => {
            const isActive = i === currentPointIndex && isTracking;
            const isPassed = i < currentPointIndex && isTracking;
            
            return (
              <Card key={p.id} className={cn(
                "border-none shadow-sm transition-all rounded-2xl bg-white overflow-hidden",
                isActive ? "ring-2 ring-primary ring-offset-2" : "",
                isPassed ? "opacity-50" : "opacity-100"
              )}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all",
                    isActive ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" : 
                    isPassed ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                  )}>
                    {isPassed ? <Check className="h-5 w-5 stroke-[3px]" /> : p.code.replace('J', '')}
                  </div>
                  <div className="flex-1">
                    <p className={cn("font-black text-sm tracking-tight", isActive ? "text-primary" : "text-slate-700")}>
                      {p.name}
                    </p>
                    {isActive && (
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 animate-pulse">
                        📍 Sedang di lokasi
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <ChevronRight className="h-4 w-4 text-primary animate-bounce-x" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DriverTracking;
