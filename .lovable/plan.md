

# Review & Refinement — Fix All Build Errors

## Diagnosis

The codebase has **~70+ TypeScript errors** across **~20 files**. Root causes:

1. **Orphaned files** — Old pages/components that were superseded by mergers (Rute+Titik Jemput, Kendaraan+Assign) but never deleted. They reference types that no longer exist (`PickupPoint`, `Rayon`, `ActivityLog`, `MapLayerType`, `RouteSequence`).

2. **Stale property references** — Several components reference properties that don't exist on current interfaces (e.g., `booking.pickupLocation`, `booking.bookingId`, `routePoint.address`, `routePoint.status`, `routePoint.rayonId`).

3. **Context type mismatch** — `ShuttleContext.Provider` passes `updateDriverProfile`, `recalcRoutePointPrices`, `recalculateRouteDistanceAndPrice` but these are NOT declared in `ShuttleContextType` interface.

4. **Missing type exports** — `ActivityLog`, `PickupPoint`, `Rayon`, `MapLayerType`, `RouteSequence` were removed from `shuttle.ts` but still imported by old files.

5. **Test/Storybook files** — Reference `@storybook/react` (not installed) and outdated `Driver` shape.

## Changes

### Phase 1: Delete orphaned files (not used in any route or import chain)

Delete these files — none are imported by active routes in `App.tsx`:

| File | Reason |
|------|--------|
| `src/pages/admin/AdminPickupPoints.tsx` | Old standalone page, not in App.tsx |
| `src/pages/admin/AdminRayons.tsx` | Old standalone page, not in App.tsx |
| `src/pages/admin/AdminPoints.tsx` | Replaced by merged AdminRoutes, not in App.tsx |
| `src/components/PickupPointForm.tsx` | Used only by AdminPickupPoints |
| `src/components/PickupPointTable.tsx` | Used only by AdminPickupPoints |
| `src/components/PickupPointMap.tsx` | Used only by AdminPickupPoints (different from admin/PickupPointMap) |
| `src/components/ActivityLogViewer.tsx` | Used only by AdminPickupPoints |
| `src/components/RoutePath.tsx` | References removed types, unused |
| `src/components/RouteSequenceEditor.tsx` | References removed types, unused |
| `src/components/RouteSequenceList.tsx` | References removed types, unused |
| `src/components/RouteTrackingIntegration.tsx` | Example file, not imported by any route |
| `src/components/DriverStatusCard.stories.tsx` | Storybook not installed |
| `src/components/DriverStatusCard.test.tsx` | Outdated Driver mock |
| `src/components/map/RouteEditorMap.test.tsx` | Outdated Route mock |
| `src/components/driver/WalletBalance.tsx` | References `wallets`/`transactions` not in context |
| `src/components/driver/WalletBalance.test.tsx` | Test for removed component |

### Phase 2: Fix active components with type errors

**`src/components/admin/PickupPointMap.tsx`** (used by AdminPoints which is deleted — but also imported by adminRoutes? Let me verify)
- Actually only imported by `AdminPoints.tsx` → delete too

**`src/components/admin/PointDetailDialog.tsx`** and **`src/components/admin/PointEditDialog.tsx`**
- Only imported by `AdminPoints.tsx` → delete too

**`src/components/customer/CustomerPickupMap.tsx`**
- References `mapLayer`, `favorites`, `pickupHistory`, `addFavorite` not in `ShuttleContextType`
- Check if imported by any active page; if not, delete

**`src/components/map/MapController.tsx`**
- Exports `MAP_LAYERS` (used by other files) but references `MapLayerType` and `mapLayer`/`setMapLayer` from context
- Fix: define `MapLayerType` locally, remove context dependency from the component (keep `MAP_LAYERS` export as a static constant)

**`src/components/map/RouteEditorMap.tsx`**
- References `mapLayer` and `systemConfig` from context — not in type
- Check if actually used anywhere in active routes; likely orphaned (only test imports it)
- Delete

**`src/components/RealTimeMap.tsx`**
- Line 457: `selectedSchedule.bookingId` — `Schedule` has no `bookingId`
- Fix: remove or replace with `selectedSchedule.id`

**`src/contexts/ShuttleContext.tsx`**
- Line 739: `updateDriverProfile` not in interface
- Fix: add `updateDriverProfile`, `recalcRoutePointPrices`, `recalculateRouteDistanceAndPrice` to `ShuttleContextType`

**`src/data/dummy.ts`**
- Line 27-28: `ocrData` objects have `name`/`nik`/`type`/`expiry` but `OCRData` only has `extractedText`, `confidence`, `fields`, `rawData`
- Fix: move these into `fields` sub-object

### Phase 3: Fix remaining import/type issues

- Check `src/components/customer/CustomerPickupMap.tsx` usage — if only by deleted pages, delete it
- Clean up any remaining broken imports

## Summary

| Action | File Count |
|--------|-----------|
| Delete orphaned files | ~19 files |
| Fix ShuttleContextType interface | 1 file |
| Fix RealTimeMap property access | 1 file |
| Fix MapController (local type) | 1 file |
| Fix dummy.ts OCRData shape | 1 file |
| Total files touched | ~23 |

This will reduce the error count from 70+ to 0 and clean up significant dead code.

