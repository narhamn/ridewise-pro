import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { OSM_ATTRIBUTION, OSM_TILE_URL } from '@/lib/map-tiles';

const OSM_DE_TILE_URL = 'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png';
const OSM_DE_ATTRIBUTION = '© OpenStreetMap contributors';
import { DriverLocation, TrackingLog, Schedule, Driver, Route, RoutePoint } from '@/types/shuttle';
import { toast } from 'sonner';
import { useRouteTracking, RouteInfoPanel, ETADisplay, RouteTrackingHookResult } from '@/components/RouteTrackingDisplay';
import {
  createDriverIcon,
  createRoutePointIcon,
  createRouteLine,
  createDriverPopup,
  createRoutePointPopup,
  getMapStyles,
  DriverStatusType as DriverStatusIconType,
} from '@/lib/map-icons';

interface RealTimeMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  showTraffic?: boolean;
  showGeofences?: boolean;
  onMapReady?: (map: L.Map) => void;
  // Real-time data
  driverLocations?: Record<string, DriverLocation>;
  activeSchedules?: Schedule[];
  drivers?: Driver[];
  routes?: Route[];
  routePoints?: RoutePoint[];
  trackingLogs?: TrackingLog[];
  // Interaction callbacks
  onDriverClick?: (driverId: string) => void;
  onLocationUpdate?: (location: DriverLocation) => void;
  // Configuration
  enableClustering?: boolean;
  showHistory?: boolean;
  updateInterval?: number;
  selectedDriverId?: string | null;
  // Route tracking props
  showRouteTracking?: boolean;
  selectedScheduleId?: string | null;
  onRouteInfoChange?: (routeInfo: RouteTrackingHookResult) => void;
}

const RealTimeMap = ({
  center = [3.5952, 98.6722],
  zoom = 13,
  className,
  showTraffic = false,
  showGeofences = false,
  onMapReady,
  driverLocations = {},
  activeSchedules = [],
  drivers = [],
  routes = [],
  routePoints = [],
  trackingLogs = [],
  onDriverClick,
  onLocationUpdate,
  enableClustering = false,
  showHistory = false,
  updateInterval = 3000,
  selectedDriverId = null,
  showRouteTracking = false,
  selectedScheduleId = null,
  onRouteInfoChange,
}: RealTimeMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const onMapReadyRef = useRef(onMapReady);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const routePointMarkersRef = useRef<Record<string, L.Marker>>({});
  const historyLinesRef = useRef<Record<string, L.Polyline>>({});
  const routeLinesRef = useRef<Record<string, L.Polyline>>({});
  const connectingLinesRef = useRef<Record<string, L.Polyline>>({});
  const geofenceCirclesRef = useRef<Record<string, L.Circle>>({});
  const trafficLayerRef = useRef<L.TileLayer | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const [centerLat, centerLng] = center;

  // Keep onMapReady callback ref in sync without triggering effect
  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  // Get driver status for icon
  const getDriverStatus = useCallback((driver: Driver, location: DriverLocation, schedule?: Schedule): DriverStatusIconType => {
    const isMoving = (location.speed || 0) > 5;
    const hasActiveTrip = schedule && ['boarding', 'departed', 'boarding'].includes(schedule.status);

    if (!driver || driver.status !== 'online') return 'offline';
    if (hasActiveTrip) return isMoving ? 'online-moving' : 'online-stopped';
    return 'on-trip';
  }, []);

  // Create route visualization with connecting lines
  const visualizeRoute = useCallback((schedule: Schedule) => {
    const route = routes.find(r => r.id === schedule.routeId);
    if (!route || !mapInstance.current) return;

    const points = routePoints
      .filter(p => p.routeId === route.id)
      .sort((a, b) => a.order - b.order);

    if (points.length < 2) return;

    // Remove old line if exists
    if (routeLinesRef.current[schedule.id]) {
      mapInstance.current.removeLayer(routeLinesRef.current[schedule.id]);
    }

    // Create connecting line between points
    const latlngs = points.map(p => [p.lat, p.lng] as [number, number]);
    const routeLine = createRouteLine(latlngs, schedule.status, true);
    routeLine.addTo(mapInstance.current);
    routeLinesRef.current[schedule.id] = routeLine;

    // Add route point markers
    points.forEach((point, idx) => {
      const markerId = `point-${point.id}`;
      const isFirst = idx === 0;
      const isLast = idx === points.length - 1;
      
      const pointType = isFirst ? 'origin' : isLast ? 'destination' : 'intermediate';
      const icon = createRoutePointIcon(pointType, idx + 1, false, false);

      if (routePointMarkersRef.current[markerId]) {
        mapInstance.current!.removeLayer(routePointMarkersRef.current[markerId]);
      }

      const marker = L.marker([point.lat, point.lng], { icon }).addTo(mapInstance.current!);
      
      // Create popup
      const nextPoint = points[idx + 1];
      const distanceFromStart = idx === 0 ? 0 : 
        Math.sqrt(Math.pow(point.lat - points[0].lat, 2) + Math.pow(point.lng - points[0].lng, 2)) * 111;
      
      const popupHTML = createRoutePointPopup(point, idx + 1, nextPoint, distanceFromStart * 1000);
      marker.bindPopup(L.popup({ className: 'route-point-popup' }).setContent(popupHTML));

      routePointMarkersRef.current[markerId] = marker;
    });

    // Draw connecting line from current driver to first pickup point (if on trip)
    if (schedule.status === 'departed' || schedule.status === 'boarding') {
      const driverId = schedule.driverId;
      const driverLocation = driverLocations[driverId];
      
      if (driverLocation && points.length > 0) {
        const connectLineId = `connect-${schedule.id}`;
        const driverLatLng: [number, number] = [driverLocation.latitude, driverLocation.longitude];
        const firstPointLatLng: [number, number] = [points[0].lat, points[0].lng];

        if (connectingLinesRef.current[connectLineId]) {
          mapInstance.current.removeLayer(connectingLinesRef.current[connectLineId]);
        }

        const connectLine = L.polyline([driverLatLng, firstPointLatLng], {
          color: '#3b82f6',
          weight: 2,
          opacity: 0.6,
          dashArray: '5, 5',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(mapInstance.current);
        
        connectingLinesRef.current[connectLineId] = connectLine;
      }
    }
  }, [routes, routePoints, driverLocations, createRouteLine, createRoutePointIcon, createRoutePointPopup]);

  // Create geofence zones around pickup points
  const createGeofences = useCallback(() => {
    if (!showGeofences || !mapInstance.current) return;

    activeSchedules.forEach(schedule => {
      const route = routes.find(r => r.id === schedule.routeId);
      if (!route) return;

      const pickupPoints = routePoints.filter(p => p.routeId === route.id);
      pickupPoints.forEach((point, idx) => {
        const geofenceId = `geofence-${point.id}`;
        
        // Skip if already exists
        if (geofenceCirclesRef.current[geofenceId]) return;

        const circle = L.circle([point.lat, point.lng], {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.08,
          radius: 150, // 150 meters radius
          weight: 2,
          dashArray: '5, 5'
        }).addTo(mapInstance.current!);

        const popupContent = `
          <div style="font-size: 13px; font-family: system-ui;">
            <div style="font-weight: bold; color: #10b981; margin-bottom: 4px;">🚩 Zona Jemput ${idx + 1}</div>
            <div style="color: #374151; margin-bottom: 6px;">${point.name}</div>
            <div style="color: #6b7280; font-size: 12px;">Jarak: 150 meter dari titik</div>
          </div>
        `;

        circle.bindPopup(popupContent);
        geofenceCirclesRef.current[geofenceId] = circle;
      });
    });
  }, [showGeofences, activeSchedules, routes, routePoints]);

  // Initialize map with base layer once on mount
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Fix for Leaflet icons in Vite
    const iconPrototype = (L.Icon.Default.prototype as any);
    delete iconPrototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([centerLat, centerLng], zoom);

    // OpenStreetMap base layer
    L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19
    }).addTo(map);

    // Add custom CSS styles for animations
    const style = document.createElement('style');
    style.innerHTML = getMapStyles();
    document.head.appendChild(style);

    mapInstance.current = map;
    setMapReady(true);

    if (onMapReadyRef.current) {
      onMapReadyRef.current(map);
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      map.remove();
      mapInstance.current = null;
      setMapReady(false);
    };
  }, []);

  // Update map view only when coordinates or zoom change
  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.setView([centerLat, centerLng], zoom);
  }, [centerLat, centerLng, zoom]);

  // Setup route tracking for selected schedule
  const selectedSchedule = activeSchedules.find(s => s.id === selectedScheduleId);
  const selectedRoute = selectedSchedule ? routes.find(r => r.id === selectedSchedule.routeId) : null;
  const selectedRoutePoints = selectedRoute 
    ? routePoints.filter(p => p.routeId === selectedRoute.id).sort((a, b) => a.order - b.order)
    : [];

  const pickupPoint = selectedRoutePoints[0];
  const dropoffPoint = selectedRoutePoints[selectedRoutePoints.length - 1];

  const routeTracking = useRouteTracking(
    pickupPoint ? { lat: pickupPoint.lat, lng: pickupPoint.lng } : null,
    dropoffPoint ? { lat: dropoffPoint.lat, lng: dropoffPoint.lng } : null,
    selectedRoutePoints.slice(1, -1).map(p => ({ lat: p.lat, lng: p.lng })),
    mapReady ? mapInstance.current || undefined : undefined
  );

  // Notify parent of route info changes
  useEffect(() => {
    if (onRouteInfoChange && showRouteTracking) {
      onRouteInfoChange(routeTracking);
    }
  }, [routeTracking, onRouteInfoChange, showRouteTracking]);

  // Real-time driver marker updates
  useEffect(() => {
    if (!mapInstance.current || activeSchedules.length === 0) return;

    const updateMap = () => {
      // Update driver markers
      activeSchedules.forEach(schedule => {
        const driverId = schedule.driverId;
        if (!driverId) return;

        const location = driverLocations[driverId];
        const driver = drivers.find(d => d.id === driverId);

        if (!location || !driver) return;

        const pos: [number, number] = [location.latitude, location.longitude];
        const isSelected = driverId === selectedDriverId;
        const driverStatus = getDriverStatus(driver, location, schedule);

        if (markersRef.current[driverId]) {
          // Update existing marker
          markersRef.current[driverId].setLatLng(pos);
          const newIcon = createDriverIcon(driverStatus, isSelected, true);
          markersRef.current[driverId].setIcon(newIcon);
        } else {
          // Create new driver marker
          const icon = createDriverIcon(driverStatus, isSelected, true);
          const marker = L.marker(pos, { icon }).addTo(mapInstance.current!);

          // Bind detailed popup
          const popupHTML = createDriverPopup(driver, schedule, location);
          marker.bindPopup(L.popup({ className: 'driver-marker-popup', maxWidth: 300 }).setContent(popupHTML));

          marker.on('click', () => {
            if (onDriverClick) {
              onDriverClick(driverId);
            }
          });

          markersRef.current[driverId] = marker;
        }

        // Update tracking history trail if enabled
        if (showHistory) {
          const driverLogs = trackingLogs
            .filter(log => log.entityId === driverId && log.entityType === 'driver')
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .slice(-50);

          if (driverLogs.length > 1) {
            const pathPoints = driverLogs.map(log => [log.latitude, log.longitude] as [number, number]);

            if (historyLinesRef.current[driverId]) {
              historyLinesRef.current[driverId].setLatLngs(pathPoints);
            } else {
              const polyline = L.polyline(pathPoints, {
                color: '#6366f1',
                weight: 2,
                opacity: 0.5,
                dashArray: '2, 4',
                lineCap: 'round'
              }).addTo(mapInstance.current!);
              
              historyLinesRef.current[driverId] = polyline;
            }
          }
        }
      });

      // Visualize active routes
      activeSchedules.forEach(schedule => {
        visualizeRoute(schedule);
      });

      // Create geofences
      createGeofences();

      // Clean up removed drivers
      Object.keys(markersRef.current).forEach(driverId => {
        if (!activeSchedules.find(s => s.driverId === driverId)) {
          if (mapInstance.current && markersRef.current[driverId]) {
            mapInstance.current.removeLayer(markersRef.current[driverId]);
          }
          delete markersRef.current[driverId];
        }
      });

      // Clean up removed routes
      Object.keys(routeLinesRef.current).forEach(scheduleId => {
        if (!activeSchedules.find(s => s.id === scheduleId)) {
          if (mapInstance.current && routeLinesRef.current[scheduleId]) {
            mapInstance.current.removeLayer(routeLinesRef.current[scheduleId]);
          }
          delete routeLinesRef.current[scheduleId];
        }
      });

      // Clean up removed connecting lines
      Object.keys(connectingLinesRef.current).forEach(lineId => {
        const scheduleId = lineId.replace('connect-', '');
        if (!activeSchedules.find(s => s.id === scheduleId)) {
          if (mapInstance.current && connectingLinesRef.current[lineId]) {
            mapInstance.current.removeLayer(connectingLinesRef.current[lineId]);
          }
          delete connectingLinesRef.current[lineId];
        }
      });
    };

    // Initial update
    updateMap();

    // Set up real-time updates
    updateIntervalRef.current = setInterval(updateMap, updateInterval);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [
    driverLocations,
    activeSchedules,
    drivers,
    trackingLogs,
    showHistory,
    visualizeRoute,
    createGeofences,
    onDriverClick,
    updateInterval,
    getDriverStatus,
    selectedDriverId,
    createDriverIcon,
    createDriverPopup,
  ]);

  // Toggle traffic layer
  useEffect(() => {
    if (!mapInstance.current) return;

    if (showTraffic && !trafficLayerRef.current) {
      trafficLayerRef.current = L.tileLayer(OSM_DE_TILE_URL, {
        attribution: OSM_DE_ATTRIBUTION,
        maxZoom: 19,
        opacity: 0.4
      }).addTo(mapInstance.current);
    } else if (!showTraffic && trafficLayerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(trafficLayerRef.current);
      trafficLayerRef.current = null;
    }
  }, [showTraffic]);

  return (
    <div
      ref={mapRef}
      className={cn("w-full h-full bg-slate-100 relative z-0", className)}
    >
      {/* Route info overlay - shown when route tracking is enabled and schedule is selected */}
      {showRouteTracking && selectedScheduleId && (
        <div className="absolute top-6 right-6 z-[500] w-80 max-h-[600px] overflow-y-auto space-y-3">
          {/* Route Info Panel */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="mb-3">
              <h3 className="font-bold text-lg text-gray-900">📍 Rute Perjalanan</h3>
              {selectedSchedule && (
                <p className="text-xs text-gray-600 mt-1">
                  Jadwal: <strong>{selectedSchedule.id}</strong>
                </p>
              )}
            </div>
            <RouteInfoPanel
              routeInfo={routeTracking.routeInfo}
              isLoading={routeTracking.isLoading}
              error={routeTracking.error}
              compact={false}
            />
          </div>

          {/* ETA Display */}
          {routeTracking.routeInfo && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
              <ETADisplay
                durationSeconds={routeTracking.routeInfo.totalDuration}
                compact={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeMap;