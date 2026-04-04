import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 * @returns distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validates that a distance is positive and coordinates are valid.
 */
export function isValidRouteData(lat1: number, lon1: number, lat2: number, lon2: number): boolean {
  const isValidLat = (lat: number) => lat >= -90 && lat <= 90;
  const isValidLon = (lon: number) => lon >= -180 && lon <= 180;
  return isValidLat(lat1) && isValidLon(lon1) && isValidLat(lat2) && isValidLon(lon2);
}
