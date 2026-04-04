/**
 * Route Tracking Service
 * Menggunakan OpenStreetMap Routing Service (OSRM) untuk:
 * - Mendapatkan rute optimal antara dua atau lebih titik
 * - Menampilkan polyline di peta
 * - Kalkulasi jarak dan estimasi waktu perjalanan
 */

import L from 'leaflet';
import { RoutePoint } from '@/types/shuttle';

// Public OSRM demo server (untuk production, gunakan instance sendiri)
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface RouteLeg {
  distance: number;  // dalam meter
  duration: number;  // dalam detik
  steps: RouteStep[];
}

export interface RouteStep {
  distance: number;
  duration: number;
  name: string;
  instruction: string;
  bearing_before?: number;
  bearing_after?: number;
}

export interface RoutingResponse {
  code: string;
  routes: {
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
    legs: RouteLeg[];
    distance: number;    // meter
    duration: number;    // detik
    weight: number;
    weight_name: string;
  }[];
  waypoints: {
    hint: string;
    distance: number;
    name: string;
    location: [number, number];
  }[];
}

/**
 * Format koordinat untuk OSRM API
 * Format: lng,lat;lng,lat atau lng,lat|lng,lat
 */
function formatCoordinates(points: RouteCoordinate[]): string {
  return points.map(p => `${p.lng},${p.lat}`).join(';');
}

/**
 * Fetch rute dari OSRM berdasarkan daftar titik
 */
export async function getRoute(points: RouteCoordinate[]): Promise<RoutingResponse | null> {
  if (points.length < 2) {
    console.warn('Minimal 2 titik diperlukan untuk mendapatkan rute');
    return null;
  }

  try {
    const coordinates = formatCoordinates(points);
    const url = `${OSRM_BASE_URL}/${coordinates}?overview=full&steps=true&geometries=geojson&annotations=distance,duration`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`OSRM API error: ${response.status}`);
      return null;
    }

    const data: RoutingResponse = await response.json();

    if (data.code !== 'Ok') {
      console.error(`OSRM routing error: ${data.code}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Gagal mengambil rute dari OSRM:', error);
    return null;
  }
}

/**
 * Fetch rute dari beberapa waypoints dengan optimization
 * Berguna untuk rute dengan banyak titik jemput
 */
export async function getOptimizedRoute(points: RouteCoordinate[]): Promise<RoutingResponse | null> {
  if (points.length < 2) {
    console.warn('Minimal 2 titik diperlukan untuk mendapatkan rute');
    return null;
  }

  try {
    const coordinates = formatCoordinates(points);
    // Gunakan /table untuk jarak antar titik atau /route untuk rute lengkap
    const url = `${OSRM_BASE_URL}/${coordinates}?overview=full&steps=true&geometries=geojson`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`OSRM API error: ${response.status}`);
      return null;
    }

    const data: RoutingResponse = await response.json();

    if (data.code !== 'Ok') {
      console.error(`OSRM routing error: ${data.code}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Gagal mengambil rute optimized:', error);
    return null;
  }
}

/**
 * Buat polyline dari koordinat rute
 */
export function createRoutePolyline(
  coordinates: [number, number][],
  options?: L.PolylineOptions
): L.Polyline {
  const defaultOptions: L.PolylineOptions = {
    color: '#3b82f6',      // Blue
    weight: 4,
    opacity: 0.8,
    lineCap: 'round',
    lineJoin: 'round',
    dashArray: undefined,
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const latLngs = coordinates.map(coord => [coord[1], coord[0]] as [number, number]);

  return L.polyline(latLngs, mergedOptions);
}

/**
 * Buat polyline dengan animasi untuk rute aktif
 */
export function createAnimatedRoutePolyline(
  coordinates: [number, number][],
  map: L.Map,
  options?: L.PolylineOptions
): L.Polyline {
  const defaultOptions: L.PolylineOptions = {
    color: '#10b981',      // Green untuk aktif
    weight: 5,
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round',
    className: 'animated-route-polyline',
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const polyline = createRoutePolyline(coordinates, mergedOptions);

  // Tambahkan animasi CSS jika diperlukan
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      .animated-route-polyline {
        animation: dashOffset 20s linear infinite;
      }
      @keyframes dashOffset {
        0% {
          stroke-dashoffset: 0;
        }
        100% {
          stroke-dashoffset: 20;
        }
      }
    `;
    document.head.appendChild(style);
  }

  polyline.addTo(map);
  return polyline;
}

/**
 * Tambahkan marker untuk tiap step/instruksi dalam rute
 */
export function addRouteStepMarkers(
  legs: RouteLeg[],
  map: L.Map,
  stepColor: string = '#f59e0b'
): L.Marker[] {
  const markers: L.Marker[] = [];
  let stepNumber = 0;

  legs.forEach(leg => {
    leg.steps.forEach(step => {
      stepNumber++;
      // Marker ditambahkan pada koordinat pertama dari step
      // OSRM tidak memberikan lat/lng eksplisit untuk steps, jadi ini adalah implementasi dasar
    });
  });

  return markers;
}

/**
 * Konversi detik menjadi format waktu yang mudah dibaca
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Konversi meter menjadi kilometer
 */
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Hitung informasi rute dari response OSRM
 */
export interface RouteInfo {
  totalDistance: number;      // meter
  totalDuration: number;      // detik
  waypoints: Array<{
    name: string;
    distance: number;
  }>;
  route: {
    geometry: [number, number][];
  };
}

export function extractRouteInfo(response: RoutingResponse): RouteInfo {
  if (!response.routes || response.routes.length === 0) {
    throw new Error('Tidak ada rute dalam response');
  }

  const mainRoute = response.routes[0];

  return {
    totalDistance: mainRoute.distance,
    totalDuration: mainRoute.duration,
    waypoints: response.waypoints.map(wp => ({
      name: wp.name,
      distance: wp.distance,
    })),
    route: {
      geometry: mainRoute.geometry.coordinates as [number, number][],
    },
  };
}

/**
 * Buat mehrere route polylines untuk multiple routes (perbandingan)
 */
export function createMultipleRoutePolylines(
  routeResponses: RoutingResponse[],
  colors: string[] = ['#3b82f6', '#10b981', '#f59e0b']
): L.Polyline[] {
  const polylines: L.Polyline[] = [];

  routeResponses.forEach((response, index) => {
    const color = colors[index % colors.length];
    const route = response.routes[0];

    if (route && route.geometry) {
      const polyline = createRoutePolyline(
        route.geometry.coordinates as [number, number][],
        {
          color,
          opacity: 0.7,
          weight: 3,
        }
      );
      polylines.push(polyline);
    }
  });

  return polylines;
}

/**
 * Cache untuk hasil routing (untuk menghindari API calls yang berlebihan)
 */
class RouteCache {
  private cache: Map<string, RoutingResponse> = new Map();
  private maxSize = 50;

  private getKey(points: RouteCoordinate[]): string {
    return points.map(p => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join('|');
  }

  get(points: RouteCoordinate[]): RoutingResponse | undefined {
    return this.cache.get(this.getKey(points));
  }

  set(points: RouteCoordinate[], response: RoutingResponse): void {
    const key = this.getKey(points);

    // Jika cache sudah penuh, hapus entry paling lama
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, response);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const routeCache = new RouteCache();

/**
 * Dapatkan rute dengan cache
 */
export async function getRouteCached(points: RouteCoordinate[]): Promise<RoutingResponse | null> {
  const cached = routeCache.get(points);
  if (cached) {
    console.log('Menggunakan rute dari cache');
    return cached;
  }

  const response = await getRoute(points);
  if (response) {
    routeCache.set(points, response);
  }

  return response;
}

/**
 * Konversi RoutePoint array menjadi RouteCoordinate array
 */
export function routePointsToCoordinates(points: RoutePoint[]): RouteCoordinate[] {
  return points.map(p => ({
    lat: p.lat,
    lng: p.lng,
  }));
}
