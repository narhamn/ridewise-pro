/**
 * PRACTICAL INTEGRATION EXAMPLE
 * ==============================
 * 
 * How to integrate Route Tracking into RealTimeMap.tsx
 * This file shows the exact code changes needed.
 */

// ========================================
// STEP 1: Add imports to RealTimeMap.tsx
// ========================================

// ADD THESE IMPORTS AT THE TOP:
import { useRouteTracking, RouteInfoPanel, ETADisplay } from '@/components/RouteTrackingDisplay';

// ========================================
// STEP 2: Modify RealTimeMapProps interface
// ========================================

// ADD THESE PROPS:
interface RealTimeMapProps {
  // ... existing props ...
  
  // NEW: Route tracking props
  showRouteTracking?: boolean;              // Enable/disable route tracking
  selectedScheduleId?: string | null;       // Which schedule to show route for
  onRouteInfoChange?: (routeInfo: RouteInfo | null) => void;  // Callback when route loads
}

// ========================================
// STEP 3: Add state management
// ========================================

// ADD INSIDE RealTimeMap component:
const [mapReady, setMapReady] = useState(false);
const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(null);
const [routeLoading, setRouteLoading] = useState(false);

// ========================================
// STEP 4: Initialize route tracking hook
// ========================================

// ADD AFTER OTHER HOOKS:
const selectedSchedule = activeSchedules.find(s => s.id === selectedScheduleId);
const selectedRoute_coords = selectedSchedule
  ? routes.find(r => r.id === selectedSchedule.routeId)
  : null;

const routePoints_forSchedule = selectedRoute_coords
  ? routePoints.filter(p => p.routeId === selectedRoute_coords.id)
      .sort((a, b) => a.order - b.order)
  : [];

const pickupPoint = routePoints_forSchedule[0];
const dropoffPoint = routePoints_forSchedule[routePoints_forSchedule.length - 1];

// Use the tracking hook
const { 
  routeInfo, 
  isLoading: routeIsLoading, 
  error: routeError 
} = useRouteTracking(
  pickupPoint ? { lat: pickupPoint.lat, lng: pickupPoint.lng } : null,
  dropoffPoint ? { lat: dropoffPoint.lat, lng: dropoffPoint.lng } : null,
  routePoints_forSchedule.slice(1, -1).map(p => ({ lat: p.lat, lng: p.lng })),
  mapReady ? mapInstance.current || undefined : undefined
);

// Update parent component when route info changes
useEffect(() => {
  if (onRouteInfoChange) {
    onRouteInfoChange(routeInfo);
  }
  setSelectedRoute(routeInfo);
}, [routeInfo, onRouteInfoChange]);

// ========================================
// STEP 5: Update map initialization
// ========================================

// IN THE EFFECT THAT INITIALIZES THE MAP:
mapInstance.current = map;
setMapReady(true);  // Add this line

if (onMapReady) {
  onMapReady(map);
}

// ========================================
// STEP 6: Update JSX to show route info
// ========================================

// ADD THIS ALONGSIDE YOUR EXISTING MAP JSX:

// Option A: Show route info in a sidebar
return (
  <div className={cn('w-full', className)}>
    <div className="flex gap-4 h-full">
      {/* Map container - 70% */}
      <div 
        ref={mapRef} 
        className="flex-1 rounded-lg overflow-hidden border border-gray-300"
      />
      
      {/* Route info panel - 30% */}
      {showRouteTracking && selectedScheduleId && (
        <div className="w-80 flex-shrink-0 p-4 bg-white rounded-lg border border-gray-300 overflow-y-auto space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-2">📍 Rute Perjalanan</h3>
            <p className="text-sm text-gray-600">
              {selectedSchedule?.bookingId}
            </p>
          </div>

          {/* Route information */}
          <RouteInfoPanel
            routeInfo={routeInfo}
            isLoading={routeIsLoading}
            error={routeError}
            compact={false}
          />

          {/* ETA */}
          {routeInfo && (
            <ETADisplay
              durationSeconds={routeInfo.totalDuration}
              compact={false}
            />
          )}

          {/* Additional details */}
          {routeInfo && (
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">📊 Statistik</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Kecepatan Rata-rata:</span>
                  <strong>
                    {(
                      (routeInfo.totalDistance / routeInfo.totalDuration) * 3.6
                    ).toFixed(1)} km/h
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Jarak:</span>
                  <strong>{(routeInfo.totalDistance / 1000).toFixed(2)} km</strong>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi Waktu:</span>
                  <strong>{Math.round(routeInfo.totalDuration / 60)} menit</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

// ========================================
// FULL INTEGRATION EXAMPLE
// ========================================

// Here's how to use the updated RealTimeMap in your pages:

// In src/pages/admin/AdminTracking.tsx:
export function AdminTracking() {
  const [activeSchedules, setActiveSchedules] = useState<Schedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  return (
    <div className="space-y-4">
      {/* Header with route info */}
      <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold">🚍 Real-Time Tracking</h1>
        {routeInfo && (
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Jarak: {(routeInfo.totalDistance / 1000).toFixed(1)} km
            </p>
            <p className="text-sm text-gray-600">
              ETA: {Math.round(routeInfo.totalDuration / 60)} menit
            </p>
          </div>
        )}
      </div>

      {/* Map with route tracking */}
      <div className="h-[600px] rounded-lg overflow-hidden border border-gray-300">
        <RealTimeMap
          center={[-6.2088, 106.8456]}
          zoom={13}
          activeSchedules={activeSchedules}
          drivers={drivers}
          driverLocations={driverLocations}
          routes={routes}
          routePoints={routePoints}
          showRouteTracking={true}
          selectedScheduleId={selectedScheduleId}
          onRouteInfoChange={setRouteInfo}
          onDriverClick={(driverId) => {
            // Find schedule for this driver and show its route
            const schedule = activeSchedules.find(s => s.driverId === driverId);
            if (schedule) {
              setSelectedScheduleId(schedule.id);
            }
          }}
        />
      </div>

      {/* List of active bookings */}
      <div className="space-y-2">
        <h2 className="font-bold text-lg">📋 Perjalanan Aktif</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeSchedules.map((schedule) => (
            <button
              key={schedule.id}
              onClick={() => setSelectedScheduleId(schedule.id)}
              className={cn(
                'p-3 rounded-lg border-2 transition-all text-left',
                selectedScheduleId === schedule.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <p className="font-bold text-sm">{schedule.bookingId}</p>
              <p className="text-xs text-gray-600">Driver: {schedule.driverId}</p>
              <p className="text-xs text-gray-500">Status: {schedule.status}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========================================
// INTEGRATION CHECKLIST
// ========================================

/**
 * To integrate Route Tracking into RealTimeMap:
 *
 * [ ] 1. Add imports (RouteTrackingDisplay components)
 * [ ] 2. Add RouteInfoPanel & ETADisplay exports to RouteTrackingDisplay.tsx
 * [ ] 3. Add new props to RealTimeMapProps interface:
 *      - showRouteTracking?: boolean
 *      - selectedScheduleId?: string | null
 *      - onRouteInfoChange?: (info: RouteInfo | null) => void
 * 
 * [ ] 4. Import useRouteTracking hook
 * [ ] 5. Add state for: mapReady, selectedRoute
 * [ ] 6. Calculate coordinates from selected schedule
 * [ ] 7. Call useRouteTracking hook with coordinates
 * [ ] 8. Add useEffect to notify parent of route changes
 * [ ] 9. Update map JSX to show RouteInfoPanel and ETADisplay
 * [ ] 10. Update AdminTracking to use new props
 * [ ] 11. Test with multiple active schedules
 *
 * Estimated Time: 30-45 minutes
 * Complexity: Medium (mostly copy-paste)
 * Testing: Check route visualization in browser DevTools
 */

// ========================================
// QUICK REFERENCE: Key Functions
// ========================================

/**
 * Function: useRouteTracking
 * @param startPoint { lat, lng } - Pickup location
 * @param endPoint { lat, lng } - Dropoff location  
 * @param waypoints Array of intermediate stops
 * @param map Leaflet map instance
 * @returns { routeInfo, isLoading, error, polyline }
 */

/**
 * Component: RouteInfoPanel
 * Props: { routeInfo, isLoading, error, compact? }
 * Shows: Distance, duration, waypoints breakdown
 */

/**
 * Component: ETADisplay
 * Props: { durationSeconds, startTime?, compact? }
 * Shows: Estimated arrival time calculation
 */

// ========================================
// HANDLING MULTIPLE ROUTES
// ========================================

/**
 * To show different routes as user clicks on different bookings:
 *
 * 1. Store selectedScheduleId in state
 * 2. useRouteTracking automatically recalculates when coordinates change
 * 3. Polyline automatically rendered when route loads
 * 4. Route info updates in sidebar
 *
 * No special handling needed - React hooks manage it automatically!
 */
