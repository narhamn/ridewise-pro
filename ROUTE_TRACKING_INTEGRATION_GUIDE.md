# Route Tracking Complete Integration Guide

## Overview
This guide shows how to integrate the Route Tracking system (OSRM-based polyline rendering with ETA calculations) into your PYU GO application. The system provides:

- ✅ Real-time route visualization using OpenStreetMap Routing Service (OSRM)
- ✅ Estimated Time of Arrival (ETA) calculations
- ✅ Route distance and duration metrics
- ✅ Multi-waypoint support
- ✅ Built-in caching for performance
- ✅ Responsive UI components

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│         React Components (RouteTrackingDisplay)         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  useRouteTracking Hook                          │   │
│  │  - Manages route loading state                  │   │
│  │  - Handles polyline rendering                   │   │
│  │  - Provides route info (distance, duration)     │   │
│  └──────────────────┬────────────────────────────┘   │
│                     │                                  │
│  ┌──────────────────▼────────────────────────────┐   │
│  │  RouteInfoPanel Component                      │   │
│  │  - Displays route statistics                   │   │
│  │  - Shows waypoint breakdown                    │   │
│  │  - Compact & full versions available           │   │
│  └────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │  ETADisplay Component                           │   │
│  │  - Shows estimated arrival time                │   │
│  │  - Calculates from current time + duration     │   │
│  │  - Locale-aware time formatting                │   │
│  └────────────────────────────────────────────┘   │
└──────────────────────┬─────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  RouteTracking Service      │
        │  (src/services/...)         │
        │                             │
        │  ✓ getRoute()              │
        │  ✓ getRouteCached()        │
        │  ✓ createRoutePolyline()   │
        │  ✓ formatDistance()        │
        │  ✓ formatDuration()        │
        │  ✓ extractRouteInfo()      │
        └──────────────┬─────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  OSRM API                   │
        │ (openstreetmap.org)         │
        │                             │
        │  Route: /route/v1/driving   │
        │  Format: GeoJSON + stats    │
        └─────────────────────────────┘
```

## File Structure

```
src/
├── services/
│   └── routeTracking.ts                    ← Core OSRM integration
├── components/
│   ├── RouteTrackingDisplay.tsx            ← React components & hook
│   └── RouteTrackingIntegration.tsx        ← Integration examples
├── pages/
│   ├── driver/
│   │   └── DriverTracking.tsx              ← (Update required)
│   └── admin/
│       └── AdminTracking.tsx               ← (Update required)
└── types/
    └── shuttle.ts                          ← Type definitions
```

## Component API

### useRouteTracking Hook

**Purpose**: Load and render a route between two points

**Usage**:
```typescript
const {
  routeInfo,      // Route info object with distance, duration, waypoints
  isLoading,      // boolean - true while fetching route
  error,          // string | null - error message if any
  polyline,       // L.Polyline | null - rendered polyline on map
  routeResponse   // Raw OSRM response for advanced usage
} = useRouteTracking(
  startPoint,               // { lat, lng }
  endPoint,                 // { lat, lng }
  waypoints,                // [{ lat, lng }, ...] optional
  map                       // L.Map instance
);
```

**Example**:
```typescript
function MyMap() {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const { routeInfo, isLoading } = useRouteTracking(
    { lat: -6.2088, lng: 106.8456 },  // Jakarta Pick-up
    { lat: -6.3157, lng: 106.7534 },  // Bekasi Drop-off
    undefined,
    mapReady ? mapRef.current! : undefined
  );

  return (
    <MapContainer ref={mapRef} onReady={() => setMapReady(true)}>
      {/* Map content */}
    </MapContainer>
  );
}
```

### RouteInfoPanel Component

**Purpose**: Display formatted route information

**Props**:
```typescript
interface RouteInfoPanelProps {
  routeInfo: RouteInfo | null;
  isLoading: boolean;
  error: string | null;
  compact?: boolean;  // Default: false
}
```

**Usage**:
```typescript
<RouteInfoPanel
  routeInfo={routeInfo}
  isLoading={isLoading}
  error={error}
  compact={false}  // Shows detailed info with waypoints
/>
```

**Output Variants**:
- **Loading state**: Shows spinner with "Memuat rute..."
- **Error state**: Displays error message in red panel
- **Empty state**: "Tidak ada informasi rute"
- **Compact mode**: Single-line distance/duration display
- **Full mode**: 2-column layout with waypoint breakdown

### ETADisplay Component

**Purpose**: Show estimated arrival time

**Props**:
```typescript
interface ETADisplayProps {
  durationSeconds: number;   // Total route duration in seconds
  startTime?: Date;          // Optional start time (default: now)
  compact?: boolean;         // Default: false
}
```

**Usage**:
```typescript
{routeInfo && (
  <ETADisplay
    durationSeconds={routeInfo.totalDuration}
    startTime={new Date()}
    compact={false}
  />
)}
```

**Output**:
- **Compact**: "ETA: 14:45 (45 menit)" inline
- **Full**: Large time display with "45 menit dari sekarang"

## Integration Steps

### Step 1: Update RealTimeMap Component

**File**: `src/components/RealTimeMap.tsx`

```typescript
import { useRouteTracking, RouteInfoPanel, ETADisplay } from '@/components/RouteTrackingDisplay';

export function RealTimeMap() {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Load route for selected booking
  const { routeInfo, isLoading, error } = useRouteTracking(
    selectedBooking?.pickupLocation
      ? {
          lat: selectedBooking.pickupLocation.latitude,
          lng: selectedBooking.pickupLocation.longitude,
        }
      : null,
    selectedBooking?.dropoffLocation
      ? {
          lat: selectedBooking.dropoffLocation.latitude,
          lng: selectedBooking.dropoffLocation.longitude,
        }
      : null,
    undefined,
    mapReady ? mapRef.current! : undefined
  );

  return (
    <div className="flex gap-4 h-screen">
      {/* Map - 70% width */}
      <div className="flex-1">
        <MapContainer
          center={[-6.2088, 106.8456]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          onReady={() => setMapReady(true)}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
        </MapContainer>
      </div>

      {/* Route Info Panel - 30% width */}
      <div className="flex-shrink-0 w-96 overflow-y-auto space-y-4 p-4">
        {selectedBooking && (
          <>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="font-bold mb-2">
                {selectedBooking.pickupLocation?.name}
              </h3>
              <p className="text-sm text-gray-600">
                → {selectedBooking.dropoffLocation?.name}
              </p>
            </div>

            {/* Route visualization */}
            <RouteInfoPanel
              routeInfo={routeInfo}
              isLoading={isLoading}
              error={error}
              compact={false}
            />

            {/* ETA */}
            {routeInfo && (
              <ETADisplay
                durationSeconds={routeInfo.totalDuration}
                compact={false}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

### Step 2: Update DriverTracking Component

**File**: `src/pages/driver/DriverTracking.tsx`

```typescript
import { useRouteTracking, ETADisplay } from '@/components/RouteTrackingDisplay';

export function DriverTracking() {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  // Track route to current destination
  const { routeInfo, isLoading } = useRouteTracking(
    currentBooking?.pickupLocation
      ? {
          lat: currentBooking.pickupLocation.latitude,
          lng: currentBooking.pickupLocation.longitude,
        }
      : null,
    currentBooking?.dropoffLocation
      ? {
          lat: currentBooking.dropoffLocation.latitude,
          lng: currentBooking.dropoffLocation.longitude,
        }
      : null,
    undefined,
    mapReady ? mapRef.current! : undefined
  );

  return (
    <div className="grid grid-cols-4 gap-4 h-screen">
      {/* Map - spans 3 columns */}
      <div className="col-span-3 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={[-6.2088, 106.8456]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          onReady={() => setMapReady(true)}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
      </div>

      {/* Info Panel - 1 column */}
      <div className="space-y-4 overflow-y-auto">
        {/* Driver Status Card */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-300">
          <p className="text-xs text-blue-600 font-semibold">🚗 Status</p>
          <p className="text-2xl font-bold text-blue-900">Aktif</p>
        </div>

        {/* Current Destination */}
        {currentBooking && (
          <>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-semibold">Tujuan Saat Ini</p>
              <p className="font-bold text-gray-900 mt-1">
                {currentBooking.dropoffLocation?.name}
              </p>
            </div>

            {/* ETA - Large display */}
            {routeInfo && (
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-300">
                <p className="text-xs text-green-600 font-semibold mb-2">
                  ⏱️ TIBA DALAM
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {Math.round(routeInfo.totalDuration / 60)}m
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Jarak: {(routeInfo.totalDistance / 1000).toFixed(1)} km
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

### Step 3: Update AdminTracking Component

**File**: `src/pages/admin/AdminTracking.tsx`

```typescript
import { SimpleRouteMap } from '@/components/RouteTrackingIntegration';

export function AdminTracking() {
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🚍 Real-Time Tracking</h1>
        <p className="text-gray-600">{activeBookings.length} Perjalanan Aktif</p>
      </div>

      {/* Grid of active bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeBookings.map((booking) => (
          <div
            key={booking.bookingId}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{booking.driverId}</h3>
                  <p className="text-sm text-gray-600">
                    {booking.pickupLocation?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    → {booking.dropoffLocation?.name}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Aktif
                </span>
              </div>
            </div>

            {/* Route Map */}
            <div className="p-4">
              <SimpleRouteMap booking={booking} height="h-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Data Flow Example

### Scenario: User selects a booking to view route

```
User clicks booking
        ↓
useRouteTracking(startPoint, endPoint)
        ↓
Validates coordinates ✓
        ↓
Calls getRouteCached(points)
        ↓
Checks cache for this route...
        ↓
IF cached:  Return cached response ✓ (instant)
IF NOT:     Fetch from OSRM API
        ↓
API Response: {
  code: "Ok",
  routes: [{
    geometry: [[lng, lat], [lng, lat], ...],
    distance: 45000,    // meters
    duration: 2700      // seconds
  }]
}
        ↓
extractRouteInfo() → RouteInfo
        ↓
createRoutePolyline(geometry) → L.Polyline
        ↓
polyline.addTo(map) → Visible on map
        ↓
setState(routeInfo)
        ↓
<RouteInfoPanel> and <ETADisplay> re-render
        ↓
User sees:
  - 45.2 km jarak
  - 45 menit ETA
  - Visualized polyline on map
```

## Testing Route Tracking

### Test Coordinates (Indonesia)

```javascript
// Jakarta to Bekasi
const startPoint = { lat: -6.2088, lng: 106.8456 };
const endPoint = { lat: -6.3157, lng: 106.7534 };

// Expected: ~40 km, ~50 minutes
```

### Manual Test Script

```typescript
import { getRoute, formatDistance, formatDuration } from '@/services/routeTracking';

async function testRouting() {
  const route = await getRoute([
    { lat: -6.2088, lng: 106.8456 },  // Jakarta
    { lat: -6.3157, lng: 106.7534 },  // Bekasi
  ]);

  if (route) {
    console.log('✓ Route fetched successfully');
    console.log(`  Distance: ${formatDistance(route.routes[0].distance)}`);
    console.log(`  Duration: ${formatDuration(route.routes[0].duration)}`);
    console.log(`  Polyline points: ${route.routes[0].geometry.length}`);
  } else {
    console.error('✗ Failed to fetch route');
  }
}
```

## Performance Optimization

### Caching Strategy

Routes are cached with LRU strategy (max 50 entries):

```typescript
// All subsequent requests to same route use cache
getRoute([pointA, pointB])      // API call
getRoute([pointA, pointB])      // Cache hit ✓ (instant)
```

### Best Practices

1. **Avoid re-requests**: Use `getRouteCached()` instead of `getRoute()`
2. **Batch operations**: If showing 10 routes, use `Promise.all()`
3. **Lazy loading**: Load routes only when visible (use intersection observer)
4. **Responsive**: Use compact mode for mobile, full mode for desktop

## Troubleshooting

### Route not loading?
- Check coordinates are in ISO 6709 format: { lat, lng }
- Verify internet connection to router.project-osrm.org
- Check browser console for CORS errors

### Polyline not visible?
- Ensure map center/zoom shows the route
- Check hook confirms `polyline !== null`
- Verify `onReady={() => setMapReady(true)}` called

### ETA too high/low?
- OSRM uses average speed ~90 km/h, may not account for:
  - Traffic conditions
  - Time of day variations
  - Real-world delays
- Consider multiplying by 1.2-1.5 for realistic estimates

## Production Deployment

### Option 1: Keep Public OSRM (Recommended for MVP)
- ✓ No setup required
- ✓ Free tier available
- ✓ Sufficient for current scale
- ⚠️ Limited to ~600 requests/min
- ⚠️ No SLA/support

### Option 2: Deploy Custom OSRM Instance (Recommended for Scale)
- Integrate with backend (Node/Express)
- Call OSRM from server (not frontend)
- Benefits:
  - Unlimited requests
  - Better security (API keys)
  - Performance optimization
  - Custom routing rules

**Estimated cost with Leaflet API**: ~$50-200/month for 10k+ daily users

## Summary

✅ Complete route tracking system implemented with:
- OSRM integration for real routing
- Polyline visualization on Leaflet maps
- ETA calculations with locale formatting
- Built-in caching for performance
- Reusable React components
- Integration examples for common use cases

Ready for immediate integration into existing pages!
