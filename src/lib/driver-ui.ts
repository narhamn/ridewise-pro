
import type { TripStatus } from "@/types/shuttle";

/**
 * Centralized status configuration for consistent UI/UX across the driver application.
 */
export const TRIP_STATUS_CONFIG: Record<TripStatus, {
  label: string;
  color: string;
  badge: string;
  iconColor: string;
}> = {
  scheduled: {
    label: 'Terjadwal',
    color: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    iconColor: 'text-blue-500',
  },
  boarding: {
    label: 'Boarding',
    color: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    iconColor: 'text-amber-500',
  },
  departed: {
    label: 'Dalam Perjalanan',
    color: 'bg-indigo-500',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    iconColor: 'text-indigo-500',
  },
  arrived: {
    label: 'Selesai',
    color: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-500',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    iconColor: 'text-rose-500',
  },
};

/**
 * Driver-specific typography classes for consistent font sizing.
 */
export const DRIVER_TYPOGRAPHY = {
  heading1: "text-2xl font-black tracking-tight",
  heading2: "text-xl font-bold tracking-tight",
  heading3: "text-lg font-bold",
  bodyLarge: "text-base font-medium",
  bodySmall: "text-sm text-muted-foreground",
  caption: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
  price: "text-2xl font-black font-mono",
};

/**
 * Standardized spacing and border radius for a consistent look.
 */
export const DRIVER_LAYOUT = {
  cardPadding: "p-4",
  cardRadius: "rounded-2xl",
  buttonRadius: "rounded-xl",
  sectionGap: "space-y-6",
  itemGap: "space-y-3",
};
