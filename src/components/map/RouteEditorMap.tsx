import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapController, MAP_LAYERS } from './MapController';
import { Route, RoutePoint } from '@/types/shuttle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Move, Save, Navigation, Loader2, Maximize, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';
import { calculateDistanceBetweenPoints, calculateTotalRouteDistance, isValidCoordinate } from '@/lib/routeUtils';
import { Badge } from '@/components/ui/badge';

interface RouteEditorMapProps {
  route: Route | null;
  onPointsChange?: (points: RoutePoint[], distance: number) => void;
}

const RouteEditorMap = ({ route, onPointsChange }: RouteEditorMapProps) => {
  const { routePoints, mapLayer, schedules, drivers, vehicles, systemConfig } = useShuttle();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const vehicleMarkersRef = useRef<L.LayerGroup | null>(null);
  const isMounted = useRef(true);

  const [localPoints, setLocalPoints] = useState<RoutePoint[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to calculate price based on distance to the end of the route
  const calculatePriceForPoint = useCallback((idx: number, allPoints: { lat: number; lng: number }[]) => {
    if (idx >= allPoints.length - 1) return 0;
    
    // Distance from current point to the last point (destination)
    let distanceToDestination = 0;
    for (let i = idx; i < allPoints.length - 1; i++) {
      distanceToDestination += calculateDistanceBetweenPoints(
        allPoints[i].lat,
        allPoints[i].lng,
        allPoints[i + 1].lat,
        allPoints[i + 1].lng
      );
    }
    
    return Math.round((distanceToDestination / 1000) * systemConfig.basePricePerKm);
  }, [systemConfig.basePricePerKm]);

  // Set isMounted to true on mount and false on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize map with cleanup to prevent memory leaks
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Safety check: if there's already an instance, remove it before re-initializing
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    try {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([3.5952, 98.6722], 11);

      const layerConfig = MAP_LAYERS[mapLayer];
      const tileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstance.current = map;

      // Layer groups for better performance and easier cleanup
      markersRef.current = L.layerGroup().addTo(map);
      vehicleMarkersRef.current = L.layerGroup().addTo(map);

      const onMapClick = (e: L.LeafletMouseEvent) => {
        if (!route) return;
        const { lat, lng } = e.latlng;
        
        if (!isValidCoordinate(lat, lng)) {
          toast.error('Koordinat di luar jangkauan operasional!');
          return;
        }

        setLocalPoints(prev => {
          const newPoint: RoutePoint = {
            id: `p${Date.now()}`,
            routeId: route.id,
            code: `P${prev.length + 1}`,
            name: `Titik ${prev.length + 1}`,
            order: prev.length + 1,
            lat,
            lng,
            price: 0 // Will be calculated when saved or manually updated
          };
          return [...prev, newPoint];
        });
      };

      map.on('click', onMapClick);

      // Force refresh on resize
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapRef.current);

      return () => {
        map.off('click', onMapClick);
        resizeObserver.disconnect();
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      };
    } catch (err) {
      console.error('Map initialization error:', err);
      // Don't show toast for "Map container is already initialized" if we can't avoid it
      if (!(err instanceof Error && err.message.includes('already initialized'))) {
        toast.error('Gagal menginisialisasi peta');
      }
    }
  }, [route, calculatePriceForPoint]); // Re-init only when route base context changes significantly

  // Optimized Tile Layer switching
  useEffect(() => {
    if (!mapInstance.current || !tileLayerRef.current) return;
    const layerConfig = MAP_LAYERS[mapLayer];
    tileLayerRef.current.setUrl(layerConfig.url);
    tileLayerRef.current.options.attribution = layerConfig.attribution;
  }, [mapLayer]);

  // Sync points when route changes
  useEffect(() => {
    if (route) {
      const existing = routePoints.filter(p => p.routeId === route.id).sort((a, b) => a.order - b.order);
      setLocalPoints(existing);
    } else {
      setLocalPoints([]);
    }
  }, [route, routePoints]);

  // Handle point deletion via custom event
  const handleDeletePoint = useCallback((id: string) => {
    setLocalPoints(prev => prev.filter(p => p.id !== id).map((p, i) => ({ ...p, order: i + 1 })));
  }, []);

  useEffect(() => {
    const handler = (e: any) => handleDeletePoint(e.detail);
    window.addEventListener('delete-route-point', handler);
    return () => window.removeEventListener('delete-route-point', handler);
  }, [handleDeletePoint]);

  // Rendering Polyline and Markers (Optimized for performance)
  useEffect(() => {
    if (!mapInstance.current || !markersRef.current) return;
    const map = mapInstance.current;
    const markers = markersRef.current;

    markers.clearLayers();
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    const coords: L.LatLngExpression[] = [];
    localPoints.forEach((p, idx) => {
      coords.push([p.lat, p.lng]);
      
      const icon = L.divIcon({
        className: 'custom-point-icon',
        html: `<div style="background:hsl(160,84%,39%);color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);cursor:grab;">${idx + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([p.lat, p.lng], { icon, draggable: true });
      
      marker.on('dragend', (e: L.LeafletEvent) => {
        const { lat, lng } = (e.target as L.Marker).getLatLng();
        setLocalPoints(prev => prev.map(pt => pt.id === p.id ? { ...pt, lat, lng } : pt));
      });

      marker.bindPopup(() => {
        const div = document.createElement('div');
        div.className = 'p-2 space-y-2';
        div.innerHTML = `
          <p class="font-bold text-sm">${p.name}</p>
          <button class="text-xs text-destructive hover:underline flex items-center gap-1" id="btn-del-${p.id}">
            Hapus Titik
          </button>
        `;
        div.querySelector(`#btn-del-${p.id}`)?.addEventListener('click', () => {
          window.dispatchEvent(new CustomEvent('delete-route-point', { detail: p.id }));
        });
        return div;
      });

      markers.addLayer(marker);
    });

    if (coords.length > 1) {
      polylineRef.current = L.polyline(coords, { 
        color: 'hsl(221,83%,53%)', 
        weight: 4, 
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(map);
    }
  }, [localPoints]);

  // Auto-calculated distance
  const currentTotalDistance = useMemo(() => calculateTotalRouteDistance(localPoints), [localPoints]);

  const handleSavePoints = () => {
    if (!route) return;
    setIsSaving(true);
    
    // Auto-calculate prices for points that don't have one (optional business logic)
    const pointsWithPrices = localPoints.map((p, idx) => ({
      ...p,
      price: p.price || calculatePriceForPoint(idx, localPoints)
    }));

    // Simulate API delay
    setTimeout(() => {
      if (!isMounted.current) return;
      
      onPointsChange?.(pointsWithPrices, currentTotalDistance);
      setIsSaving(false);
      toast.success(`Rute berhasil disimpan. Total jarak: ${(currentTotalDistance/1000).toFixed(2)} km`);
    }, 800);
  };

  const centerMap = () => {
    if (mapInstance.current && polylineRef.current && localPoints.length > 1) {
      mapInstance.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-xl border shadow-lg bg-card">
      <div className="p-2 bg-muted/30 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <MapIcon className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest">Visualisasi Jalur Rute</span>
        </div>
        {route && (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
            {route.name}
          </Badge>
        )}
      </div>
      <div className="relative">
        <div ref={mapRef} className="h-[500px] w-full z-0" />
        <MapController />
        
        {!route && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <Card className="p-6 text-center space-y-3 max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300 border-none ring-1 ring-black/5">
              <Navigation className="h-12 w-12 mx-auto text-primary opacity-40" />
              <h3 className="font-bold text-xl tracking-tight">Pilih Rute</h3>
              <p className="text-sm text-muted-foreground">Silakan pilih rute dari tabel di bawah untuk melihat atau mengedit koordinat pada peta.</p>
            </Card>
          </div>
        )}

        {route && (
          <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col md:flex-row items-end md:items-center justify-between gap-4 pointer-events-none">
            <Card className="bg-white/95 backdrop-blur shadow-xl border-none pointer-events-auto w-full md:w-auto ring-1 ring-black/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-8">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-[10px] uppercase font-bold">Edit Mode</Badge>
                      <p className="font-bold text-sm truncate max-w-[150px]">{route.name}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Maximize className="h-3 w-3" /> Total Jarak: <span className="font-bold text-primary">{(currentTotalDistance/1000).toFixed(2)} km</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{localPoints.length} Titik</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={centerMap} title="Fit Bounds">
                      <Maximize className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground italic leading-tight">
                    Klik peta untuk titik baru. Drag nomor untuk memindahkannya.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 h-9 text-xs font-bold shadow-md" 
                      onClick={handleSavePoints}
                      disabled={isSaving || localPoints.length === 0}
                    >
                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Save className="h-3 w-3 mr-2" />}
                      Simpan Rute
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-3 text-destructive hover:bg-destructive/10 border-destructive/20" 
                      onClick={() => setLocalPoints([])}
                      title="Hapus Semua Titik"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteEditorMap;
