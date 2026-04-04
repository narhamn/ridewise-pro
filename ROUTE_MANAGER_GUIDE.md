# Route Manager Component Documentation

## Overview

`RouteManager` is a comprehensive, production-ready component for managing shuttle routes with integrated Leaflet/OSM map visualization. It provides a complete interface for viewing, creating, editing, and deleting routes with their associated waypoints.

## Features

### 1. **Interactive Map Visualization**
- Leaflet/OSM map integration for displaying complete routes
- Visual route points with semantic icons (start, destination, intermediate, pickup, dropoff)
- Interactive markers with drag-and-drop support
- Route lines with direction arrows
- Automatic map bounds fitting to show all route points

### 2. **Sidebar Route Browser**
- Organized list of all routes
- Quick route selection
- Route card details:
  - Route name with rayon badge
  - Origin → Destination
  - Number of waypoints
  - Expandable details showing:
    - Pricing multipliers
    - Waypoint list preview
    - Edit/Delete actions

### 3. **Route Information Dashboard**
- Real-time route statistics:
  - Total distance (km)
  - Total price (Rp)
  - Number of waypoints
  - Average price per km
- Three-tab interface:
  - **Overview**: Route summary and key metrics
  - **Points**: Detailed list of all waypoints with coordinates and pricing
  - **Pricing**: Price progression along the route with multipliers

### 4. **Design Aesthetics**
- **Refined Minimalist**: Clean, professional interface with:
  - Clear visual hierarchy
  - Subtle gradients and shadows
  - Distinctive badge and color system for rayons
  - Responsive grid layout
  - Smooth transitions and hover states

- **Color Coding by Rayon**:
  - Rayon A: Emerald (eco-friendly aesthetic)
  - Rayon B: Blue (professional)
  - Rayon C: Purple (distinctive)
  - Rayon D: Rose (warm)

## Component Props

```typescript
interface RouteManagerProps {
  routes: Route[];                                    // Array of all routes
  routePoints: RoutePoint[];                          // Array of all waypoints
  onSaveRoute: (route: Route, points: RoutePoint[]) => void;      // Save new route
  onUpdateRoute: (routeId: string, route: Route, points: RoutePoint[]) => void;  // Update route
  onDeleteRoute: (routeId: string) => void;           // Delete route
  onSavePoint: (point: RoutePoint) => void;           // Save new waypoint
  onUpdatePoint: (pointId: string, point: RoutePoint) => void;    // Update waypoint
  onDeletePoint: (pointId: string) => void;           // Delete waypoint
}
```

## Usage Example

### Basic Integration with AdminRoutes

```tsx
import RouteManager from '@/components/RouteManager';
import { useShuttle } from '@/contexts/ShuttleContext';

export const MyRoutePage = () => {
  const {
    routes,
    routePoints,
    setRoutes,
    setRoutePoints,
  } = useShuttle();

  const handleSaveRoute = (route: Route, points: RoutePoint[]) => {
    setRoutes(prev => [...prev, route]);
    setRoutePoints(prev => [...prev, ...points]);
    toast.success('Route saved successfully');
  };

  const handleUpdateRoute = (routeId: string, route: Route, points: RoutePoint[]) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? route : r));
    const others = routePoints.filter(p => p.routeId !== routeId);
    setRoutePoints([...others, ...points]);
    toast.success('Route updated successfully');
  };

  // ... implement other handlers

  return (
    <RouteManager
      routes={routes}
      routePoints={routePoints}
      onSaveRoute={handleSaveRoute}
      onUpdateRoute={handleUpdateRoute}
      onDeleteRoute={handleDeleteRoute}
      onSavePoint={handleSavePoint}
      onUpdatePoint={handleUpdatePoint}
      onDeletePoint={handleDeletePoint}
    />
  );
};
```

### Integration with Existing AdminRoutes

To replace the simple RouteMapEditor tab with the full RouteManager component:

```tsx
// In AdminRoutes.tsx

import RouteManager from '@/components/RouteManager';

// Inside the Tabs component:
<TabsContent value="map" className="space-y-4">
  <RouteManager
    routes={routes}
    routePoints={routePoints}
    onSaveRoute={(route, points) => {
      setRoutes(prev => [...prev, route]);
      setRoutePoints(prev => [...prev, ...points]);
      toast.success('Rute baru berhasil disimpan');
    }}
    onUpdateRoute={(routeId, route, points) => {
      setRoutes(prev => prev.map(r => r.id === routeId ? route : r));
      setRoutePoints(prev => {
        const others = prev.filter(p => p.routeId !== routeId);
        return [...others, ...points];
      });
      toast.success('Rute berhasil diperbarui');
    }}
    onDeleteRoute={(routeId) => {
      setRoutes(prev => prev.filter(r => r.id !== routeId));
      setRoutePoints(prev => prev.filter(p => p.routeId !== routeId));
      toast.success('Rute berhasil dihapus');
    }}
    onSavePoint={(point) => {
      setRoutePoints(prev => [...prev, point]);
      toast.success('Titik jemput berhasil ditambahkan');
    }}
    onUpdatePoint={(pointId, point) => {
      setRoutePoints(prev => prev.map(p => p.id === pointId ? point : p));
      toast.success('Titik jemput berhasil diperbarui');
    }}
    onDeletePoint={(pointId) => {
      setRoutePoints(prev => prev.filter(p => p.id !== pointId));
      toast.success('Titik jemput berhasil dihapus');
    }}
  />
</TabsContent>
```

## Component Structure

### Layout Grid
```
┌─────────────────────────────────────────────────────┐
│  Header - Manajemen Rute                            │
├─────────────────────────────────────────────────────┤
│      │                                               │
│  S   │         Main Content Area                    │
│  i   │   ┌─────────────────────────────────────┐   │
│  d   │   │  Map Visualization (500px height)   │   │
│  e   │   ├─────────────────────────────────────┤   │
│  b   │   │  Route Information Tabs             │   │
│  a   │   │  - Overview (Stats)                 │   │
│  r   │   │  - Points (Waypoints List)          │   │
│       │   │  - Pricing (Price Progression)     │   │
│       │   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Data Flow

1. **Route Selection**: User clicks a route in sidebar
2. **State Update**: `selectedRouteId` updates
3. **Computed Values**: `selectedRoute` and `selectedRoutePointsList` recalculate
4. **Map Refresh**: RouteMapEditor re-renders with new route data
5. **UI Update**: Information panels show selected route details

## Styling Details

### Typography
- **Headers**: Font weight 600-700, tracking-tight
- **Body**: Text-sm with slate-600 for secondary info
- **Numbers**: Font-bold with slate-900 for emphasis

### Colors & Gradients
- **Backgrounds**: Gradient from slate-50 to white via transparent
- **Borders**: slate-200 with slate-300 on hover
- **Badges**: Rayon-specific with distinct colors

### Spacing & Layout
- **Grid gaps**: 6px on desktop, responsive on mobile
- **Card padding**: 3-4 units (12-16px)
- **Section spacing**: 6 units (24px)

### Animations
- **Transitions**: 200ms duration for smooth interactions
- **Hover states**: Subtle color and shadow changes
- **No distracting animations**: Focuses on usability

## Computed Properties

### Route Statistics
```typescript
{
  totalDistance: number;        // Total km (end point's cumulativeDistance)
  totalPrice: number;           // Final waypoint price
  pointCount: number;           // Number of waypoints
  avgPricePerKm: number;        // Price divided by kilometers
}
```

## Map Editor Integration

The `RouteMapEditor` component within RouteManager provides:

### Marker Types
- **Start Marker** (🏁): Green, marks route origin
- **End Marker** (🎯): Red, marks route destination
- **Intermediate** (📍): Blue, standard waypoints
- **Temporary** (+): Orange dashed, unsaved points while drawing

### Interactive Features
- **Drag to Move**: Click and drag any marker to relocation
- **Info Popups**: Click markers to view detailed information
- **Click to Add**: In drawing mode, click map to add waypoints
- **Route Lines**: Shows complete path with direction arrows

## Responsive Design

### Desktop (lg and above)
- 5-column layout (1 sidebar + 4 main)
- Side-by-side map and information
- Full route list visible

### Tablet (md)
- Stacked layout
- Full-width map with scrollable sidebar

### Mobile (sm)
- Single column
- Map full width
- Sidebar below

## Performance Considerations

1. **Memoization**: `useMemo` prevents unnecessary recalculations
2. **Scroll Areas**: Limited height with scroll for large datasets
3. **Route Filtering**: Only displays selected route on map
4. **Badge Color Map**: Cached at component render level

## Future Enhancement Ideas

1. **Export/Import**
   - Export routes as GeoJSON
   - Import routes from files
   - Batch operations

2. **Route Cloning**
   - Duplicate existing routes
   - Template-based route creation

3. **Advanced Analytics**
   - Route profitability analysis
   - Peak demand visualization
   - Historical pricing trends

4. **Real-time Updates**
   - WebSocket integration for live route changes
   - Collaborative route editing
   - Change history and rollback

5. **Export Options**
   - PDF report generation
   - Excel export with all details
   - Share routes via QR code

## Troubleshooting

### Map not displaying
- Ensure RouteMapEditor's Leaflet CSS is imported
- Check browser console for missing tile errors
- Verify coordinates are valid (Indonesia bounds: -11 to 6 lat, 95 to 141 lng)

### Statistics showing incorrect values
- Verify `routePoints` array is properly sorted by `order`
- Check `cumulativeDistance` is calculated correctly
- Ensure `price` field is populated for all points

### Sidebar not scrolling
- ScrollArea height is fixed at 600px; check parent constraints
- Verify content exceeds container height

## Technical Stack

- **Map Library**: Leaflet 1.9.4
- **UI Components**: shadcn/ui (Tabs, Badge, Card, Button, etc.)
- **Icons**: lucide-react
- **Styling**: Tailwind CSS with custom gradients
- **State Management**: React hooks (useState, useMemo, useCallback)

---

## Component File Location

`src/components/RouteManager.tsx`

For detailed map icon implementations, see: `src/lib/map-icons.ts`
