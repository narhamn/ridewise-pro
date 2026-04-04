import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_LAYERS } from '../map/MapController';
import { RoutePoint, Driver } from '@/types/shuttle';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation, MapPin, Search, Star, History, Loader2, Info, Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { calculateDistanceBetweenPoints, isValidCoordinate } from '@/lib/routeUtils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomerPickupMapProps {
  selectedPointId: string;
  onPointSelect: (pointId: string) => void;
  routePoints: RoutePoint[];
}

export const CustomerPickupMap = ({ selectedPointId, onPointSelect, routePoints }: CustomerPickupMapProps) => {
  const { mapLayer, drivers, favorites, pickupHistory, addFavorite } = useShuttle();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const driverMarkersRef = useRef<L.LayerGroup | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedPoint = routePoints.find(p => p.id === selectedPointId);
  const isFavorite = favorites.some(f => f.lat === selectedPoint?.lat && f.lng === selectedPoint?.lng);

  const handleSaveFavorite = () => {
    if (!selectedPoint) return;
    addFavorite({
      name: selectedPoint.name,
      address: selectedPoint.address || 'Alamat tidak tersedia',
      lat: selectedPoint.lat,
      lng: selectedPoint.lng
    });
    toast.success(`${selectedPoint.name} ditambahkan ke favorit`);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([3.5952, 98.6722], 13);

    const layerConfig = MAP_LAYERS[mapLayer];
    L.tileLayer(layerConfig.url, {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    driverMarkersRef.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [mapLayer]);

  // Sync Markers (Route Points)
  useEffect(() => {
    if (!mapInstance.current || !markersRef.current) return;
    const markers = markersRef.current;
    markers.clearLayers();

    routePoints.forEach(p => {
      const isSelected = p.id === selectedPointId;
      const icon = L.divIcon({
        className: 'custom-pickup-icon',
        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all ${
          isSelected ? 'bg-primary scale-125 z-[1000]' : 'bg-slate-500'
        }">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="white" stroke-width="3" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([p.lat, p.lng], { icon });
      marker.on('click', () => onPointSelect(p.id));
      marker.bindTooltip(p.name, { direction: 'top', offset: [0, -32] });
      markers.addLayer(marker);

      if (isSelected) {
        mapInstance.current?.panTo([p.lat, p.lng]);
      }
    });
  }, [routePoints, selectedPointId, onPointSelect]);

  // Sync Driver Markers (Real-time simulation)
  useEffect(() => {
    if (!mapInstance.current || !driverMarkersRef.current) return;
    const driverMarkers = driverMarkersRef.current;
    driverMarkers.clearLayers();

    drivers.filter(d => d.status === 'active').forEach(d => {
      // Simulate random location near center for demo
      const lat = 3.5952 + (Math.random() - 0.5) * 0.05;
      const lng = 98.6722 + (Math.random() - 0.5) * 0.05;

      const icon = L.divIcon({
        className: 'driver-icon',
        html: `<div class="p-1 bg-white rounded-full shadow-md border border-slate-200">
          <div class="bg-blue-500 p-1 rounded-full animate-pulse">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="white" fill="white"><path d="M18.5 2.5a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5h13zM6 16v1h12v-1H6z"></path></svg>
          </div>
        </div>`,
        iconSize: [24, 24],
      });

      L.marker([lat, lng], { icon }).addTo(driverMarkers);
    });
  }, [drivers]);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation tidak didukung browser Anda');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setIsLocating(false);
        
        if (mapInstance.current) {
          mapInstance.current.flyTo([latitude, longitude], 15);
          
          // Show accuracy circle
          L.circle([latitude, longitude], {
            radius: pos.coords.accuracy,
            color: 'hsl(221,83%,53%)',
            fillColor: 'hsl(221,83%,53%)',
            fillOpacity: 0.1
          }).addTo(mapInstance.current);

          // Find nearest point
          let nearest = routePoints[0];
          let minDist = Infinity;
          routePoints.forEach(p => {
            const dist = calculateDistanceBetweenPoints(latitude, longitude, p.lat, p.lng);
            if (dist < minDist) {
              minDist = dist;
              nearest = p;
            }
          });

          if (minDist < 5000) { // 5km radius limit
            toast.info(`Titik jemput terdekat: ${nearest.name} (${(minDist/1000).toFixed(1)} km)`);
            onPointSelect(nearest.id);
          } else {
            toast.warning('Anda berada di luar jangkauan layanan operasional (maks 5km)');
          }
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error('Gagal mendapatkan lokasi GPS');
      }
    );
  };

  return (
    <Card className="overflow-hidden border-none shadow-none bg-transparent">
      <CardContent className="p-0 relative">
        <div ref={mapRef} className="h-[300px] w-full rounded-xl" />
        
        {/* Map Controls */}
        <div className="absolute top-4 left-4 right-4 z-[1000] space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari lokasi..." 
                className="pl-9 bg-white/90 backdrop-blur shadow-md border-none h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              size="icon" 
              className="bg-white hover:bg-slate-50 text-primary shadow-md shrink-0"
              onClick={handleLocateUser}
              disabled={isLocating}
            >
              {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur text-[10px] h-7 shadow-sm shrink-0 gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> Favorit
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <h4 className="text-xs font-bold mb-2 px-1">Lokasi Favorit</h4>
                <ScrollArea className="h-40">
                  {favorites.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground p-2 italic text-center">Belum ada favorit</p>
                  ) : (
                    <div className="space-y-1">
                      {favorites.map(fav => (
                        <button
                          key={fav.id}
                          className="w-full text-left p-2 hover:bg-slate-50 rounded-md flex items-center justify-between group"
                          onClick={() => {
                            const point = routePoints.find(p => p.lat === fav.lat && p.lng === fav.lng);
                            if (point) onPointSelect(point.id);
                          }}
                        >
                          <div>
                            <p className="text-[10px] font-bold">{fav.name}</p>
                            <p className="text-[8px] text-muted-foreground truncate w-40">{fav.address}</p>
                          </div>
                          <Check className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur text-[10px] h-7 shadow-sm shrink-0 gap-1">
                  <History className="h-3 w-3 text-blue-500" /> Riwayat
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <h4 className="text-xs font-bold mb-2 px-1">Riwayat Titik Jemput</h4>
                <ScrollArea className="h-40">
                  {pickupHistory.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground p-2 italic text-center">Belum ada riwayat</p>
                  ) : (
                    <div className="space-y-1">
                      {pickupHistory.map(hist => (
                        <button
                          key={hist.id}
                          className="w-full text-left p-2 hover:bg-slate-50 rounded-md flex items-center justify-between group"
                          onClick={() => onPointSelect(hist.pointId)}
                        >
                          <div>
                            <p className="text-[10px] font-bold">{hist.pointName}</p>
                            <p className="text-[8px] text-muted-foreground">
                              {new Date(hist.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                          <Check className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Badge className="bg-success/90 backdrop-blur text-[10px] h-7 shadow-sm shrink-0 flex items-center gap-1 border-none">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> 12 Driver Aktif
            </Badge>
          </div>
        </div>

        {/* Selected Point Actions */}
        {selectedPoint && (
          <div className="absolute bottom-12 left-4 right-4 z-[1000]">
            <Card className="bg-white/95 backdrop-blur shadow-lg border-none ring-1 ring-black/5 p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <MapPin className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold">{selectedPoint.name}</p>
                    <p className="text-[8px] text-muted-foreground">Titik penjemputan terpilih</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={isFavorite ? "secondary" : "outline"} 
                  className={`h-7 px-2 gap-1 text-[9px] ${isFavorite ? 'text-yellow-600' : ''}`}
                  onClick={handleSaveFavorite}
                  disabled={isFavorite}
                >
                  {isFavorite ? <Check className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                  {isFavorite ? "Favorit" : "Simpan Favorit"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Info Legend */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded flex items-center gap-2">
            <Info className="h-3 w-3" />
            Pilih ikon pin hijau untuk lokasi jemput
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
