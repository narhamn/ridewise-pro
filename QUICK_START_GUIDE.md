# Quick Start Guide - Pickup Point Management System

**Untuk Developer yang ingin cepat memahami dan menggunakan sistem**

---

## 5-Menit Quick Setup

### 1. Import & Setup
```typescript
import { useShuttle } from '@/contexts/ShuttleContext';

const MyComponent = () => {
  const shuttle = useShuttle();
  // Sekarang bisa akses semua pickup point operations
};
```

### 2. Akses Data
```typescript
// Read
const allPoints = shuttle.pickupPoints;           // PickupPoint[]
const point = shuttle.getPickupPointById('pk1');  // PickupPoint | undefined
const points = shuttle.getPickupPointsByRayon('A'); // PickupPoint[]
const searched = shuttle.searchPickupPoints('Terminal'); // PickupPoint[]

// Rayons
const rayon = shuttle.getRayonByCode('A');        // Rayon | undefined
const count = shuttle.getRayonPickupPointCount('A'); // number

// Activity
const logs = shuttle.getActivityLogs('pickup_point'); // ActivityLog[]
```

### 3. CRUD Operation
```typescript
// Create
shuttle.addPickupPoint({
  code: 'PK-A-001',
  name: 'Terminal Hermes',
  rayon: 'A',
  address: 'Jl. Benda No. 1',
  city: 'Medan',
  district: 'Medan Kota',
  lat: 3.5952,
  lng: 98.6722,
  phone: '0612789',
  contactPerson: 'Budi',
  isActive: true,
});

// Update
shuttle.updatePickupPoint('pk1', {
  name: 'Terminal Hermes Edited',
  phone: '0619999',
});

// Delete
shuttle.deletePickupPoint('pk1');

// Toggle Status
shuttle.togglePickupPointStatus('pk1');
```

---

## Common Operations

### Search & Filter
```typescript
import { filterPickupPoints, searchPickupPoints } from '@/lib/validation';

// Search (fuzzy match)
const results = shuttle.searchPickupPoints('hermes');

// Filter
const activePoints = shuttle.pickupPoints.filter(p => p.isActive);
const rayonAPoints = shuttle.getPickupPointsByRayon('A');

// Advanced filter
const filtered = filterPickupPoints(
  shuttle.pickupPoints,
  {
    rayon: 'A',
    isActive: true,
    city: 'Medan',
    searchText: 'Terminal',
  }
);
```

### Validation
```typescript
import { 
  validatePickupPoint, 
  isDuplicatePickupPoint 
} from '@/lib/validation';

const errors = validatePickupPoint(formData);
if (errors.length > 0) {
  console.log('Validation failed:', errors);
}

const { isDuplicate, duplicateFields } = isDuplicatePickupPoint(
  shuttle.pickupPoints,
  newPoint
);
if (isDuplicate) {
  console.log('Duplicate detected in:', duplicateFields);
}
```

### Distance Calculation
```typescript
import { 
  calculateDistance, 
  findNearbyPickupPoints,
  formatDistance 
} from '@/lib/validation';

const distanceKm = calculateDistance(3.5952, 98.6722, 3.5850, 98.6950);
console.log(formatDistance(distanceKm)); // "2.5 km"

const nearby = findNearbyPickupPoints(
  shuttle.pickupPoints,
  3.5952,      // lat
  98.6722,     // lng
  5             // radius in km
);
```

### Export
```typescript
import { 
  exportPickupPointsToCSV,
  exportPickupPointsToPDF,
  exportActivityLogsToCSV 
} from '@/lib/export';

// Export to CSV
exportPickupPointsToCSV(shuttle.pickupPoints);

// Export to PDF (opens print window)
exportPickupPointsToPDF(shuttle.pickupPoints);

// Export activity logs
exportActivityLogsToCSV(shuttle.activityLogs);
```

---

## Component Examples

### Using PickupPointForm
```typescript
import PickupPointForm from '@/components/PickupPointForm';

// Create mode
<PickupPointForm
  allPickupPoints={shuttle.pickupPoints}
  onSubmit={(data) => {
    shuttle.addPickupPoint(data);
    toast.success('Titik jemput ditambahkan!');
  }}
  onCancel={() => setShowForm(false)}
/>

// Edit mode
<PickupPointForm
  pickupPoint={selectedPoint}
  allPickupPoints={shuttle.pickupPoints}
  onSubmit={(data) => {
    shuttle.updatePickupPoint(selectedPoint.id, data);
    toast.success('Perubahan disimpan!');
  }}
  onCancel={() => setShowForm(false)}
/>
```

### Using PickupPointTable
```typescript
import PickupPointTable from '@/components/PickupPointTable';

<PickupPointTable
  pickupPoints={shuttle.pickupPoints}
  rayons={shuttle.rayons}
  onEdit={(point) => {
    setSelectedPoint(point);
    setShowForm(true);
  }}
  onDelete={(point) => {
    setSelectedPoint(point);
    setShowDeleteConfirm(true);
  }}
  onToggleStatus={(id) => {
    shuttle.togglePickupPointStatus(id);
  }}
/>
```

### Using PickupPointMap
```typescript
import PickupPointMap from '@/components/PickupPointMap';

<PickupPointMap
  pickupPoints={shuttle.pickupPoints}
  selectedId={selectedPointId}
  center={[3.5952, 98.6722]}  // Medan
  zoom={11}
/>
```

### Using ActivityLogViewer
```typescript
import ActivityLogViewer from '@/components/ActivityLogViewer';

<ActivityLogViewer
  logs={shuttle.getActivityLogs('pickup_point')}
/>
```

---

## State Management Pattern

### Understanding ShuttleContext
```typescript
// Context provides:
interface ShuttleContext {
  // State
  pickupPoints: PickupPoint[];
  rayons: Rayon[];
  routeSequences: RouteSequence[];
  activityLogs: ActivityLog[];
  
  // Methods - auto logs activities
  addPickupPoint(data): PickupPoint;
  updatePickupPoint(id, updates): void;
  deletePickupPoint(id): void;
  togglePickupPointStatus(id): void;
  
  // Search & Filter
  getPickupPointById(id): PickupPoint | undefined;
  getPickupPointsByRayon(rayon): PickupPoint[];
  searchPickupPoints(query): PickupPoint[];
  
  // Rayon
  getRayonByCode(code): Rayon | undefined;
  updateRayonInfo(code, updates): void;
  getRayonPickupPointCount(code): number;
  
  // Routes
  addRouteSequence(data): RouteSequence;
  getRouteSequences(routeId): RouteSequence[];
  reorderRouteSequence(routeId, sequences): void;
  
  // Audit
  getActivityLogs(entityType?): ActivityLog[];
  getActivityLogsByEntity(entityId): ActivityLog[];
}
```

### Auto-Logging Feature
```typescript
// SETIAP kali menggunakan context methods, activity log otomatis dibuat:

shuttle.addPickupPoint(data);
// → ActivityLog dengan action: 'create', changes: {semua fields}

shuttle.updatePickupPoint(id, { name: 'Baru' });
// → ActivityLog dengan action: 'update', changes: { name: { old, new } }

shuttle.deletePickupPoint(id);
// → ActivityLog dengan action: 'delete', changes: {}

shuttle.togglePickupPointStatus(id);
// → ActivityLog dengan action: 'activate' atau 'deactivate'
```

---

## Type Definitions Reference

### Quick Type Reference
```typescript
// PickupPoint - Main data model
type PickupPoint = {
  id: string;
  code: string;              // Unique ID like PK-A-001
  name: string;              // Location name
  rayon: 'A' | 'B' | 'C' | 'D';
  address: string;
  city: string;
  district: string;
  lat: number;               // Latitude
  lng: number;               // Longitude
  phone: string;
  contactPerson: string;
  isActive: boolean;
  description?: string;
  estimatedWaitTime?: number;
  maxCapacity?: number;
  facilities?: string[];     // ['WiFi', 'Toilet']
  operatingHours?: { open: string; close: string; }; // '06:00'-'22:00'
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

// Rayon - Zone/Area
type Rayon = {
  id: string;
  code: 'A' | 'B' | 'C' | 'D';
  name: string;
  label: string;
  description: string;
  pricePerMeter: number;
  coverage: string;
  pickupPointCount: number;
  isActive: boolean;
};

// RouteSequence - Urutan titik dalam route
type RouteSequence = {
  id: string;
  routeId: string;
  pickupPointId: string;
  sequenceOrder: number;
  estimatedTimeFromPrevious: number;  // minutes
  estimatedDistanceFromPrevious: number; // meters
  cumulativeTime: number;
  cumulativeDistance: number;
  price: number;
};

// ActivityLog - Audit trail
type ActivityLog = {
  id: string;
  entityType: 'pickup_point' | 'rayon' | 'route_sequence' | 'schedule' | 'booking';
  entityId: string;
  entityName: string;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  changes: Record<string, { oldValue: any; newValue: any }>;
  userId: string;
  userName: string;
  timestamp: string;
  ipAddress?: string;
  details?: string;
};
```

---

## Data Structure Examples

### Valid PickupPoint
```typescript
{
  id: 'pk1',
  code: 'PK-A-001',
  name: 'Terminal Hermes',
  rayon: 'A',
  address: 'Jl. Benda No. 1, Medan',
  city: 'Medan',
  district: 'Medan Kota',
  lat: 3.5952,
  lng: 98.6722,
  phone: '0612789',
  contactPerson: 'Budi',
  isActive: true,
  description: 'Terminal utama Medan',
  estimatedWaitTime: 10,
  maxCapacity: 50,
  facilities: ['WiFi', 'Toilet', 'Parking'],
  operatingHours: { open: '06:00', close: '22:00' },
  createdAt: '2025-01-01T08:00:00Z',
  updatedAt: '2025-01-01T08:00:00Z',
  createdBy: 'admin1',
  updatedBy: 'admin1',
}
```

### Valid Rayon
```typescript
{
  id: 'ray-a',
  code: 'A',
  name: 'Rayon A',
  label: 'Kota Medan',
  description: 'Wilayah Medan Kota dan sekitarnya',
  pricePerMeter: 2.0,
  coverage: '50 km²',
  pickupPointCount: 5,
  isActive: true,
}
```

---

## Validation Rules Quick Reference

| Field | Rules |
|-------|-------|
| `code` | Format PK-[A-D]-[001] (required, unique) |
| `name` | Min 3 chars, unique per rayon (required) |
| `address` | Min 5 chars (required) |
| `city` | Required |
| `district` | Required |
| `lat` | -90 to 90 (required) |
| `lng` | -180 to 180 (required) |
| `phone` | Indonesian format, 7+ digits (required) |
| `contactPerson` | Required |
| `coordinates` | Must be unique (no duplicates) |
| `operatingHours` | close > open (optional) |
| `maxCapacity` | > 0 if provided |

---

## Common Mistakes to Avoid

❌ **Wrong:** Direct state mutation
```typescript
shuttle.pickupPoints.push(newPoint);  // DON'T DO THIS
```

✅ **Right:** Use context methods
```typescript
shuttle.addPickupPoint(newPoint);  // Use context method
```

---

❌ **Wrong:** Duplicate detection not checked
```typescript
shuttle.addPickupPoint({ code: 'PK-A-001' });  // Might fail if duplicate
```

✅ **Right:** Validate before adding
```typescript
const errors = validatePickupPoint(data);
if (errors.length === 0) {
  shuttle.addPickupPoint(data);
}
```

---

❌ **Wrong:** Missing required fields
```typescript
shuttle.addPickupPoint({
  code: 'PK-A-001',
  name: 'Test',
  // Missing rayon, address, etc
});
```

✅ **Right:** Provide all required fields
```typescript
const required = ['code', 'name', 'rayon', 'address', 'city', 'district', 'lat', 'lng', 'phone', 'contactPerson'];
// Ensure all are present before adding
```

---

## Routes Available

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/pickup-points` | AdminPickupPoints | Main pickup point management |
| `/admin/rayons` | AdminRayons | Rayon management & pricing |

Both automatically integrated into AdminLayout sidebar.

---

## Debugging Tips

### Check current state
```typescript
const shuttle = useShuttle();
console.log('Pickup Points:', shuttle.pickupPoints);
console.log('Activity Logs:', shuttle.activityLogs);
```

### Verify data structure
```typescript
import { validatePickupPoint } from '@/lib/validation';
const errors = validatePickupPoint(suspiciousData);
console.log('Validation errors:', errors);
```

### Check if point was modified
```typescript
const logs = shuttle.getActivityLogsByEntity('pk1');
console.log('All changes to this point:', logs);
```

---

## Next: Add-On Features

### Feature: Bulk Import
```typescript
function importCSVPickupPoints(csvFile) {
  const points = parseCSV(csvFile);
  points.forEach(p => {
    if (!isDuplicatePickupPoint(shuttle.pickupPoints, p)) {
      shuttle.addPickupPoint(p);
    }
  });
}
```

### Feature: Batch Operations
```typescript
function toggleMultipleStatus(ids: string[]) {
  ids.forEach(id => shuttle.togglePickupPointStatus(id));
}

function deleteMultiple(ids: string[]) {
  ids.forEach(id => shuttle.deletePickupPoint(id));
}
```

### Feature: Custom Reporting
```typescript
function generateReport() {
  const byRayon = groupBy(shuttle.pickupPoints, 'rayon');
  const stats = {
    total: shuttle.pickupPoints.length,
    active: shuttle.pickupPoints.filter(p => p.isActive).length,
    byRayon: Object.entries(byRayon).map(([ray, points]) => ({
      rayon: ray,
      count: points.length,
      active: points.filter(p => p.isActive).length,
    })),
  };
  return stats;
}
```

---

## Resources

- Full docs: [PICKUP_POINT_SYSTEM_DOCUMENTATION.md](./PICKUP_POINT_SYSTEM_DOCUMENTATION.md)
- Types: [src/types/shuttle.ts](./src/types/shuttle.ts)
- Context: [src/contexts/ShuttleContext.tsx](./src/contexts/ShuttleContext.tsx)
- Utilities: [src/lib/validation.ts](./src/lib/validation.ts) & [src/lib/export.ts](./src/lib/export.ts)

---

**Happy coding! 🚀**
