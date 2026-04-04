# Route Planning & Management System Documentation

**Status:** ✅ FULLY IMPLEMENTED  
**Date:** April 5, 2026  
**Version:** 1.0.0  

---

## 📋 OVERVIEW

The Route Planning & Management System is a comprehensive feature for creating, optimizing, and managing shuttle routes with interactive Leaflet map visualization, drag-and-drop sequence reordering, and automatic distance/time/cost calculations.

### Key Features

✅ **Create & Edit Routes** - Add/remove stops from routes  
✅ **Drag-Drop Reordering** - Reorder stops with visual feedback  
✅ **Interactive Map** - Visualize routes with Leaflet, showing route paths and markers  
✅ **Route Optimization** - Auto-optimize using Nearest Neighbor algorithm  
✅ **Distance Calculations** - Automatic distance & time calculations between stops  
✅ **Cost Estimation** - Real-time pricing based on rayon and distance  
✅ **Route Statistics** - Comprehensive analytics with charts (using Recharts)  
✅ **Export Routes** - Export route data as JSON format  
✅ **Validation** - Built-in validation to prevent logical errors  

---

## 🏗️ ARCHITECTURE

### Components

#### 1. **RouteSequenceList** (`src/components/RouteSequenceList.tsx`)
**Purpose:** Display and manage ordered list of stops with drag-drop support  
**Features:**
- HTML5 drag-and-drop functionality
- Move up/down buttons for manual reordering
- Remove stops with confirmation
- Real-time statistics display
- Visual stop numbering
- Cumulative distance/time display

**Props:**
```typescript
interface RouteSequenceListProps {
  sequences: RouteSequence[];           // Ordered stops
  pickupPoints: PickupPoint[];          // Available pickup points
  onReorder: (newSequences: RouteSequence[]) => void;  // Reorder callback
  onRemoveSequence: (sequenceId: string) => void;      // Remove callback
  onAddSequence: () => void;                           // Add callback
  isLoading?: boolean;
}
```

#### 2. **RoutePath** (`src/components/RoutePath.tsx`)
**Purpose:** Visualize route on Leaflet map with polylines and markers  
**Features:**
- OpenStreetMap tile layer
- Custom numbered markers for each stop
- Polyline connecting all stops
- Service radius visualization (5km circle)
- Popups with detailed stop information
- Color-coded legend
- Responsive design

**Props:**
```typescript
interface RoutePathProps {
  sequences: RouteSequence[];     // Route stops
  pickupPoints: PickupPoint[];    // Point reference data
  center?: LatLngExpression;      // Map center (default: Medan)
  zoom?: number;                  // Map zoom level
}
```

#### 3. **RouteSequenceEditor** (`src/components/RouteSequenceEditor.tsx`)
**Purpose:** Dialog to select and add new stops to route  
**Features:**
- Filterable pickup point list
- Search by name/code/address
- Filter by rayon
- Prevents adding duplicates
- Shows only active, available points
- Responsive grid layout

**Props:**
```typescript
interface RouteSequenceEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pickupPoints: PickupPoint[];
  currentSequences: RouteSequence[];
  onAddSequence: (pointId: string) => void;
  isLoading?: boolean;
}
```

#### 4. **AdminRouteManagement** (`src/pages/admin/AdminRouteManagement.tsx`)
**Purpose:** Master page for complete route management  
**Features:**
- Route selection (r1, r2, r3, r4)
- Real-time statistics cards (distance, time, cost, stops)
- Validation error display
- 3-tab interface:
  - **Urutan Stop Tab** - Sequence list with edit controls
  - **Visualisasi Peta Tab** - Map visualization
  - **Statistik Tab** - Charts and detailed table
- Save, optimize, reset, and export actions
- Comprehensive route table with all metrics

### Utility Functions

#### `lib/routeOptimization.ts`
Comprehensive collection of route calculation and optimization functions:

```typescript
// Statistics & Calculations
calculateRouteStats(sequences, rayons) → { totalDistance, totalTime, totalCost, averageSpeedKmh, stopsCount }
estimateTravelTime(distanceMeters) → minutes
calculateSegmentPrice(distanceMeters, rayonPricePerMeter) → price

// Validation
validateRouteSequence(sequences) → validationErrors[]

// Optimization
findNearestNeighborRoute(startPointId, pickupPoints) → PickupPoint[]
generateSequencesFromPoints(routeId, orderedPoints) → RouteSequence[]

// Data Manipulation
reorderSequences(originalSequences, newOrder) → OrderedSequences[]
calculateCumulativeValues(sequences) → SequencesWithCumulatives[]

// Formatting
formatRouteDistance(meters) → "2.5 km" | "500 m"
formatRouteTime(minutes) → "1h 30m" | "45 menit"
formatRouteCost(cost) → "Rp 150.000,00"

// Export
exportRouteSequencesToRoute(routeId, sequences, pickupPoints) → ExportData
generateRouteName(sequences, pickupPoints) → "Terminal A → Terminal B"
```

---

## 📊 DATA STRUCTURES

### RouteSequence
```typescript
interface RouteSequence {
  id: string;                              // Unique ID (uuid)
  routeId: string;                         // Associated route
  pickupPointId: string;                   // Pickup point reference
  sequenceOrder: number;                   // 1-based order in route
  estimatedTimeFromPrevious: number;       // Minutes from previous stop
  estimatedDistanceFromPrevious: number;   // Meters from previous stop
  cumulativeTime: number;                  // Total time from start
  cumulativeDistance: number;              // Total distance from start
  price: number;                           // Price from this point to destination
}
```

### Route Statistics
```typescript
{
  totalDistance: number;      // Meters
  totalTime: number;          // Minutes
  totalCost: number;          // IDR
  averageSpeedKmh: number;   // km/h
  stopsCount: number;
}
```

---

## 🔄 WORKFLOW

### Adding a Route Stop

```
1. User clicks "Tambah Stop" button
   ↓
2. RouteSequenceEditor dialog opens
   ↓
3. User searches/filters and selects pickup point
   ↓
4. System calls shuttle.addRouteSequence()
   ↓
5. New sequence added with:
   - Auto-calculated distance from previous stop
   - Auto-calculated travel time
   - Cumulative metrics
   ↓
6. RouteSequenceList updates with new stop
   ↓
7. RoutePath map updates with new marker
```

### Reordering Stops

```
Method 1: Drag and Drop
1. User clicks and drags stop
   ↓
2. Visual feedback shows new position
   ↓
3. onReorder() called with new order
   ↓
4. Sequence numbers updated (1, 2, 3, ...)
   ↓
5. Component re-renders with new order

Method 2: Up/Down Buttons
1. User clicks ↑ or ↓ button
   ↓
2. Swap with adjacent stop
   ↓
3. Update sequence order numbers
   ↓
4. onReorder() called
   ↓
5. Component updates
```

### Optimizing Route

```
1. User clicks "Optimasi Rute" button
   ↓
2. Validate minimum 2 stops
   ↓
3. Call findNearestNeighborRoute(startPoint, allPoints)
   ↓
4. Algorithm finds optimal order:
   - Start at first point
   - Find nearest unvisited point
   - Repeat until all visited
   ↓
5. Generate new sequences with updated:
   - Sequence order
   - Distance calculations
   - Time calculations
   - Cumulative metrics
   ↓
6. Delete old sequences, add new ones to context
   ↓
7. UI updates with optimized route
```

### Saving Route

```
1. User clicks "Simpan Rute" button
   ↓
2. Validate route (no errors?)
   ↓
3. For each sequence:
   - Call shuttle.updateRouteSequence(id, updates)
   ↓
4. Call shuttle.reorderRouteSequence(routeId, sequences)
   ↓
5. Activity log created (auto)
   ↓
6. Toast notification shown
   ↓
7. Route persisted in context
```

---

## 🗺️ MAP FEATURES

### Leaflet Integration

**Layers:**
- **OpenStreetMap Tile Layer** - Base map with road/geography
- **Polyline** - Route path connecting all stops (dashed blue)
- **Markers** - Custom numbered icons (1, 2, 3, ... N)
- **Circle** - Service radius around start point (5km)
- **Popups** - Detailed stop info on marker click

### Custom Marker Icons

```typescript
// Start point: Blue circle with #1
// Stop N: Blue circle numbered
// End point: Green circle with checkmark

SVG-based icons for: sharp edges, custom text, efficient rendering
```

### Map Interactions

```
- Zoom: Scroll wheel or zoom controls
- Pan: Click and drag map
- Click marker: Show popup with details
- Auto-focus: When selecting stop from list, map zooms to it
- Fit bounds: Map shows all stops in view
```

---

## 📈 CALCULATIONS

### Distance Calculation (Haversine Formula)
```
Used function: calculateDistance(lat1, lng1, lat2, lng2)
Returns: Distance in kilometers
Formula: Haversine great-circle distance
Accuracy: ±5% for city-scale distances
```

### Time Estimation
```
Assumed speed: 40 km/h for city routes
Pickup/dropoff at each stop: +2 minutes
Formula: (distanceMeters / 667) + 2 minutes
Example: 2000m = 3 min travel + 2 min stop = 5 min total
```

### Cost Calculation
```
Cost = distance (meters) × rayon price per meter
Default: 2.0 Rp/meter for Rayon A
Rayons: A=2.0, B=1.5, C=1.2, D=1.0
Example: 2000m × 2.0 = Rp 4,000
```

---

## ⚠️ VALIDATION RULES

Route sequence validation checks for:

1. **Non-empty** - Route must have at least 1 stop
2. **No duplicates** - Each pickup point can appear only once
3. **Continuous order** - sequenceOrder must be 1, 2, 3, ...N
4. **Increasing distance** - cumulativeDistance must increase
5. **Increasing time** - cumulativeTime must increase

**Error handling:** Validation errors block saving and show in error card

---

## 🚀 USAGE GUIDE

### Creating a New Route

1. **Navigate** to Admin → Manajemen Rute
2. **Select** a route (r1, r2, r3, or r4)
3. **Click** "Tambah Stop" button
4. **Search** for pickup point by name/code/address
5. **Filter** by rayon if needed
6. **Click** "Pilih" to add to route
7. **Repeat** to add more stops
8. **Click** "Simpan Rute" to save

### Reordering Stops

**Option 1: Drag & Drop**
1. Click and hold stop
2. Drag to new position
3. Visual feedback shows target position
4. Release to drop

**Option 2: Buttons**
1. Click ↑ to move up
2. Click ↓ to move down
3. Click 🗑️ to remove

### Optimizing Route

1. **Click** "Optimasi Rute" button
2. **Confirm** in dialog
3. System automatically reorders using Nearest Neighbor algorithm
4. **Review** results on map
5. **Save** if satisfied

### Viewing Statistics

1. **Click** "Statistik" tab
2. **View** charts:
   - Pie chart: Stop distribution by rayon
   - Bar chart: Distance/time per stop
3. **Review** route table with all metrics

### Exporting Route

1. **Click** "Ekspor Rute" button
2. **Save** JSON file to computer
3. **Use** for integration or backup

---

## 🔗 INTEGRATION WITH EXISTING SYSTEM

### Context API Integration

```typescript
// Get sequences for route
shuttle.getRouteSequences(routeId)

// Add sequence
shuttle.addRouteSequence(sequenceData)

// Update sequence
shuttle.updateRouteSequence(sequenceId, updates)

// Delete sequence
shuttle.deleteRouteSequence(sequenceId)

// Reorder sequences
shuttle.reorderRouteSequence(routeId, newSequences)

// Get activity logs
shuttle.getActivityLogs('route_sequence')
shuttle.getActivityLogsByEntity(routeId)
```

### Route Integration Points

1. **AdminRoutes** - Existing route scheduling
   - Uses routes created/managed here
   - Can reference RouteSequence data

2. **Customer Booking** - Route selection
   - Passengers select pickup points
   - System can offer route-optimized booking

3. **Driver Dashboard** - Trip planning
   - Driver sees route with stops
   - Can follow optimized path

4. **Scheduling** - Automatic scheduling
   - Create schedule for optimized route
   - Assign vehicle and driver

---

## 📱 RESPONSIVE DESIGN

- **Desktop** (≥1024px): Full layout with all details
- **Tablet** (768px-1023px): Reduced column count, adjusted spacing
- **Mobile** (≤767px): Single column, optimized for touch

---

## ⚙️ TECHNICAL DETAILS

### Dependencies
```json
{
  "react": "18.3.1",
  "react-leaflet": "5.0.0",
  "leaflet": "1.9.4",
  "recharts": "2.15.4",
  "react-router-dom": "6.30.1",
  "@radix-ui/*": "latest"
}
```

### Key Libraries Used

1. **Leaflet** - Map rendering
2. **React-Leaflet** - React wrapper for Leaflet
3. **Recharts** - Interactive charts
4. **Radix UI** - UI components
5. **React Router** - Navigation
6. **Lucide React** - Icons

### Performance Considerations

- Memoized calculations using `useMemo`
- Efficient DOM updates
- SVG icons for markers (lightweight)
- Asynchronous state updates
- No N+1 queries

---

## 🔮 FUTURE ENHANCEMENTS

### Phase 2 Improvements

1. **Advanced Optimization**
   - Traveling Salesman Problem (TSP) solver
   - Multiple vehicle routing
   - Time window constraints

2. **Real-time Tracking**
   - Live driver location on map
   - ETA calculations
   - Passenger notifications

3. **Predictive Analytics**
   - Peak hour routing
   - Traffic pattern analysis
   - Demand forecasting

4. **Integration Features**
   - Import routes from external sources
   - Two-way sync with backend
   - Historical route analysis

5. **Mobile App Support**
   - Mobile-optimized route view
   - Driver app integration
   - Real-time updates

---

## 🐛 TROUBLESHOOTING

### Common Issues

**Map not loading?**
- Check internet connection
- Verify OpenStreetMap is not blocked
- Try zooming in/out

**Stops not appearing?**
- Ensure pickup points are active
- Check that stops have valid coordinates
- Verify no duplicate points

**Optimization not working?**
- Need at least 2 stops
- Check for validation errors
- Verify distance calculations are working

**Export not downloading?**
- Check browser download settings
- Verify popup blocker isn't blocking
- Try different browser

---

## 📞 SUPPORT

For issues or questions:
1. Check troubleshooting section above
2. Review component source code
3. Check browser console for errors
4. Contact development team

---

**Version 1.0.0 | April 5, 2026 | Production Ready**
