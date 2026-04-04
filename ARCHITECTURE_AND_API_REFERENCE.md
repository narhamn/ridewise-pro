# Architecture Diagrams & API Reference

---

## 📊 SYSTEM ARCHITECTURE DIAGRAM

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      RIDEWISE PRO APPLICATION                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  PAGES LAYER                                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ AdminPickup  │  │ AdminRayons  │  │ Admin*       │  │   │
│  │  │ Points       │  │  (NEW)       │  │  (existing)  │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  COMPONENTS LAYER                                       │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │   │
│  │  │ Pickup       │ │ Pickup       │ │ Pickup       │    │   │
│  │  │ PointForm    │ │ PointTable   │ │ PointMap     │    │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘    │   │
│  │  ┌──────────────┐                                       │   │
│  │  │ Activity     │                                       │   │
│  │  │ LogViewer    │                                       │   │
│  │  └──────────────┘                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CONTEXT API (State Management)                         │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ ShuttleContext                                   │   │   │
│  │  │ - pickupPoints[]                                 │   │   │
│  │  │ - rayons[]                                       │   │   │
│  │  │ - routeSequences[]                               │   │   │
│  │  │ - activityLogs[]                                 │   │   │
│  │  │ - 19 CRUD & helper methods                       │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  UTILITIES & SERVICES LAYER                             │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │   │
│  │  │ validation   │ │ export       │ │ utils        │    │   │
│  │  │ - validate   │ │ - CSV        │ │ (existing)   │    │   │
│  │  │ - filter     │ │ - PDF        │ │              │    │   │
│  │  │ - search     │ │ - format     │ │              │    │   │
│  │  │ - duplicate  │ │              │ │              │    │   │
│  │  │ - distance   │ │              │ │              │    │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  DATA LAYER                                             │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ dummy.ts (Mock Data)                             │   │   │
│  │  │ - 11 Pickup Points (Medan area)                  │   │   │
│  │  │ - 4 Rayons (A, B, C, D)                          │   │   │
│  │  │ - 8 Route Sequences                              │   │   │
│  │  │ - 4 Activity Logs                                │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TYPE SYSTEM (shuttle.ts)                               │   │
│  │  - PickupPoint interface                                │   │
│  │  - Rayon interface                                      │   │
│  │  - RouteSequence interface                              │   │
│  │  - ActivityLog interface                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### CRUD Flow: Add Pickup Point

```
┌──────────────────┐
│ Admin clicks     │
│ "Add Pickup      │
│  Point"          │
└────────┬─────────┘
         ↓
┌──────────────────────────────────────┐
│ PickupPointForm opens in dialog      │
│ - Form fields displayed              │
│ - Existing data loaded for duplicate │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ User fills form                      │
│ - Real-time validation error display │
│ - Duplicate warning shown            │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Admin clicks "Tambah Titik Jemput"  │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ PickupPointForm.onSubmit()           │
│ - Calls validation.validatePickup() │
│ - Shows validation errors if any     │
│ - (Exits if validation fails)        │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ PickupPointForm calls                │
│ shuttle.addPickupPoint(data)         │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ ShuttleContext.addPickupPoint()      │
│ 1. Generate unique ID (uuid)         │
│ 2. Set timestamps & user info        │
│ 3. Add to pickupPoints array         │
│ 4. Call generateNewActivityLog()     │
│ 5. Add log to activityLogs array     │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Return new PickupPoint object        │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ AdminPickupPoints receives new point │
│ - Calls toast.success()              │
│ - Closes form dialog                 │
│ - PickupPointTable re-renders        │
│ - Map updates with new marker        │
│ - Activity log shows new entry       │
└──────────────────────────────────────┘
```

### Update Flow: Edit Pickup Point

```
┌──────────────────┐
│ Admin clicks     │
│ Edit button      │
│ (✏️ icon)        │
└────────┬─────────┘
         ↓
┌──────────────────────────────────────┐
│ PickupPointTable passes              │
│ selected point to AdminPickupPoints   │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ AdminPickupPoints.handleEdit()       │
│ - Sets selectedPoint                 │
│ - Opens form dialog in edit mode     │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ PickupPointForm renders in edit mode │
│ - Loads existing data into fields    │
│ - Shows current values               │
│ - Duplicate detection excludes self  │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ User modifies fields                 │
│ - Real-time validation               │
│ - Error messages shown               │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Admin clicks "Simpan Perubahan"     │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ PickupPointForm.onSubmit()           │
│ - Validates updated data             │
│ - (Exits if validation fails)        │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ PickupPointForm calls                │
│ shuttle.updatePickupPoint(id, data)  │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ ShuttleContext.updatePickupPoint()   │
│ 1. Find point by ID                  │
│ 2. Compare old vs new values         │
│ 3. Track differences in changes{}    │
│ 4. Update point data                 │
│ 5. Update timestamps & user          │
│ 6. Call generateNewActivityLog()     │
│    with changes only                 │
│ 7. Add log to activityLogs           │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Return updated PickupPoint object    │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ AdminPickupPoints receives update    │
│ - Calls toast.success()              │
│ - Closes form dialog                 │
│ - PickupPointTable re-renders        │
│ - Map updates marker info            │
│ - Activity log shows change details  │
│   (showing old → new values)         │
└──────────────────────────────────────┘
```

### Search & Filter Flow

```
┌──────────────────┐
│ User types in    │
│ search box or    │
│ selects filter   │
└────────┬─────────┘
         ↓
┌──────────────────────────────────────┐
│ PickupPointTable state updates       │
│ - searchText: string                 │
│ - selectedRayon: string              │
│ - selectedStatus: string             │
│ - sortBy: string                     │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ useMemo hook triggered               │
│ Calls: filterPickupPoints()          │
│        + manual sort logic           │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ validation.filterPickupPoints()      │
│ Applies AND logic:                   │
│ 1. Match rayon (if selected)         │
│ 2. Match status (if selected)        │
│ 3. Match city (if applicable)        │
│ 4. Search in name, code, address,    │
│    phone, contact person             │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Sort filtered results by:            │
│ - Name (A-Z)                         │
│ - Rayon (A-D)                        │
│ - City (alphabetical)                │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Display filtered & sorted results    │
│ - Table updates with filtered data   │
│ - Statistics updated (counts change) │
│ - Map shows only matched markers     │
└──────────────────────────────────────┘
```

---

## 📡 COMPONENT INTERACTION DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                 AdminPickupPoints Page                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Header with "Add Pickup Point" button]               │
│                                                         │
│  [Statistics Cards: Total, Active, Inactive, Rayons]   │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ Tabs                                           │    │
│  ├──Tab────────────────────Tab────────────────────┤    │
│  │ List      Map       Logs                       │    │
│  ├────────────────────────────────────────────────┤    │
│  │                                                │    │
│  │ ┌─────────────────────────────────────────┐   │    │
│  │ │  Active Tab Content:                    │   │    │
│  │ │                                         │   │    │
│  │ │  LIST Tab:                              │   │    │
│  │ │  ┌───────────────────────────────────┐  │   │    │
│  │ │  │ PickupPointTable Component        │  │   │    │
│  │ │  │ - Search & Filter controls        │  │   │    │
│  │ │  │ - Sortable columns                │  │   │    │
│  │ │  │ - Edit/Delete buttons             │  │   │    │
│  │ │  │ - CSV/PDF export buttons          │  │   │    │
│  │ │  │ - Statistics (active/inactive)    │  │   │    │
│  │ │  └───────────────────────────────────┘  │   │    │
│  │ │                                         │   │    │
│  │ │  MAP Tab:                               │   │    │
│  │ │  ┌───────────────────────────────────┐  │   │    │
│  │ │  │ PickupPointMap Component          │  │   │    │
│  │ │  │ - Leaflet map (OpenStreetMap)     │  │   │    │
│  │ │  │ - Colored markers (per rayon)     │  │   │    │
│  │ │  │ - Popups with details             │  │   │    │
│  │ │  │ - Service radius circle           │  │   │    │
│  │ │  │ - Legend with counts              │  │   │    │
│  │ │  │ - Statistics cards                │  │   │    │
│  │ │  └───────────────────────────────────┘  │   │    │
│  │ │                                         │   │    │
│  │ │  LOGS Tab:                              │   │    │
│  │ │  ┌───────────────────────────────────┐  │   │    │
│  │ │  │ ActivityLogViewer Component       │  │   │    │
│  │ │  │ - Audit log table                 │  │   │    │
│  │ │  │ - Search & filter controls        │  │   │    │
│  │ │  │ - Expandable change details       │  │   │    │
│  │ │  │ - Statistics dashboard            │  │   │    │
│  │ │  └───────────────────────────────────┘  │   │    │
│  │ └─────────────────────────────────────────┘   │    │
│  │                                                │    │
│  │ [Modal Dialogs - Overlay on page]             │    │
│  │ ┌──────────────────────────────────────────┐  │    │
│  │ │ PickupPointForm (Create/Edit)            │  │    │
│  │ │ ┌────────────────────────────────────┐   │  │    │
│  │ │ │ Basic Info Section                 │   │  │    │
│  │ │ │ Location Section                   │   │  │    │
│  │ │ │ Contact Section                    │   │  │    │
│  │ │ │ Operational Section                │   │  │    │
│  │ │ │ Facilities Section                 │   │  │    │
│  │ │ │ [Validation Errors displayed]      │   │  │    │
│  │ │ │ [Duplicate Warning if applicable]  │   │  │    │
│  │ │ │ [Cancel] [Save]                    │   │  │    │
│  │ │ └────────────────────────────────────┘   │  │    │
│  │ └──────────────────────────────────────────┘  │    │
│  │                                                │    │
│  │ [AlertDialog - Delete Confirmation]          │    │
│  │ ┌──────────────────────────────────────────┐  │    │
│  │ │ Confirm Delete?                          │  │    │
│  │ │ This action cannot be undone.            │  │    │
│  │ │ [Cancel] [Delete]                        │  │    │
│  │ └──────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│ [Toast Notifications - Bottom right]                  │
│ ✓ Titik jemput berhasil ditambahkan!                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 API REFERENCE

### ShuttleContext API

#### Type: `PickupPoint Operations`

```typescript
// CREATE
function addPickupPoint(data: Partial<PickupPoint>): PickupPoint
Creates a new pickup point with auto-generated ID, timestamps, and activity log.

Parameters:
  data - {
    code: string;                    // PK-A-001 format
    name: string;                    // Min 3 chars
    rayon: 'A' | 'B' | 'C' | 'D';  // Zone
    address: string;                 // Min 5 chars
    city: string;                    // City name
    district: string;                // District name
    lat: number;                     // -90 to 90
    lng: number;                     // -180 to 180
    phone: string;                   // Indonesian format
    contactPerson: string;           // Contact name
    isActive?: boolean;              // Default: true
    description?: string;
    estimatedWaitTime?: number;      // Minutes (0+)
    maxCapacity?: number;            // (0+)
    facilities?: string[];           // e.g., ['WiFi', 'Toilet']
    operatingHours?: {
      open: string;                  // HH:MM format
      close: string;                 // HH:MM format
    };
  }

Returns: PickupPoint (with id, timestamps, audit log created)

Throws: Validation errors via toast notification
Side Effects: 
  - Updates pickupPoints state
  - Creates ActivityLog entry (action: 'create')

Usage:
  const newPoint = shuttle.addPickupPoint({
    code: 'PK-A-001',
    name: 'Terminal Pusat',
    rayon: 'A',
    address: 'Jl. Benda No. 1',
    city: 'Medan',
    district: 'Medan Kota',
    lat: 3.5952,
    lng: 98.6722,
    phone: '0612789',
    contactPerson: 'Budi',
  });
```

---

```typescript
// READ (Single)
function getPickupPointById(id: string): PickupPoint | undefined
Retrieves a pickup point by its ID.

Parameters:
  id - string (unique identifier)

Returns: PickupPoint object or undefined if not found

Usage:
  const point = shuttle.getPickupPointById('pk1');
  if (point) {
    console.log(point.name);
  }
```

---

```typescript
// READ (Multiple - By Rayon)
function getPickupPointsByRayon(rayon: 'A' | 'B' | 'C' | 'D'): PickupPoint[]
Retrieves all pickup points in a specific rayon.

Parameters:
  rayon - Zone letter ('A', 'B', 'C', or 'D')

Returns: Array of PickupPoint objects (empty array if none found)

Usage:
  const rayonAPoints = shuttle.getPickupPointsByRayon('A');
  console.log(`Found ${rayonAPoints.length} points in Rayon A`);
```

---

```typescript
// READ (Multiple - Search)
function searchPickupPoints(query: string): PickupPoint[]
Searches pickup points by name, code, address, phone, or contact person.

Parameters:
  query - string (search term, case-insensitive)

Returns: Array of matching PickupPoint objects

Search Fields:
  - name (partial match)
  - code (partial match)
  - address (partial match)
  - phone (partial match)
  - contactPerson (partial match)

Usage:
  const results = shuttle.searchPickupPoints('Terminal');
  // Returns all points with 'Terminal' in name, code, address, etc.
```

---

```typescript
// UPDATE
function updatePickupPoint(id: string, updates: Partial<PickupPoint>): void
Updates an existing pickup point and creates activity log with change tracking.

Parameters:
  id - string (pickup point ID to update)
  updates - Partial<PickupPoint> (only fields to update)
    Same validation as addPickupPoint for provided fields

Side Effects:
  - Updates pickupPoints state
  - Creates ActivityLog entry (action: 'update')
  - Logs tracking: which fields changed (oldValue → newValue)
  - Updates updatedAt timestamp
  - Updates updatedBy user info

Usage:
  shuttle.updatePickupPoint('pk1', {
    name: 'Terminal Pusat Baru',
    phone: '061-xxxx',
    estimatedWaitTime: 15,
  });
  // Activity log shows: name changed, phone changed, wait time changed
```

---

```typescript
// DELETE
function deletePickupPoint(id: string): void
Deletes a pickup point and creates activity log entry.

Parameters:
  id - string (pickup point ID to delete)

Side Effects:
  - Removes from pickupPoints state
  - Creates ActivityLog entry (action: 'delete')
  - Triggers toast notification

Warning: This action cannot be undone in current implementation.
         Backend should perform soft delete for production.

Usage:
  shuttle.deletePickupPoint('pk1');
  // Point is removed and activity logged
```

---

```typescript
// TOGGLE STATUS
function togglePickupPointStatus(id: string): void
Toggles isActive status (true ↔ false) and creates appropriate log entry.

Parameters:
  id - string (pickup point ID)

Side Effects:
  - Updates pickupPoints[id].isActive (toggles boolean)
  - Creates ActivityLog entry (action: 'activate' or 'deactivate')
  - Log shows: isActive changed from false to true (or vice versa)

Usage:
  shuttle.togglePickupPointStatus('pk1');
  // If was active → becomes inactive (action: 'deactivate')
  // If was inactive → becomes active (action: 'activate')
```

---

#### Type: `Rayon Operations`

```typescript
// READ
function getRayonByCode(code: 'A' | 'B' | 'C' | 'D'): Rayon | undefined
Retrieves a rayon object by its code.

Parameters:
  code - Rayon letter code ('A', 'B', 'C', or 'D')

Returns: Rayon object or undefined

Usage:
  const rayon = shuttle.getRayonByCode('A');
  if (rayon) {
    console.log(`Rayon ${rayon.name}: Rp ${rayon.pricePerMeter}/meter`);
  }
```

---

```typescript
// UPDATE
function updateRayonInfo(code: 'A' | 'B' | 'C' | 'D', updates: Partial<Rayon>): void
Updates rayon information (description, coverage, pricing).

Parameters:
  code - Rayon letter code
  updates - Partial<Rayon> (pricePerMeter, description, coverage, etc.)

Side Effects:
  - Updates rayon state
  - Creates ActivityLog entry

Usage:
  shuttle.updateRayonInfo('A', {
    pricePerMeter: 2.5,
    description: 'Updated coverage info',
  });
```

---

```typescript
// COUNT
function getRayonPickupPointCount(code: 'A' | 'B' | 'C' | 'D'): number
Counts active pickup points in a rayon.

Parameters:
  code - Rayon letter code

Returns: number (count of active pickup points)

Usage:
  const count = shuttle.getRayonPickupPointCount('A');
  console.log(`Rayon A has ${count} pickup points`);
```

---

#### Type: `Route Sequence Operations`

```typescript
// CREATE
function addRouteSequence(data: Omit<RouteSequence, 'id'>): RouteSequence
Creates a new route sequence (stop in a route).

Parameters:
  data - {
    routeId: string;
    pickupPointId: string;
    sequenceOrder: number;
    estimatedTimeFromPrevious: number;    // Minutes
    estimatedDistanceFromPrevious: number; // Meters
    cumulativeTime: number;
    cumulativeDistance: number;
    price: number;
  }

Returns: RouteSequence (with auto-generated ID)

Usage:
  shuttle.addRouteSequence({
    routeId: 'r1',
    pickupPointId: 'pk1',
    sequenceOrder: 1,
    estimatedTimeFromPrevious: 0,
    estimatedDistanceFromPrevious: 0,
    cumulativeTime: 0,
    cumulativeDistance: 0,
    price: 76000,
  });
```

---

```typescript
// READ
function getRouteSequences(routeId: string): RouteSequence[]
Retrieves all sequences for a specific route.

Parameters:
  routeId - string (route identifier)

Returns: Array of RouteSequence objects (sorted by sequenceOrder)

Usage:
  const sequences = shuttle.getRouteSequences('r1');
  sequences.forEach((seq, idx) => {
    console.log(`Stop ${idx + 1}: ${seq.pickupPointId}`);
  });
```

---

```typescript
// REORDER
function reorderRouteSequence(routeId: string, sequences: RouteSequence[]): void
Reorders all sequences in a route (e.g., after drag-drop operation).

Parameters:
  routeId - string (route identifier)
  sequences - RouteSequence[] (array with updated sequenceOrder values)

Side Effects:
  - Replaces routeSequences for this route
  - Updates activity logs

Usage:
  const reordered = [...sequences].sort(/* new order */);
  shuttle.reorderRouteSequence('r1', reordered);
```

---

#### Type: `Activity Log Operations`

```typescript
// GET ALL
function getActivityLogs(entityType?: 'pickup_point' | 'rayon' | 'route_sequence'): ActivityLog[]
Retrieves activity logs, optionally filtered by entity type.

Parameters:
  entityType - Optional: filter by entity type

Returns: Array of ActivityLog objects (newest first)

Usage:
  // Get all logs
  const allLogs = shuttle.getActivityLogs();
  
  // Get only pickup point logs
  const ppLogs = shuttle.getActivityLogs('pickup_point');
```

---

```typescript
// GET BY ENTITY
function getActivityLogsByEntity(entityId: string): ActivityLog[]
Retrieves all activity logs for a specific entity (pickup point, rayon, etc.).

Parameters:
  entityId - string (entity identifier)

Returns: Array of ActivityLog objects (newest first)

Usage:
  const pointHistory = shuttle.getActivityLogsByEntity('pk1');
  pointHistory.forEach(log => {
    console.log(`${log.action} by ${log.userName} at ${log.timestamp}`);
  });
```

---

### Utility Functions API

#### validation.ts

```typescript
// VALIDATE
function validatePickupPoint(data: any): ValidationError[]
Validates pickup point data against all rules.

Parameters:
  data - Any object to validate

Returns: ValidationError[] (empty array if valid)

Validation Rules Applied:
  ✓ code: PK-[A-D]-[001] format
  ✓ name: 3-255 characters
  ✓ address: 5+ characters
  ✓ rayon: A/B/C/D only
  ✓ city: required, non-empty
  ✓ district: required, non-empty
  ✓ lat: -90 to 90
  ✓ lng: -180 to 180
  ✓ phone: Indonesian format
  ✓ contactPerson: required
  ✓ maxCapacity: > 0 if provided
  ✓ estimatedWaitTime: >= 0 if provided
  ✓ operatingHours: close > open if provided

Usage:
  const errors = validatePickupPoint(formData);
  if (errors.length > 0) {
    errors.forEach(err => console.log(err.message));
  }
```

---

```typescript
// DUPLICATE DETECTION
function isDuplicatePickupPoint(
  points: PickupPoint[],
  newPoint: Partial<PickupPoint>,
  excludeId?: string
): { isDuplicate: boolean; duplicateFields: string[] }

Detects if a pickup point is a duplicate.

Parameters:
  points - All existing pickup points
  newPoint - Point to check for duplicates
  excludeId - Optional: exclude this ID from check (for edit mode)

Returns: Object with duplicate status and fields with duplicates

Duplicate Detection Fields:
  ✓ code: Exact match (case-insensitive)
  ✓ coordinates: Exact lat/lng match
  ✓ name: Case-insensitive within same rayon

Usage:
  const { isDuplicate, duplicateFields } = isDuplicatePickupPoint(
    shuttle.pickupPoints,
    newPointData
  );
  if (isDuplicate) {
    console.log(`Duplicates found in: ${duplicateFields.join(', ')}`);
  }
```

---

```typescript
// FILTER
function filterPickupPoints(
  points: PickupPoint[],
  filter: {
    rayon?: string;
    isActive?: boolean;
    city?: string;
    searchText?: string;
  }
): PickupPoint[]

Filters pickup points by multiple criteria (AND logic).

Parameters:
  points - Array of pickup points to filter
  filter - Filter criteria object:
    rayon - Filter by rayon code (A/B/C/D)
    isActive - Filter by status (true/false)
    city - Filter by city name
    searchText - Search in name/code/address/phone/contact

Returns: Filtered array (empty if no matches)

Usage:
  const filtered = filterPickupPoints(
    shuttle.pickupPoints,
    {
      rayon: 'A',
      isActive: true,
      searchText: 'Terminal',
    }
  );
  // Returns active Rayon A points matching 'Terminal' in name/address
```

---

```typescript
// DISTANCE CALCULATION
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number

Calculates distance between two coordinates using Haversine formula.

Parameters:
  lat1, lng1 - Coordinates of point 1
  lat2, lng2 - Coordinates of point 2

Returns: Distance in kilometers

Usage:
  const distance = calculateDistance(3.5952, 98.6722, 3.5850, 98.6950);
  console.log(`Distance: ${distance.toFixed(2)} km`);
```

---

```typescript
// FIND NEARBY
function findNearbyPickupPoints(
  points: PickupPoint[],
  lat: number,
  lng: number,
  radiusKm: number
): PickupPoint[]

Finds pickup points within a specified radius of coordinates.

Parameters:
  points - Array of pickup points to search
  lat, lng - Center coordinates
  radiusKm - Search radius in kilometers

Returns: Array of pickup points within radius (sorted by distance)

Usage:
  const nearby = findNearbyPickupPoints(
    shuttle.pickupPoints,
    3.5952,  // lat
    98.6722, // lng
    5        // 5km radius
  );
  console.log(`Found ${nearby.length} points within 5km`);
```

---

#### export.ts

```typescript
// EXPORT TO CSV (Generic)
function exportToCSV(
  filename: string,
  columns: Array<{ key: string; label: string }>,
  data: any[]
): void

Generic CSV export function.

Parameters:
  filename - Output filename (without .csv)
  columns - Column definitions:
    key - Field name in data
    label - Column header in CSV
  data - Array of objects to export

Side Effects:
  - Triggers browser download
  - Creates CSV file

Usage:
  exportToCSV(
    'pickup-points',
    [
      { key: 'code', label: 'Kode' },
      { key: 'name', label: 'Nama' },
      { key: 'rayon', label: 'Rayon' },
    ],
    shuttle.pickupPoints
  );
```

---

```typescript
// EXPORT PICKUP POINTS TO CSV
function exportPickupPointsToCSV(points: PickupPoint[]): void
Specialized CSV export for pickup points.

Parameters:
  points - Array of pickup points to export

Columns Included:
  Kode, Nama, Rayon, Alamat, Kota, Nomor Kontak, Kapasitas, Jam Operasional

Side Effects: Downloads CSV file

Usage:
  exportPickupPointsToCSV(shuttle.pickupPoints);
```

---

```typescript
// EXPORT TO PDF
function generatePDFContent(
  title: string,
  columns: Array<{ key: string; label: string }>,
  data: any[]
): string

Generates HTML content for PDF printing.

Parameters:
  title - Report title
  columns - Column definitions
  data - Data to include

Returns: HTML string ready for printing

Usage:
  const html = generatePDFContent(
    'Daftar Titik Jemput',
    [...columns],
    filtered_data
  );
  window.print();  // Opens print dialog
```

---

### data/dummy.ts - Mock Data Structure

```typescript
// Pickup Points (11 total)
dummyPickupPoints = [
  {
    id: 'pk1',
    code: 'PK-A-001',
    name: 'Terminal Hermes',
    rayon: 'A',
    // ... more fields
  },
  // ... 10 more
]

// Rayons (4 total)
dummyRayons = [
  {
    code: 'A',
    name: 'Rayon A',
    label: 'Kota Medan',
    pricePerMeter: 2.0,
    // ... more fields
  },
  // ... 3 more (B, C, D)
]

// Route Sequences (8 total)
dummyRouteSequences = [
  {
    id: 'seq1',
    routeId: 'r1',
    pickupPointId: 'pk1',
    sequenceOrder: 1,
    // ... more fields
  },
  // ... 7 more
]

// Activity Logs (4 total)
dummyActivityLogs = [
  {
    id: 'log1',
    entityType: 'pickup_point',
    entityId: 'pk1',
    action: 'create',
    // ... more fields
  },
  // ... 3 more
]
```

---

## 🎯 Common Implementation Patterns

### Pattern 1: Using Context with Components

```typescript
import { useShuttle } from '@/contexts/ShuttleContext';

export const MyComponent = () => {
  const shuttle = useShuttle();
  
  const points = shuttle.pickupPoints;
  const handleAdd = (data) => shuttle.addPickupPoint(data);
  
  return (
    <div>
      {points.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
};
```

### Pattern 2: Validation Before Operation

```typescript
const handleSubmit = (data) => {
  const errors = validatePickupPoint(data);
  
  if (errors.length > 0) {
    toast.error('Validation failed');
    return;
  }
  
  shuttle.addPickupPoint(data);
  toast.success('Added successfully');
};
```

### Pattern 3: Search with Filters

```typescript
const filtered = filterPickupPoints(
  shuttle.searchPickupPoints(searchText),
  { rayon: selectedRayon, isActive: true }
);
```

---

**End of API Reference | Last Updated: April 5, 2025**
