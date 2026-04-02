import { useEffect, useRef, useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AdminTracking = () => {
  const { schedules, routes, drivers, routePoints } = useShuttle();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const activeSchedules = schedules.filter(s => s.driverId && (s.status === 'departed' || s.status === 'boarding'));

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([3.5952, 98.6722], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear existing markers
    map.eachLayer(l => { if (l instanceof L.Marker) map.removeLayer(l); });

    activeSchedules.forEach(sched => {
      const driver = drivers.find(d => d.id === sched.driverId);
      const route = routes.find(r => r.id === sched.routeId);
      const points = routePoints.filter(p => p.routeId === sched.routeId).sort((a, b) => a.order - b.order);

      if (!driver || !route || points.length === 0) return;

      // Simulate driver position between first and second point
      const p1 = points[0];
      const p2 = points.length > 1 ? points[1] : points[0];
      const progress = Math.random() * 0.7 + 0.15;
      const lat = p1.lat + (p2.lat - p1.lat) * progress;
      const lng = p1.lng + (p2.lng - p1.lng) * progress;

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background:hsl(221,83%,53%);color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">🚐</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="min-width:150px">
          <strong>${driver.name}</strong><br/>
          <small>${route.name}</small><br/>
          <small>Status: ${sched.status}</small>
        </div>
      `);

      marker.on('click', () => setSelectedDriver(driver.id));
    });

    // Also add route point markers
    routePoints.forEach(p => {
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background:hsl(160,84%,39%);color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;border:2px solid white;">${p.code.replace('J','')}</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(`<strong>${p.code}</strong>: ${p.name}`);
    });
  }, [activeSchedules, drivers, routes, routePoints]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">GPS Tracking</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div ref={mapRef} className="h-[500px] rounded-lg" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Driver Aktif ({activeSchedules.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeSchedules.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada driver aktif</p>
              ) : (
                activeSchedules.map(s => {
                  const driver = drivers.find(d => d.id === s.driverId);
                  const route = routes.find(r => r.id === s.routeId);
                  return (
                    <div
                      key={s.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${selectedDriver === s.driverId ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                      onClick={() => setSelectedDriver(s.driverId)}
                    >
                      <p className="font-medium text-sm">{driver?.name}</p>
                      <p className="text-xs text-muted-foreground">{route?.name}</p>
                      <Badge className="mt-1 text-[10px]" variant={s.status === 'departed' ? 'default' : 'secondary'}>
                        {s.status}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminTracking;
