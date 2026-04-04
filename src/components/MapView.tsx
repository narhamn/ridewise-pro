import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { OSM_ATTRIBUTION, OSM_TILE_URL } from '@/lib/map-tiles';

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMapReady?: (map: L.Map) => void;
}

const MapView = ({ 
  center = [3.5952, 98.6722], 
  zoom = 13, 
  className, 
  onMapReady 
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [centerLat, centerLng] = center;

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([centerLat, centerLng], zoom);

    L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstance.current = map;

    if (onMapReady) {
      onMapReady(map);
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.setView([centerLat, centerLng], zoom);
  }, [centerLat, centerLng, zoom]);

  return (
    <div 
      ref={mapRef} 
      className={cn("w-full h-full bg-slate-100 relative z-0", className)} 
    />
  );
};

export default MapView;
