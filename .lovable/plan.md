

# Review Penggunaan Map — Temuan & Rencana Cleanup

## Temuan

### File Map yang Aktif Digunakan (KEEP)
| File | Digunakan Oleh |
|------|---------------|
| `RealTimeMap.tsx` | AdminTracking, CustomerBookingDetail |
| `MapView.tsx` | DriverTracking |
| `MapLegend.tsx` | AdminTracking, DriverTracking |
| `RouteTrackingDisplay.tsx` | RealTimeMap, AdminTracking, DriverTracking |
| `RouteMapEditor.tsx` | AdminRoutes, RouteManager |
| `map-icons.ts` | RealTimeMap, DriverTracking |
| `map-tiles.ts` | MapView, RealTimeMap |
| `services/routeTracking.ts` | RouteTrackingDisplay |

### File Map ORPHAN — Tidak Digunakan (DELETE)
| File | Masalah |
|------|---------|
| `components/map/MapController.tsx` | Export `MAP_LAYERS` & `MapController` — **tidak di-import oleh siapa pun** |
| `pages/admin/AdminTracking-old.tsx` | File lama, tidak di-import oleh App.tsx |
| `pages/customer/CustomerBookingDetail-old.tsx` | File lama, tidak di-import oleh App.tsx |
| `components/RouteManager.tsx` | Tidak di-import oleh file manapun |
| `MAP_IMPLEMENTATION_GUIDE.md` | Dokumentasi lama, banyak info outdated |

### File yang Bisa Dioptimasi
| File | Masalah |
|------|---------|
| `MapView.tsx` | Hanya dipakai oleh DriverTracking — pertimbangkan inline atau tetap sebagai shared component |
| `RealTimeMap.tsx` | Import `OSM_DE_TILE_URL` & `OSM_DE_ATTRIBUTION` dari map-tiles tapi tidak pernah dipakai |
| `map-tiles.ts` | Export `OSM_DE_TILE_URL` & `OSM_DE_ATTRIBUTION` — tidak digunakan |

## Rencana

### 1. Hapus 5 file orphan
- `src/components/map/MapController.tsx`
- `src/pages/admin/AdminTracking-old.tsx`
- `src/pages/customer/CustomerBookingDetail-old.tsx`
- `src/components/RouteManager.tsx`
- `MAP_IMPLEMENTATION_GUIDE.md`

### 2. Bersihkan export tidak terpakai
- `map-tiles.ts`: hapus `OSM_DE_TILE_URL` dan `OSM_DE_ATTRIBUTION`
- `RealTimeMap.tsx`: hapus import `OSM_DE_*` yang tidak digunakan

### 3. Hasil akhir — file map yang tersisa (bersih)
```text
src/
├── components/
│   ├── MapView.tsx              ← shared map base (DriverTracking)
│   ├── RealTimeMap.tsx          ← advanced map (AdminTracking, CustomerBookingDetail)
│   ├── MapLegend.tsx            ← legend overlay
│   ├── RouteMapEditor.tsx       ← editor rute (AdminRoutes)
│   └── RouteTrackingDisplay.tsx ← hook + panels (ETA, route info)
├── lib/
│   ├── map-icons.ts             ← icon utilities
│   └── map-tiles.ts             ← tile URLs (cleaned)
└── services/
    └── routeTracking.ts         ← route calculation service
```

Tidak ada perubahan fungsional — hanya cleanup file mati dan import tidak terpakai.

