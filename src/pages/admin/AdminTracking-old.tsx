import { useEffect, useRef, useState, useMemo } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Navigation, Clock, Activity, AlertCircle, Filter, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapView from '@/components/MapView';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const AdminTracking = () => {
  const { schedules, routes, drivers, routePoints, driverLocations, trackingLogs } = useShuttle();
  const [map, setMap] = useState<L.Map | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  const markersRef = useRef<Record<string, L.Marker>>({});
  const historyLinesRef = useRef<Record<string, L.Polyline>>({});

  const activeSchedules = useMemo(() => 
    schedules.filter(s => s.driverId && (s.status === 'departed' || s.status === 'boarding')),
    [schedules]
  );

  const filteredSchedules = useMemo(() => {
    if (!searchQuery) return activeSchedules;
    return activeSchedules.filter(s => {
      const driver = drivers.find(d => d.id === s.driverId);
      const route = routes.find(r => r.id === s.routeId);
      return driver?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             route?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             s.id.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [activeSchedules, drivers, routes, searchQuery]);

  // Update markers and paths when data changes
  useEffect(() => {
    if (!map) return;

    // Manage Markers
    activeSchedules.forEach(sched => {
      const driverId = sched.driverId!;
      const location = driverLocations[driverId];
      const driver = drivers.find(d => d.id === driverId);
      const route = routes.find(r => r.id === sched.routeId);

      if (!location || !driver) return;

      const pos: [number, number] = [location.latitude, location.longitude];

      if (markersRef.current[driverId]) {
        markersRef.current[driverId].setLatLng(pos);
      } else {
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center text-xl shadow-xl border-2 border-white transition-all transform hover:scale-110">🚐</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker(pos, { icon }).addTo(map);
        marker.bindPopup(`
          <div class="p-2 min-w-[180px] space-y-2">
            <div class="flex items-center gap-2 border-b pb-2">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                ${driver.name.charAt(0)}
              </div>
              <div>
                <p class="font-black text-xs leading-none">${driver.name}</p>
                <p class="text-[9px] text-muted-foreground font-bold uppercase">${route?.name || 'Rute unknown'}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <p class="text-muted-foreground uppercase font-black tracking-tighter">Kecepatan</p>
                <p class="font-black text-primary">${location.speed?.toFixed(1) || '0'} km/h</p>
              </div>
              <div>
                <p class="text-muted-foreground uppercase font-black tracking-tighter">Akurasi</p>
                <p class="font-black text-emerald-500">${location.accuracy.toFixed(0)}m</p>
              </div>
            </div>
            <p class="text-[9px] text-muted-foreground italic">Update: ${format(new Date(location.timestamp), 'HH:mm:ss')}</p>
          </div>
        `, { className: 'modern-popup' });
        
        marker.on('click', () => setSelectedDriver(driverId));
        markersRef.current[driverId] = marker;
      }

      // Manage History Polyline
      if (showHistory) {
        const entityLogs = trackingLogs
          .filter(log => log.entityId === driverId)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        const pathPoints = entityLogs.map(log => [log.latitude, log.longitude] as [number, number]);
        
        if (historyLinesRef.current[driverId]) {
          historyLinesRef.current[driverId].setLatLngs(pathPoints);
        } else {
          const polyline = L.polyline(pathPoints, {
            color: 'hsl(221,83%,53%)',
            weight: 3,
            opacity: 0.4,
            dashArray: '5, 10'
          }).addTo(map);
          historyLinesRef.current[driverId] = polyline;
        }
      } else {
        if (historyLinesRef.current[driverId]) {
          map.removeLayer(historyLinesRef.current[driverId]);
          delete historyLinesRef.current[driverId];
        }
      }
    });

    // Remove markers for inactive drivers
    Object.keys(markersRef.current).forEach(id => {
      if (!activeSchedules.find(s => s.driverId === id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
        if (historyLinesRef.current[id]) {
          map.removeLayer(historyLinesRef.current[id]);
          delete historyLinesRef.current[id];
        }
      }
    });
  }, [map, activeSchedules, driverLocations, trackingLogs, showHistory, drivers, routes]);

  const centerOnDriver = (driverId: string) => {
    const loc = driverLocations[driverId];
    if (loc && map) {
      map.flyTo([loc.latitude, loc.longitude], 15);
      setSelectedDriver(driverId);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground">Fleet Tracking</h2>
          <p className="text-muted-foreground font-medium text-sm">Monitor armada dan lokasi driver secara real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={showHistory ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowHistory(!showHistory)}
            className="rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            <Clock className="h-3.5 w-3.5 mr-2" />
            {showHistory ? "Sembunyikan History" : "Lihat History"}
          </Button>
          <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-200 px-3 py-1 font-black uppercase tracking-widest text-[10px] animate-pulse">
            📡 LIVE: {activeSchedules.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card className="xl:col-span-3 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <CardContent className="p-0 relative h-[650px]">
            <MapView onMapReady={setMap} />
            
            {/* Search Overlay */}
            <div className="absolute top-6 left-6 z-[400] w-72">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Cari Driver / Rute..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-white/90 backdrop-blur-md border-none shadow-xl rounded-2xl font-bold focus-visible:ring-primary/20"
                />
              </div>
            </div>

            {/* Selected Driver Info Overlay */}
            {selectedDriver && driverLocations[selectedDriver] && (
              <div className="absolute bottom-6 left-6 right-6 z-[400] xl:hidden">
                <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-2xl rounded-3xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-black">
                        {drivers.find(d => d.id === selectedDriver)?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm">{drivers.find(d => d.id === selectedDriver)?.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aktivitas Terkini</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => centerOnDriver(selectedDriver)} className="rounded-xl font-black text-[10px] uppercase">
                      Focus
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground/80 px-2 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" /> Fleet List
            </h3>
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredSchedules.length === 0 ? (
                <div className="p-8 text-center bg-muted/20 rounded-[2rem] border-2 border-dashed border-border/40">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">No Active Units</p>
                </div>
              ) : (
                filteredSchedules.map(s => {
                  const driver = drivers.find(d => d.id === s.driverId);
                  const route = routes.find(r => r.id === s.routeId);
                  const location = driverLocations[s.driverId!];
                  const isSelected = selectedDriver === s.driverId;

                  return (
                    <Card
                      key={s.id}
                      className={cn(
                        "group relative overflow-hidden border-border/40 transition-all active:scale-[0.98] cursor-pointer rounded-[1.5rem] hover:shadow-lg",
                        isSelected ? "ring-2 ring-primary ring-offset-2 bg-primary/5 border-primary/20" : "bg-card hover:border-primary/30"
                      )}
                      onClick={() => centerOnDriver(s.driverId!)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all",
                              isSelected ? "bg-primary text-white" : "bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary"
                            )}>
                              {driver?.name.charAt(0)}
                            </div>
                            <div>
                              <p className={cn("font-black text-sm transition-colors", isSelected ? "text-primary" : "text-foreground")}>
                                {driver?.name}
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter leading-none">
                                {route?.name}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className={cn(
                            "rounded-full text-[9px] font-black uppercase px-2 py-0 border-none",
                            s.status === 'departed' ? "bg-indigo-500/10 text-indigo-600" : "bg-amber-500/10 text-amber-600"
                          )}>
                            {s.status}
                          </Badge>
                        </div>
                        
                        {location && (
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/40">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                                <Activity className="h-3 w-3" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase leading-none">Speed</p>
                                <p className="text-xs font-black">{location.speed?.toFixed(1) || '0'} <span className="text-[9px] opacity-60">km/h</span></p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                                <Clock className="h-3 w-3" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase leading-none">Updated</p>
                                <p className="text-xs font-black">{format(new Date(location.timestamp), 'HH:mm:ss')}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminTracking;
