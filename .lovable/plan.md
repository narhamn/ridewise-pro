

# Fix Infinite Loop di Admin Tracking

## Penyebab

`RealTimeMap.tsx` baris 288-292:
```typescript
useEffect(() => {
  if (onRouteInfoChange && showRouteTracking) {
    onRouteInfoChange(routeTracking);
  }
}, [routeTracking, onRouteInfoChange, showRouteTracking]);
```

`routeTracking` adalah object baru setiap render (dari `useRouteTracking` hook yang return `{ routeInfo, isLoading, error, polyline, routeResponse }`). Ini memicu effect → memanggil `onRouteInfoChange(routeTracking)` → parent (`AdminTracking`) memanggil `setRouteTracking` → re-render → object baru lagi → loop tanpa henti.

Ditambah lagi, `AdminTracking.tsx` baris 68 melanggar rules of hooks:
```typescript
const activeSchedules = rtActiveSchedules.length > 0 ? rtActiveSchedules : useMemo(...)
```
`useMemo` dipanggil secara kondisional — ini ilegal di React.

## Perbaikan

### 1. `src/components/RealTimeMap.tsx` — Stabilkan effect dependency

Ganti dependency `routeTracking` (selalu baru) dengan field-field primitif yang stabil:
```typescript
useEffect(() => {
  if (onRouteInfoChange && showRouteTracking) {
    onRouteInfoChange(routeTracking);
  }
}, [routeTracking.routeInfo, routeTracking.isLoading, routeTracking.error, onRouteInfoChange, showRouteTracking]);
```

Atau lebih baik: gunakan `useRef` untuk menyimpan `routeTracking` terakhir dan hanya panggil callback saat `routeInfo` benar-benar berubah (compare distance/duration).

### 2. `src/pages/admin/AdminTracking.tsx` — Fix conditional hook

Pindahkan `useMemo` keluar dari kondisional:
```typescript
const fallbackSchedules = useMemo(() =>
  schedules.filter(s => s.driverId && (s.status === 'departed' || s.status === 'boarding')),
  [schedules]
);
const activeSchedules = rtActiveSchedules.length > 0 ? rtActiveSchedules : fallbackSchedules;
```

### 3. `src/pages/admin/AdminTracking.tsx` — Stabilkan `onRouteInfoChange`

Wrap `setRouteTracking` dengan `useCallback` atau gunakan `useRef` agar tidak membuat function baru tiap render (sudah stabil karena dari `useState`, tapi pastikan tidak di-wrap ulang).

## File yang Diubah

| File | Aksi |
|------|------|
| `src/components/RealTimeMap.tsx` | Stabilkan useEffect dependency untuk routeTracking callback |
| `src/pages/admin/AdminTracking.tsx` | Fix conditional useMemo (hooks violation) |

