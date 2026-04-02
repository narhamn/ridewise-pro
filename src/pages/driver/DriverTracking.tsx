import { useEffect, useRef, useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DriverTracking = () => {
  const { schedules, routes, routePoints, currentUser } = useShuttle();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const markerRef = useRef<L.Marker | null>(null);

  const activeSchedule = schedules.find(s => s.driverId === currentUser?.id && (s.status === 'departed' || s.status === 'boarding' || s.status === 'scheduled'));
  const route = routes.find(r => r.id === activeSchedule?.routeId);
  const points = routePoints.filter(p => p.routeId === activeSchedule?.routeId).sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const center = points.length > 0 ? [points[0].lat, points[0].lng] as [number, number] : [3.5952, 98.6722] as [number, number];

    const map = L.map(mapRef.current).setView(center, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Draw route line
    if (points.length > 1) {
      const latlngs = points.map(p => [p.lat, p.lng] as [number, number]);
      L.polyline(latlngs, { color: 'hsl(221,83%,53%)', weight: 4, opacity: 0.7 }).addTo(map);
    }

    // Add point markers
    points.forEach(p => {
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background:hsl(160,84%,39%);color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);">${p.code.replace('J','')}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(`<strong>${p.code}</strong>: ${p.name}`);
    });

    // Driver marker
    if (points.length > 0) {
      const driverIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background:hsl(221,83%,53%);color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:3px solid white;">🚐</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      markerRef.current = L.marker([points[0].lat, points[0].lng], { icon: driverIcon }).addTo(map);
    }

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, [points]);

  // Simulate movement
  useEffect(() => {
    if (!isTracking || !markerRef.current || points.length < 2) return;
    const interval = setInterval(() => {
      setCurrentPointIndex(prev => {
        const next = prev >= points.length - 1 ? 0 : prev + 1;
        const p = points[next];
        markerRef.current?.setLatLng([p.lat, p.lng]);
        mapInstance.current?.panTo([p.lat, p.lng]);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isTracking, points]);

  return (
    <div className="p-4 space-y-4">
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Navigation className="h-5 w-5" /> GPS Tracking
              </h2>
              {route && <p className="text-sm opacity-80">{route.name}</p>}
            </div>
            <Badge className={isTracking ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
              {isTracking ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div ref={mapRef} className="h-[350px] rounded-lg" />
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        variant={isTracking ? 'destructive' : 'default'}
        onClick={() => setIsTracking(!isTracking)}
      >
        <MapPin className="h-4 w-4 mr-2" />
        {isTracking ? 'Berhenti Tracking' : 'Mulai Tracking'}
      </Button>

      {/* Route points list */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-sm mb-2">Titik Penjemputan</h3>
          {points.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-3 p-2 rounded-lg ${i === currentPointIndex && isTracking ? 'bg-primary/10 border border-primary' : 'bg-muted'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentPointIndex && isTracking ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                {p.code.replace('J', '')}
              </div>
              <span className="text-sm">{p.name}</span>
              {i === currentPointIndex && isTracking && <Badge className="ml-auto text-[10px]">Saat ini</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverTracking;
