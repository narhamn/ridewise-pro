import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Navigation, Clock, Activity, AlertCircle, Filter, MapPin, Wifi, WifiOff, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import RealTimeMap from '@/components/RealTimeMap';
import MapLegend from '@/components/MapLegend';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import { RouteInfoPanel, ETADisplay, RouteTrackingHookResult } from '@/components/RouteTrackingDisplay';
import { DriverLocation } from '@/types/shuttle';
import { toast } from 'sonner';

const AdminTracking = () => {
  const { schedules, routes, drivers, routePoints } = useShuttle();
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  const [routeTracking, setRouteTracking] = useState<RouteTrackingHookResult | null>(null);

  // Memoize callbacks to prevent infinite re-initialization
  const handleLocationUpdate = useCallback((location: DriverLocation) => {
    // Optional: Handle individual location updates
    console.log('Location update:', location);
  }, []);

  const handleScheduleUpdate = useCallback(() => {
    // Handle schedule updates if needed
  }, []);

  const handleDriverStatusChange = useCallback(() => {
    // Handle driver status changes if needed
  }, []);

  // Use real-time tracking hook
  const {
    driverLocations: rtDriverLocations,
    trackingLogs: rtTrackingLogs,
    activeSchedules: rtActiveSchedules,
    isConnected,
    connectionType,
    sendLocationUpdate,
    sendDriverStatusChange
  } = useRealTimeTracking({
    config: {
      updateInterval: 2000, // Faster updates for admin view
      enableWebSocket: false, // Use polling for now
      enableGeofencing: true,
      enableHistoryTracking: true,
      maxHistoryPoints: 200
    },
    onLocationUpdate: handleLocationUpdate,
    onScheduleUpdate: handleScheduleUpdate,
    onDriverStatusChange: handleDriverStatusChange
  });

  // Combine context data with real-time data
  const driverLocations = { ...rtDriverLocations };
  const trackingLogs = rtTrackingLogs;
  const fallbackSchedules = useMemo(() =>
    schedules.filter(s => s.driverId && (s.status === 'departed' || s.status === 'boarding')),
    [schedules]
  );
  const activeSchedules = rtActiveSchedules.length > 0 ? rtActiveSchedules : fallbackSchedules;

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

  const centerOnDriver = (driverId: string) => {
    const loc = driverLocations[driverId];
    if (loc) {
      // The RealTimeMap component will handle centering
      setSelectedDriver(driverId);
      
      // Also select the schedule for this driver to show route tracking
      const schedule = activeSchedules.find(s => s.driverId === driverId);
      if (schedule) {
        setSelectedScheduleId(schedule.id);
      }
      
      toast.info(`Focusing on ${drivers.find(d => d.id === driverId)?.name}`);
    }
  };

  const handleDriverClick = (driverId: string) => {
    setSelectedDriver(driverId);
    
    // Also select the schedule for this driver to show route tracking
    const schedule = activeSchedules.find(s => s.driverId === driverId);
    if (schedule) {
      setSelectedScheduleId(schedule.id);
    }
    
    const driver = drivers.find(d => d.id === driverId);
    toast.info(`Selected driver: ${driver?.name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground">Fleet Tracking</h2>
          <p className="text-muted-foreground font-medium text-sm">Monitor armada dan lokasi driver secara real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <Badge variant="outline" className={cn(
            "rounded-full px-3 py-1 font-black uppercase tracking-widest text-[10px]",
            isConnected ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-red-500/10 text-red-600 border-red-200"
          )}>
            {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {connectionType.toUpperCase()}
          </Badge>

          <Button
            variant={showGeofences ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGeofences(!showGeofences)}
            className="rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            <MapPin className="h-3.5 w-3.5 mr-2" />
            Geofence
          </Button>

          <Button
            variant={showTraffic ? "default" : "outline"}
            size="sm"
            onClick={() => setShowTraffic(!showTraffic)}
            className="rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            <Navigation className="h-3.5 w-3.5 mr-2" />
            Traffic
          </Button>

          <Button
            variant={showHistory ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            <Clock className="h-3.5 w-3.5 mr-2" />
            History
          </Button>

          <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-200 px-3 py-1 font-black uppercase tracking-widest text-[10px] animate-pulse">
            📡 LIVE: {activeSchedules.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card className="xl:col-span-3 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <CardContent className="p-0 relative h-[650px]">
            <RealTimeMap
              center={[3.5952, 98.6722]}
              zoom={13}
              className="w-full h-full"
              showTraffic={showTraffic}
              showGeofences={showGeofences}
              driverLocations={driverLocations}
              activeSchedules={activeSchedules}
              drivers={drivers}
              routes={routes}
              routePoints={routePoints}
              trackingLogs={trackingLogs}
              onDriverClick={handleDriverClick}
              enableClustering={true}
              showHistory={showHistory}
              updateInterval={2000}
              selectedDriverId={selectedDriver}
              showRouteTracking={true}
              selectedScheduleId={selectedScheduleId}
              onRouteInfoChange={setRouteTracking}
            />

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

            {/* Connection Status Overlay */}
            {!isConnected && (
              <div className="absolute top-6 right-6 z-[400]">
                <Badge variant="destructive" className="rounded-full px-3 py-1 font-black text-xs animate-pulse">
                  <WifiOff className="h-3 w-3 mr-2" />
                  DISCONNECTED
                </Badge>
              </div>
            )}

            {/* Map Legend */}
            <MapLegend variant="compact" position="bottom-right" />
          </CardContent>
        </Card>

        {/* Fleet List Sidebar */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <CardContent className="p-4">
            <div className="space-y-4">
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
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTracking;