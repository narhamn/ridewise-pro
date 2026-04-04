import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Pencil, Trash2, Save, X, Route as RouteIcon } from 'lucide-react';
import { Route, RoutePoint } from '@/types/shuttle';
import { toast } from 'sonner';

// Enhanced marker styles with semantic icons
const markerStyles = `
  .custom-marker {
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    font-size: 14px;
    position: relative;
    transition: all 0.2s ease;
  }

  .custom-marker:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }

  .marker-start {
    background: linear-gradient(135deg, #10b981, #059669);
    border-color: #065f46;
  }

  .marker-end {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-color: #991b1b;
  }

  .marker-intermediate {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-color: #1e40af;
  }

  .marker-temp {
    background: linear-gradient(135deg, #f97316, #ea580c);
    border-color: #9a3412;
    animation: pulse 2s infinite;
  }

  .marker-editing {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    border-color: #5b21b6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .route-line {
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  }

  .drawing-cursor {
    cursor: crosshair;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = markerStyles;
  document.head.appendChild(style);
}

interface RouteMapEditorProps {
  routes: Route[];
  routePoints: RoutePoint[];
  onSaveRoute: (route: Route, points: RoutePoint[]) => void;
  onUpdateRoute: (routeId: string, route: Route, points: RoutePoint[]) => void;
  onDeleteRoute: (routeId: string) => void;
  onSavePoint: (point: RoutePoint) => void;
  onUpdatePoint: (pointId: string, point: RoutePoint) => void;
  onDeletePoint: (pointId: string) => void;
}

const RouteMapEditor = ({
  routes,
  routePoints,
  onSaveRoute,
  onUpdateRoute,
  onDeleteRoute,
  onSavePoint,
  onUpdatePoint,
  onDeletePoint
}: RouteMapEditorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editingPoint, setEditingPoint] = useState<RoutePoint | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempPoints, setTempPoints] = useState<RoutePoint[]>([]);

  // Route form state
  const [routeForm, setRouteForm] = useState({
    name: '',
    rayon: 'A' as Route['rayon'],
    origin: '',
    destination: '',
    pricePerMeter: 2,
    roadConditionMultiplier: 1,
    vehicleTypeMultiplier: 1,
  });

  // Point form state
  const [pointForm, setPointForm] = useState({
    code: '',
    name: '',
    lat: 3.5952,
    lng: 98.6722,
  });

  const updateRouteLine = useCallback(() => {
    if (!mapInstance.current) return;

    // Remove existing line
    if (routeLineRef.current) {
      mapInstance.current.removeLayer(routeLineRef.current);
    }

    // Get all points for current route
    const currentRoutePoints = selectedRoute ? routePoints.filter(p => p.routeId === selectedRoute.id) : [];
    const allPoints = [...currentRoutePoints, ...tempPoints].sort((a, b) => a.order - b.order);

    if (allPoints.length > 1) {
      const latlngs = allPoints.map(p => [p.lat, p.lng] as [number, number]);

      // Different line styles based on state
      const isTempRoute = tempPoints.length > 0;
      const lineOptions = isTempRoute ? {
        color: '#f97316', // Orange for temp routes
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10', // Dashed line for temp
        className: 'route-line'
      } : {
        color: selectedRoute ? '#3b82f6' : '#6b7280', // Blue for selected, gray for default
        weight: 4,
        opacity: 0.8,
        className: 'route-line'
      };

      routeLineRef.current = L.polyline(latlngs, lineOptions).addTo(mapInstance.current);

      // Add direction arrows for better visualization
      if (allPoints.length > 2) {
        const arrowOptions = {
          color: isTempRoute ? '#f97316' : (selectedRoute ? '#3b82f6' : '#6b7280'),
          weight: 2,
          opacity: 0.7
        };

        // Add arrows at regular intervals
        for (let i = 1; i < latlngs.length; i++) {
          const start = latlngs[i - 1];
          const end = latlngs[i];
          const midPoint = [
            (start[0] + end[0]) / 2,
            (start[1] + end[1]) / 2
          ] as [number, number];

          // Calculate angle for arrow direction
          const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI;

          L.marker(midPoint, {
            icon: L.divIcon({
              className: 'route-arrow',
              html: `<div style="transform: rotate(${angle}deg); font-size: 12px;">➤</div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })
          }).addTo(mapInstance.current);
        }
      }
    }
  }, [selectedRoute, routePoints, tempPoints]);

  const addMarkerToMap = useCallback((point: RoutePoint, isTemp: boolean = false) => {
    if (!mapInstance.current) return;

    // Determine marker type and icon
    const currentRoutePoints = selectedRoute ? routePoints.filter(p => p.routeId === selectedRoute.id).sort((a, b) => a.order - b.order) : [];
    const isFirst = point.order === 1;
    const isLast = point.order === currentRoutePoints.length;
    const isIntermediate = !isFirst && !isLast;

    let markerClass = 'custom-marker';
    let iconContent = point.order.toString();
    let markerColor = '';

    if (isTemp) {
      markerClass += ' marker-temp';
      iconContent = '+';
      markerColor = 'orange';
    } else if (editingPoint?.id === point.id) {
      markerClass += ' marker-editing';
      iconContent = '✏️';
    } else if (isFirst) {
      markerClass += ' marker-start';
      iconContent = '🏁'; // Start flag
    } else if (isLast) {
      markerClass += ' marker-end';
      iconContent = '🎯'; // Target/finish
    } else {
      markerClass += ' marker-intermediate';
      iconContent = '📍'; // Location pin
    }

    const marker = L.marker([point.lat, point.lng], {
      draggable: true,
      icon: L.divIcon({
        className: markerClass,
        html: `<div class="flex items-center justify-center w-full h-full text-lg">
          ${iconContent}
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })
    });

    marker.addTo(mapInstance.current);

    // Enhanced popup with action buttons
    const popupContent = `
      <div class="p-3 min-w-[200px]">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">${iconContent}</span>
          <div>
            <h3 class="font-bold text-sm">${point.code}</h3>
            <p class="text-xs text-gray-600">${point.name}</p>
          </div>
        </div>
        <div class="text-xs text-gray-500 space-y-1">
          <p>📍 Lat: ${point.lat.toFixed(6)}</p>
          <p>📍 Lng: ${point.lng.toFixed(6)}</p>
          ${point.distanceFromPrevious > 0 ? `<p>📏 +${(point.distanceFromPrevious / 1000).toFixed(1)} km</p>` : ''}
          ${point.distanceToDestination > 0 ? `<p>🎯 ${(point.distanceToDestination / 1000).toFixed(1)} km to destination</p>` : '<p>🎯 Destination</p>'}
          <p>💰 Rp ${point.price.toLocaleString()}</p>
        </div>
        ${!isTemp ? `
          <div class="flex gap-1 mt-3">
            <button onclick="window.editPoint('${point.id}')" class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">✏️ Edit</button>
            <button onclick="window.deletePoint('${point.id}')" class="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">🗑️ Delete</button>
          </div>
        ` : '<p class="text-xs text-orange-600 mt-2">⚠️ Temporary point - save route to confirm</p>'}
      </div>
    `;

    marker.bindPopup(popupContent);

    // Handle drag with visual feedback
    marker.on('dragstart', () => {
      marker.getElement()?.classList.add('marker-editing');
    });

    marker.on('dragend', (e) => {
      const newPos = e.target.getLatLng();
      const updatedPoint = { ...point, lat: newPos.lat, lng: newPos.lng };

      if (isTemp) {
        setTempPoints(prev => prev.map(p => p.id === point.id ? updatedPoint : p));
      } else {
        onUpdatePoint(point.id, updatedPoint);
      }
      updateRouteLine();

      // Remove editing class
      marker.getElement()?.classList.remove('marker-editing');
      toast.success(`Point ${point.code} moved to new location`);
    });

    markersRef.current.push(marker);
  }, [selectedRoute, routePoints, editingPoint?.id, onUpdatePoint, updateRouteLine]);

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    if (!isDrawing || !selectedRoute) return;

    const { lat, lng } = e.latlng;
    const newPoint: RoutePoint = {
      id: `temp-${Date.now()}`,
      routeId: selectedRoute.id,
      code: `P${tempPoints.length + 1}`,
      name: `Titik ${tempPoints.length + 1}`,
      order: tempPoints.length,
      lat,
      lng,
      distanceFromPrevious: 0,
      cumulativeDistance: 0,
      distanceToDestination: 0,
      price: 0,
    };

    setTempPoints(prev => [...prev, newPoint]);
    addMarkerToMap(newPoint, true);
    updateRouteLine();
  }, [isDrawing, selectedRoute, tempPoints.length, addMarkerToMap, updateRouteLine]);

  const clearMap = () => {
    // Remove all markers
    markersRef.current.forEach(marker => {
      if (mapInstance.current) {
        mapInstance.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Remove route line
    if (routeLineRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
  };

  const loadRouteOnMap = (route: Route) => {
    clearMap();
    setSelectedRoute(route);
    setTempPoints([]);

    const points = routePoints.filter(p => p.routeId === route.id).sort((a, b) => a.order - b.order);
    points.forEach(point => addMarkerToMap(point, false));
    updateRouteLine();

    // Fit map to show all points
    if (points.length > 0 && mapInstance.current) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      mapInstance.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  const startNewRoute = () => {
    setEditingRoute(null);
    setRouteForm({
      name: '',
      rayon: 'A',
      origin: '',
      destination: '',
      pricePerMeter: 2,
      roadConditionMultiplier: 1,
      vehicleTypeMultiplier: 1,
    });
    setTempPoints([]);
    clearMap();
    setIsDrawing(true);
    toast.info('Klik pada peta untuk menambahkan titik-titik rute');
  };

  const editRoute = (route: Route) => {
    setEditingRoute(route);
    setRouteForm({
      name: route.name,
      rayon: route.rayon,
      origin: route.origin,
      destination: route.destination,
      pricePerMeter: route.pricePerMeter,
      roadConditionMultiplier: route.roadConditionMultiplier || 1,
      vehicleTypeMultiplier: route.vehicleTypeMultiplier || 1,
    });
  };

  const editPoint = (point: RoutePoint) => {
    setEditingPoint(point);
    setPointForm({
      code: point.code,
      name: point.name,
      lat: point.lat,
      lng: point.lng,
    });
  };

  const saveNewRoute = () => {
    if (!routeForm.name.trim() || tempPoints.length < 2) {
      toast.error('Nama rute dan minimal 2 titik diperlukan');
      return;
    }

    // Calculate distances and create route
    const points = tempPoints.map((point, index) => ({
      ...point,
      order: index,
      distanceFromPrevious: index === 0 ? 0 : calculateDistance(
        tempPoints[index - 1].lat, tempPoints[index - 1].lng,
        point.lat, point.lng
      ),
    }));

    // Calculate cumulative distances
    let cumulativeDistance = 0;
    const pointsWithCumulative = points.map(point => {
      cumulativeDistance += point.distanceFromPrevious;
      return { ...point, cumulativeDistance };
    });

    const totalDistance = cumulativeDistance;
    const route: Route = {
      id: `route-${Date.now()}`,
      name: routeForm.name,
      rayon: routeForm.rayon,
      origin: routeForm.origin || points[0].name,
      destination: routeForm.destination || points[points.length - 1].name,
      distanceMeters: totalDistance,
      distanceKm: totalDistance / 1000,
      pricePerMeter: routeForm.pricePerMeter,
      price: totalDistance * routeForm.pricePerMeter,
      roadConditionMultiplier: routeForm.roadConditionMultiplier,
      vehicleTypeMultiplier: routeForm.vehicleTypeMultiplier,
    };

    onSaveRoute(route, pointsWithCumulative);
    setIsDrawing(false);
    setTempPoints([]);
    toast.success('Rute baru berhasil disimpan');
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map centered on Medan, Indonesia
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([3.5952, 98.6722], 12);

    // Add tile layer
    L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19
    }).addTo(map);

    mapInstance.current = map;

    // Add click handler for creating points
    map.on('click', handleMapClick);

    // Add global functions for popup buttons
    (window as any).editPoint = (pointId: string) => {
      const point = routePoints.find(p => p.id === pointId);
      if (point) {
        editPoint(point);
      }
    };

    (window as any).deletePoint = (pointId: string) => {
      if (confirm('Apakah Anda yakin ingin menghapus titik ini?')) {
        onDeletePoint(pointId);
      }
    };

    // Update cursor based on drawing mode
    const updateCursor = () => {
      if (mapRef.current) {
        mapRef.current.style.cursor = isDrawing ? 'crosshair' : 'grab';
      }
    };

    updateCursor();

    return () => {
      map.remove();
      mapInstance.current = null;
      // Clean up global functions
      delete (window as any).editPoint;
      delete (window as any).deletePoint;
    };
  }, [handleMapClick, isDrawing, routePoints, editPoint, onDeletePoint]);

  return (
    <div className="space-y-4 relative">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5" />
            Editor Peta Rute Interaktif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={startNewRoute}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              🆕 Rute Baru
            </Button>

            <Select value={selectedRoute?.id || ''} onValueChange={(value) => {
              const route = routes.find(r => r.id === value);
              if (route) loadRouteOnMap(route);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="📋 Pilih rute untuk edit" />
              </SelectTrigger>
              <SelectContent>
                {routes.map(route => (
                  <SelectItem key={route.id} value={route.id}>
                    🛣️ {route.name} ({route.rayon})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedRoute && (
              <>
                <Button
                  variant={isDrawing ? "default" : "outline"}
                  onClick={() => setIsDrawing(!isDrawing)}
                  className={`flex items-center gap-2 ${isDrawing ? 'bg-orange-500 hover:bg-orange-600 animate-pulse' : ''}`}
                >
                  {isDrawing ? '⏹️' : '🎯'} {isDrawing ? 'Stop Drawing' : 'Tambah Titik'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => editRoute(selectedRoute)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  ✏️ Edit Rute
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm(`Hapus rute "${selectedRoute.name}"?`)) {
                      onDeleteRoute(selectedRoute.id);
                      setSelectedRoute(null);
                    }
                  }}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  🗑️ Hapus Rute
                </Button>
              </>
            )}
          </div>

          {isDrawing && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                Mode menggambar aktif. Klik pada peta untuk menambahkan titik rute.
                Titik akan ditampilkan dengan ikon orange berkedip.
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">📖</span> Legenda Ikon
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-lg">🏁</span>
                <span>Titik Awal</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">📍</span>
                <span>Titik Tengah</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">🎯</span>
                <span>Titik Akhir</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg animate-pulse">➕</span>
                <span>Titik Sementara</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-lg">
            <div 
              ref={mapRef} 
              className="h-96 w-full" 
              style={{ position: 'relative', zIndex: 1 }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Route Info */}
      {selectedRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedRoute.name}</span>
              <Badge variant="outline">Rayon {selectedRoute.rayon}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Asal</Label>
                <p className="font-medium">{selectedRoute.origin}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Tujuan</Label>
                <p className="font-medium">{selectedRoute.destination}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Jarak</Label>
                <p className="font-medium">{selectedRoute.distanceKm.toFixed(1)} km</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Harga</Label>
                <p className="font-medium">Rp {selectedRoute.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-muted-foreground flex items-center gap-2">
                <span className="text-lg">📍</span>
                Titik-titik Rute ({routePoints.filter(p => p.routeId === selectedRoute.id).length})
              </Label>
              <div className="mt-2 space-y-2">
                {routePoints
                  .filter(p => p.routeId === selectedRoute.id)
                  .sort((a, b) => a.order - b.order)
                  .map(point => {
                    const isFirst = point.order === 1;
                    const isLast = point.order === routePoints.filter(p => p.routeId === selectedRoute.id).length;
                    const icon = isFirst ? '🏁' : isLast ? '🎯' : '📍';

                    return (
                      <div key={point.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-lg">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">
                                {point.code} - {point.name}
                              </p>
                              {editingPoint?.id === point.id && <Badge variant="secondary" className="text-xs">✏️ Editing</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-4">
                              <span>📍 {point.lat.toFixed(6)}, {point.lng.toFixed(6)}</span>
                              {point.distanceFromPrevious > 0 && <span>📏 +{(point.distanceFromPrevious / 1000).toFixed(1)} km</span>}
                              <span>💰 Rp {point.price.toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editPoint(point)}
                            className="flex items-center gap-1"
                          >
                            <Pencil className="h-3 w-3" />
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Hapus titik "${point.name}"?`)) {
                                onDeletePoint(point.id);
                              }
                            }}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            🗑️
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Route Dialog - Custom Modal */}
      {editingRoute !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingRoute ? 'Edit Rute' : 'Rute Baru'}</h3>
              <button
                onClick={() => setEditingRoute(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Nama Rute</Label>
                <Input
                  value={routeForm.name}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Medan → Kualanamu"
                />
              </div>
              <div>
                <Label>Rayon</Label>
                <Select
                  value={routeForm.rayon}
                  onValueChange={(value: Route['rayon']) => setRouteForm(prev => ({ ...prev, rayon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A - Dalam Kota</SelectItem>
                    <SelectItem value="B">B - Antarkota Dekat</SelectItem>
                    <SelectItem value="C">C - Antarkota Jauh</SelectItem>
                    <SelectItem value="D">D - Antarprovinsi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Asal</Label>
                  <Input
                    value={routeForm.origin}
                    onChange={(e) => setRouteForm(prev => ({ ...prev, origin: e.target.value }))}
                    placeholder="Kota asal"
                  />
                </div>
                <div>
                  <Label>Tujuan</Label>
                  <Input
                    value={routeForm.destination}
                    onChange={(e) => setRouteForm(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="Kota tujuan"
                  />
                </div>
              </div>
              <div>
                <Label>Harga per Meter (Rp)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={routeForm.pricePerMeter}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, pricePerMeter: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingRoute(null)}>
                Batal
              </Button>
              <Button onClick={editingRoute ? () => {
                if (editingRoute) {
                  const updatedRoute: Route = {
                    ...editingRoute,
                    name: routeForm.name,
                    rayon: routeForm.rayon,
                    origin: routeForm.origin,
                    destination: routeForm.destination,
                    pricePerMeter: routeForm.pricePerMeter,
                    roadConditionMultiplier: routeForm.roadConditionMultiplier,
                    vehicleTypeMultiplier: routeForm.vehicleTypeMultiplier,
                  };
                  onUpdateRoute(editingRoute.id, updatedRoute, routePoints.filter(p => p.routeId === editingRoute.id));
                  setEditingRoute(null);
                }
              } : saveNewRoute}>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Point Dialog - Custom Modal */}
      {editingPoint !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Titik Jemput</h3>
              <button
                onClick={() => setEditingPoint(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Kode</Label>
                  <Input
                    value={pointForm.code}
                    onChange={(e) => setPointForm(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Nama</Label>
                  <Input
                    value={pointForm.name}
                    onChange={(e) => setPointForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={pointForm.lat}
                    onChange={(e) => setPointForm(prev => ({ ...prev, lat: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={pointForm.lng}
                    onChange={(e) => setPointForm(prev => ({ ...prev, lng: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingPoint(null)}>
                Batal
              </Button>
              <Button onClick={() => {
                if (editingPoint) {
                  onUpdatePoint(editingPoint.id, { ...editingPoint, ...pointForm });
                  setEditingPoint(null);
                }
              }}>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMapEditor;