/**
 * Route Tracking Map Component
 * Menampilkan rute actual dari pickup ke destination menggunakan OSRM
 */

import { useEffect, useRef, useMemo, useState } from 'react';
import L from 'leaflet';
import { RoutePoint, Booking } from '@/types/shuttle';
import {
  getRouteCached,
  createRoutePolyline,
  formatDistance,
  formatDuration,
  extractRouteInfo,
  routePointsToCoordinates,
  RouteInfo,
  RoutingResponse,
} from '@/services/routeTracking';
import { toast } from 'sonner';

export interface RouteTrackingDisplayProps {
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  waypoints?: { lat: number; lng: number }[];
  map: L.Map;
  onRouteLoaded?: (info: RouteInfo) => void;
  polylineColor?: string;
  showMarkers?: boolean;
  autoFitBounds?: boolean;
}

export interface RouteTrackingHookResult {
  routeInfo: RouteInfo | null;
  isLoading: boolean;
  error: string | null;
  polyline: L.Polyline | null;
  routeResponse: RoutingResponse | null;
}

/**
 * Hook untuk loading dan visualisasi rute
 */
export function useRouteTracking(
  startPoint: { lat: number; lng: number } | null,
  endPoint: { lat: number; lng: number } | null,
  waypoints?: { lat: number; lng: number }[],
  map?: L.Map
): RouteTrackingHookResult {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polyline, setPolyline] = useState<L.Polyline | null>(null);
  const [routeResponse, setRouteResponse] = useState<RoutingResponse | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!startPoint || !endPoint || !map) {
      return;
    }

    let isMounted = true;

    const loadRoute = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Susun points untuk routing
        const points = [
          startPoint,
          ...(waypoints || []),
          endPoint,
        ];

        // Dapatkan rute dari OSRM
        const response = await getRouteCached(points);

        if (!isMounted) return;

        if (!response) {
          setError('Gagal memuat rute. Coba lagi.');
          return;
        }

        // Extract informasi rute
        const info = extractRouteInfo(response);
        setRouteInfo(info);
        setRouteResponse(response);

        // Hapus polyline lama jika ada
        if (polylineRef.current) {
          map.removeLayer(polylineRef.current);
        }

        // Buat polyline baru
        const newPolyline = createRoutePolyline(
          info.route.geometry as [number, number][],
          {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
            lineCap: 'round',
          }
        );

        newPolyline.addTo(map);
        polylineRef.current = newPolyline;
        setPolyline(newPolyline);

        // Auto fit bounds
        const bounds = newPolyline.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat rute');
        console.error('Route tracking error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRoute();

    return () => {
      isMounted = false;
      if (polylineRef.current && map.hasLayer(polylineRef.current)) {
        map.removeLayer(polylineRef.current);
      }
    };
  }, [startPoint, endPoint, waypoints, map]);

  return {
    routeInfo,
    isLoading,
    error,
    polyline,
    routeResponse,
  };
}

/**
 * Component untuk menampilkan informasi rute
 */
export interface RouteInfoPanelProps {
  routeInfo: RouteInfo | null;
  isLoading: boolean;
  error: string | null;
  compact?: boolean;
}

export function RouteInfoPanel({
  routeInfo,
  isLoading,
  error,
  compact = false,
}: RouteInfoPanelProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin">⏳</div>
          <span className="ml-2 text-sm text-blue-700">Memuat rute...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">❌ {error}</p>
      </div>
    );
  }

  if (!routeInfo) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">Tidak ada informasi rute</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
        <div>
          <p className="text-xs text-blue-600 font-semibold">Jarak</p>
          <p className="text-lg font-bold text-blue-900">{formatDistance(routeInfo.totalDistance)}</p>
        </div>
        <div>
          <p className="text-xs text-blue-600 font-semibold">Durasi</p>
          <p className="text-lg font-bold text-blue-900">{formatDuration(routeInfo.totalDuration)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-3">
      <h3 className="font-semibold text-gray-900">📍 Informasi Rute</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Total Jarak</p>
          <p className="text-xl font-bold text-blue-900">{formatDistance(routeInfo.totalDistance)}</p>
        </div>

        <div className="p-3 bg-green-50 rounded border border-green-200">
          <p className="text-xs text-green-600 font-semibold">Estimasi Waktu</p>
          <p className="text-xl font-bold text-green-900">{formatDuration(routeInfo.totalDuration)}</p>
        </div>
      </div>

      {routeInfo.waypoints.length > 0 && (
        <div className="p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">📌 Waypoints:</p>
          <div className="space-y-1">
            {routeInfo.waypoints.map((wp, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{idx + 1}. {wp.name || `Waypoint ${idx + 1}`}</span>
                <span className="text-gray-500">{(wp.distance / 1000).toFixed(1)} km</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>⚙️ Data rute dari OpenStreetMap Routing Service</p>
      </div>
    </div>
  );
}

/**
 * Component untuk menampilkan estimated arrival time
 */
export interface ETADisplayProps {
  durationSeconds: number;
  startTime?: Date;
  compact?: boolean;
}

export function ETADisplay({
  durationSeconds,
  startTime = new Date(),
  compact = false,
}: ETADisplayProps) {
  const eta = useMemo(() => {
    const arrivalTime = new Date(startTime.getTime() + durationSeconds * 1000);
    return {
      time: arrivalTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration: formatDuration(durationSeconds),
    };
  }, [durationSeconds, startTime]);

  if (compact) {
    return (
      <div className="text-sm font-semibold text-blue-900">
        ETA: {eta.time} ({eta.duration})
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg">
      <p className="text-xs text-indigo-600 font-semibold mb-1">⏱️ ESTIMASI WAKTU TIBA</p>
      <p className="text-2xl font-bold text-indigo-900">{eta.time}</p>
      <p className="text-sm text-indigo-700">{eta.duration} dari sekarang</p>
    </div>
  );
}
