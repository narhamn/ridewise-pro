# RouteManager Implementation Guide

## Quick Start

The `RouteManager` component is a drop-in replacement for RouteMapEditor with enhanced functionality. It provides a complete route management interface with sidebar navigation, statistics, and detailed information panels.

## Implementation Steps

### Step 1: Import the Component

```tsx
import RouteManager from '@/components/RouteManager';
```

### Step 2: Replace RouteMapEditor in AdminRoutes

In your AdminRoutes.tsx file, find the map editor tab and replace:

**Before:**
```tsx
<TabsContent value="map">
  <RouteMapEditor
    routes={routes}
    routePoints={routePoints}
    // ... handlers
  />
</TabsContent>
```

**After:**
```tsx
<TabsContent value="map">
  <RouteManager
    routes={routes}
    routePoints={routePoints}
    // ... same handlers
  />
</TabsContent>
```

### Step 3: No Additional Changes Needed!

The component uses the exact same props interface as RouteMapEditor, so your existing event handlers will work without modification.

## What You Get

### Before (RouteMapEditor only)
- Basic map display
- Basic marker functionality
- Simple route drawing

### After (RouteManager)
- ✅ Professional dashboard layout
- ✅ Sidebar route browser with expandable details
- ✅ Route statistics panel (distance, price, avg per km)
- ✅ Three-tab information interface
- ✅ Detailed waypoint listing
- ✅ Price progression visualization
- ✅ Responsive design
- ✅ Color-coded rayon identification
- ✅ Professional styling with dark backgrounds and smooth transitions

## Key Features

### 1. Route Selection Sidebar
- Visual route cards with rayon badges
- Expandable details showing:
  - Pricing multipliers
  - Waypoint count
  - Origin and destination
  - Quick edit/delete actions

### 2. Live Statistics
Four stat cards showing:
- **Total Distance** (km)
- **Total Price** (Rp)
- **Number of Points**
- **Average Price per km**

### 3. Information Tabs

#### Overview Tab
- Route summary
- Key statistics
- Multiplier information
- Origin/destination details

#### Points Tab
- Complete waypoint list
- Scrollable area with waypoint cards
- Individual waypoint details:
  - Order number
  - Code and name
  - Latitude/longitude
  - Distance from previous point
  - Price

#### Pricing Tab
- Road condition multiplier
- Vehicle type multiplier
- Price progression list showing:
  - Order number
  - Distance from previous point
  - Cumulative distance
  - Price at that point

## Component Props

The component accepts the same props as RouteMapEditor:

```typescript
interface RouteManagerProps {
  routes: Route[];
  routePoints: RoutePoint[];
  onSaveRoute: (route: Route, points: RoutePoint[]) => void;
  onUpdateRoute: (routeId: string, route: Route, points: RoutePoint[]) => void;
  onDeleteRoute: (routeId: string) => void;
  onSavePoint: (point: RoutePoint) => void;
  onUpdatePoint: (pointId: string, point: RoutePoint) => void;
  onDeletePoint: (pointId: string) => void;
}
```

## Example Handler Implementation

```tsx
const handleSaveRoute = (route: Route, points: RoutePoint[]) => {
  setRoutes(prev => [...prev, route]);
  setRoutePoints(prev => [...prev, ...points]);
  toast.success('Rute baru berhasil disimpan');
};

const handleUpdateRoute = (routeId: string, route: Route, points: RoutePoint[]) => {
  setRoutes(prev => prev.map(r => r.id === routeId ? route : r));
  setRoutePoints(prev => {
    const others = prev.filter(p => p.routeId !== routeId);
    return [...others, ...points];
  });
  toast.success('Rute berhasil diperbarui');
};

const handleDeleteRoute = (routeId: string) => {
  setRoutes(prev => prev.filter(r => r.id !== routeId));
  setRoutePoints(prev => prev.filter(p => p.routeId !== routeId));
  toast.success('Rute berhasil dihapus');
};

// ... similar for points handlers

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
```

## Layout & Responsive Design

### Desktop Layout (3+ columns)
```
Sidebar (25%) | Main Content (75%)
              - Map (500px height)
              - Info Tabs
```

### Tablet Layout
```
Full width content
Sidebar + Map stacked
```

### Mobile Layout
```
Single column
Sidebar (scrollable)
Map (full width)
Info (scrollable)
```

## Color System

The component uses a rayon-based color system:

| Rayon | Color  | Primary | Secondary |
|-------|--------|---------|-----------|
| A     | Green  | Emerald | Emerald-50 |
| B     | Blue   | Sky     | Sky-50     |
| C     | Purple | Purple  | Purple-50  |
| D     | Rose   | Rose    | Rose-50    |

Each rayon has distinct colors for:
- Background badge
- Text color
- Border color
- Stats display

## Statistics Calculation

The component automatically calculates:

```typescript
totalDistance = lastPoint.cumulativeDistance
totalPrice = lastPoint.price
pointCount = array.length
avgPricePerKm = totalPrice / (totalDistance / 1000)
```

## Design Philosophy

The component follows a **refined minimalist** aesthetic:
- Clean, professional interface
- Clear visual hierarchy
- Subtle animations and transitions
- Functional beauty over decorative complexity
- Focus on information clarity
- Responsive and accessible

## Performance Notes

The component uses React optimizations:
- `useMemo` for expensive calculations
- Proper ref management for map
- Efficient scroll areas for large datasets
- No unnecessary re-renders

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `@/components/ui/*` (shadcn/ui components)
- `@/types/shuttle` (Route and RoutePoint types)
- `leaflet` (for map visualization via RouteMapEditor)
- `lucide-react` (for icons)
- `sonner` (for notifications)
- `date-fns` (for date formatting)

## Troubleshooting

### Component not rendering
- Check that `RouteManager` is imported correctly
- Verify props are passed with correct types
- Look for console errors

### Map not showing routes
- Ensure RouteMapEditor's styles are loaded (Leaflet CSS)
- Verify `selectedRoute` is not null
- Check coordinates are valid (Indonesia: lat -11 to 6, lng 95 to 141)

### Statistics showing NaN
- Verify all route points have `price` and `cumulativeDistance` fields
- Check that `order` field is set correctly for sorting

### Sidebar not scrolling
- ScrollArea height is fixed at 600px
- If content exceeds this, it will scroll automatically

## File Location

`src/components/RouteManager.tsx`

## Related Files

- RouteMapEditor: `src/components/RouteMapEditor.tsx`
- Map Icons: `src/lib/map-icons.ts`
- AdminRoutes: `src/pages/admin/AdminRoutes.tsx`

## Next Steps

1. Copy the component to your project
2. Update imports in AdminRoutes
3. Test with existing route data
4. Customize styling if needed (colors, spacing, fonts)
5. Add additional features as needed

---

For detailed feature information, see [ROUTE_MANAGER_GUIDE.md](./ROUTE_MANAGER_GUIDE.md)
