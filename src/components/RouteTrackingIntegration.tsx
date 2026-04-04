/**
 * Integration Example: Using Route Tracking with Real-Time Map
 * 
 * Contoh penggunaan lengkap dari RouteTrackingDisplay dalam konteks
 * aplikasi real-time tracking driver.
 */

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { OSM_ATTRIBUTION, OSM_TILE_URL } from '@/lib/map-tiles';
import {
  useRouteTracking,
  RouteInfoPanel,
  ETADisplay,
  RouteTrackingDisplayProps,
} from '@/components/RouteTrackingDisplay';
import { Booking, RoutePoint } from '@/types/shuttle';

// ============================================
// EXAMPLE 1: Simple Route Display Component
// ============================================

interface SimpleRouteMapProps {
  booking: Booking;
  height?: string;
}

export function SimpleRouteMap({ booking, height = 'h-96' }: SimpleRouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Extract coordinates dari booking
  const startPoint = booking.pickupLocation
    ? { lat: booking.pickupLocation.latitude, lng: booking.pickupLocation.longitude }
    : null;

  const endPoint = booking.dropoffLocation
    ? { lat: booking.dropoffLocation.latitude, lng: booking.dropoffLocation.longitude }
    : null;

  // Get tracking data
  const { routeInfo, isLoading, error, polyline } = useRouteTracking(
    startPoint,
    endPoint,
    undefined,
    mapReady ? mapRef.current! : undefined
  );

  return (
    <div className="w-full space-y-4">
      {/* Map */}
      <div className={`${height} rounded-lg overflow-hidden border border-gray-300`}>
        <MapContainer
          center={[startPoint?.lat || -6.2088, startPoint?.lng || 106.8456]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map) => {
            mapRef.current = map;
            setMapReady(true);
          }}
        >
          <TileLayer
            url={OSM_TILE_URL}
            attribution={OSM_ATTRIBUTION}
          />
        </MapContainer>
      </div>

      {/* Route Info */}
      <RouteInfoPanel
        routeInfo={routeInfo}
        isLoading={isLoading}
        error={error}
        compact={false}
      />

      {/* ETA Display */}
      {routeInfo && (
        <ETADisplay
          durationSeconds={routeInfo.totalDuration}
          compact={false}
        />
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 2: Advanced Route Tracker with Stats
// ============================================

interface AdvancedRouteTrackerProps {
  booking: Booking;
  waypoints?: RoutePoint[];
  onRouteReady?: (distance: number, duration: number) => void;
}

export function AdvancedRouteTracker({
  booking,
  waypoints,
  onRouteReady,
}: AdvancedRouteTrackerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'info' | 'eta' | 'stats'>('info');

  const startPoint = booking.pickupLocation
    ? { lat: booking.pickupLocation.latitude, lng: booking.pickupLocation.longitude }
    : null;

  const endPoint = booking.dropoffLocation
    ? { lat: booking.dropoffLocation.latitude, lng: booking.dropoffLocation.longitude }
    : null;

  const waypointCoords = waypoints?.map((wp) => ({
    lat: wp.latitude,
    lng: wp.longitude,
  }));

  const { routeInfo, isLoading, error } = useRouteTracking(
    startPoint,
    endPoint,
    waypointCoords,
    mapReady ? mapRef.current! : undefined
  );

  // Notify parent when route loaded
  useEffect(() => {
    if (routeInfo && onRouteReady) {
      onRouteReady(routeInfo.totalDistance, routeInfo.totalDuration);
    }
  }, [routeInfo, onRouteReady]);

  return (
    <div className="w-full space-y-4">
      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={[startPoint?.lat || -6.2088, startPoint?.lng || 106.8456]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map) => {
            mapRef.current = map;
            setMapReady(true);
          }}
        >
          <TileLayer
            url={OSM_TILE_URL}
            attribution={OSM_ATTRIBUTION}
          />
        </MapContainer>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['info', 'eta', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'info' && '📍 Rute'}
            {tab === 'eta' && '⏱️ ETA'}
            {tab === 'stats' && '📊 Statistik'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {selectedTab === 'info' && (
          <RouteInfoPanel
            routeInfo={routeInfo}
            isLoading={isLoading}
            error={error}
            compact={false}
          />
        )}

        {selectedTab === 'eta' && routeInfo && (
          <ETADisplay durationSeconds={routeInfo.totalDuration} compact={false} />
        )}

        {selectedTab === 'stats' && routeInfo && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold">Jarak Total</p>
                <p className="text-lg font-bold text-blue-900">
                  {(routeInfo.totalDistance / 1000).toFixed(1)} km
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="text-xs text-green-600 font-semibold">Waktu Tempuh</p>
                <p className="text-lg font-bold text-green-900">
                  {Math.round(routeInfo.totalDuration / 60)} menit
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded border border-purple-200">
                <p className="text-xs text-purple-600 font-semibold">Kecepatan Rata-rata</p>
                <p className="text-lg font-bold text-purple-900">
                  {(
                    (routeInfo.totalDistance / routeInfo.totalDuration) *
                    3.6
                  ).toFixed(1)}{' '}
                  km/h
                </p>
              </div>
            </div>

            {routeInfo.waypoints.length > 0 && (
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  ✓ {routeInfo.waypoints.length} Waypoints
                </p>
                <div className="space-y-1">
                  {routeInfo.waypoints.map((wp, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-gray-600">
                      <span>
                        {idx + 1}. {wp.name || `Waypoint ${idx + 1}`}
                      </span>
                      <span>{(wp.distance / 1000).toFixed(1)} km</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Driver Tracking View Integration
// ============================================

interface DriverTrackingViewProps {
  bookingId: string;
  driverLocation: { lat: number; lng: number };
  // Additional props as needed
}

export function DriverTrackingViewExample({ bookingId, driverLocation }: DriverTrackingViewProps) {
  // This is a placeholder for how you'd integrate in DriverTracking.tsx
  // Actual implementation would depend on your data fetching strategy

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Left: Main Map */}
      <div className="col-span-2 h-screen flex flex-col">
        <div className="flex-1 rounded-lg overflow-hidden border border-gray-300">
          {/* Map container here */}
        </div>
      </div>

      {/* Right: Route & ETA Info */}
      <div className="space-y-4 overflow-y-auto">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h2 className="font-bold text-lg mb-4">🚗 Status Perjalanan</h2>
          {/* Router info panels here */}
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-bold mb-3">📌 Rute Perjalanan</h3>
          {/* RouteInfoPanel here */}
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-bold mb-3">⏱️ Waktu Tiba</h3>
          {/* ETADisplay here */}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Admin Tracking Dashboard Integration
// ============================================

interface AdminTrackingDashboardProps {
  activeBookings: Booking[];
}

export function AdminTrackingDashboardExample({ activeBookings }: AdminTrackingDashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {activeBookings.slice(0, 4).map((booking) => (
        <div key={booking.bookingId} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="mb-3">
            <h3 className="font-bold text-lg">
              {booking.pickupLocation?.name} → {booking.dropoffLocation?.name}
            </h3>
            <p className="text-sm text-gray-600">ID: {booking.bookingId}</p>
          </div>

          {/* Simple route map for each booking */}
          <SimpleRouteMap booking={booking} height="h-40" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// INTEGRATION CHECKLIST
// ============================================
/**
 * Langkah-langkah integrasi:
 * 
 * 1. ✅ Create RouteTrackingDisplay component with:
 *    - useRouteTracking hook
 *    - RouteInfoPanel component
 *    - ETADisplay component
 * 
 * 2. 📋 Update RealTimeMap.tsx:
 *    - Import useRouteTracking hook
 *    - Initialize hook with pickup/dropoff coordinates
 *    - Display RouteInfoPanel and ETADisplay
 * 
 * 3. 📋 Update DriverTracking.tsx:
 *    - Show route polyline from driver location to next stop
 *    - Display ETA for next destination
 * 
 * 4. 📋 Update AdminTracking.tsx:
 *    - Show 4-grid of active booking routes
 *    - Display distance and ETA for each
 * 
 * 5. 📋 Test dengan real coordinates:
 *    - Jemput: -6.2088, 106.8456 (Jakarta)
 *    - Tujuan: -6.3157, 106.7534 (Bekasi)
 * 
 * 6. 📋 (Optional) Set up custom OSRM instance for production
 */
