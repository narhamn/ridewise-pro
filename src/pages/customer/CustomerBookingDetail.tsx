import { useParams, useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, MapPin, Clock, Navigation, Signal, Info, Wifi, WifiOff } from 'lucide-react';
import { formatPrice } from '@/lib/pricing';
import { ETicket } from '@/components/ETicket';
import RealTimeMap from '@/components/RealTimeMap';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import { DriverLocation } from '@/types/shuttle';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CustomerBookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings, schedules, routes, routePoints, drivers } = useShuttle();

  const booking = bookings.find(b => b.id === bookingId);
  const schedule = schedules.find(s => s.id === booking?.scheduleId);
  const route = routes.find(r => r.id === booking?.routeId);
  const points = routePoints.filter(p => p.routeId === booking?.routeId).sort((a, b) => a.order - b.order);

  // Use real-time tracking hook
  const {
    driverLocations: rtDriverLocations,
    trackingLogs: rtTrackingLogs,
    activeSchedules: rtActiveSchedules,
    isConnected,
    connectionType
  } = useRealTimeTracking({
    config: {
      updateInterval: 3000, // Customer view can be slightly slower
      enableWebSocket: false,
      enableGeofencing: false, // Not needed for customer view
      enableHistoryTracking: false, // Not needed for customer view
      maxHistoryPoints: 50
    },
    autoInitialize: schedule?.status === 'departed' || schedule?.status === 'boarding'
  });

  const isTrackingAvailable = schedule && (schedule.status === 'departed' || schedule.status === 'boarding');
  const driverLocation = schedule?.driverId ? rtDriverLocations[schedule.driverId] : null;

  // Prepare data for RealTimeMap
  const driverLocations = driverLocation ? { [schedule!.driverId!]: driverLocation } : {};
  const activeSchedules = schedule ? [schedule] : [];
  const trackingLogs = rtTrackingLogs.filter(log => log.entityId === schedule?.driverId);

  if (!booking) return <div className="p-4">Booking tidak ditemukan</div>;

  const statusColor = {
    confirmed: 'bg-success text-success-foreground',
    completed: 'bg-muted text-muted-foreground',
    cancelled: 'bg-destructive text-destructive-foreground',
  };

  const statusLabel = {
    confirmed: 'Dikonfirmasi',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  return (
    <div className="p-5 space-y-6 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customer')} className="rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-black tracking-tight">Detail Tiket</h2>
      </div>

      <div className="text-center py-6 space-y-4">
        <div className="relative inline-block">
          <CheckCircle className="h-20 w-20 text-success mx-auto" />
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg">
            <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center">
              <Signal className="h-3 w-3 text-success" />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black tracking-tighter">Pemesanan Berhasil</h3>
          <p className="text-sm text-muted-foreground font-medium">ID: {booking.id}</p>
        </div>
        <Badge className={cn("rounded-full px-4 py-1 font-black uppercase tracking-widest text-[10px]", statusColor[booking.status])}>
          {statusLabel[booking.status]}
        </Badge>
      </div>

      {/* Real-time Tracking Section */}
      {isTrackingAvailable ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground/80">Lacak Shuttle</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn(
                "rounded-full px-3 py-1 font-black uppercase tracking-widest text-[10px]",
                isConnected ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-red-500/10 text-red-600 border-red-200"
              )}>
                {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {connectionType.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 animate-pulse font-black text-[10px] uppercase">
                📡 LIVE Tracking
              </Badge>
            </div>
          </div>
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <CardContent className="p-0 relative">
              <div className="h-[300px] w-full">
                <RealTimeMap
                  center={[3.5952, 98.6722]}
                  zoom={15}
                  className="w-full h-full"
                  showTraffic={false}
                  showGeofences={false}
                  driverLocations={driverLocations}
                  activeSchedules={activeSchedules}
                  drivers={drivers}
                  routes={routes}
                  routePoints={routePoints}
                  trackingLogs={trackingLogs}
                  enableClustering={false}
                  showHistory={false}
                  updateInterval={3000}
                />
              </div>
              <div className="absolute bottom-4 left-4 right-4 z-[400]">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Navigation className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Posisi Terkini</p>
                    <p className="font-black text-sm text-slate-800 leading-none">
                      {driverLocation ? 'Shuttle sedang menuju lokasi Anda' : 'Menunggu update posisi...'}
                    </p>
                    {driverLocation && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Kecepatan: {driverLocation.speed?.toFixed(1) || '0'} km/h •
                        Akurasi: {driverLocation.accuracy?.toFixed(0) || 'N/A'}m
                      </p>
                    )}
                  </div>
                  {driverLocation && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl font-black text-[10px] uppercase"
                      onClick={() => toast.info('Fokus pada shuttle')}
                    >
                      Focus
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <div className="bg-muted/30 rounded-[2rem] p-6 border border-dashed border-border/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/40">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Tracking Belum Tersedia</p>
            <p className="text-[10px] text-muted-foreground/60 font-medium">Tracking aktif saat shuttle sudah berangkat.</p>
          </div>
        </div>
      )}

      {/* E-Ticket */}
      <ETicket booking={booking} />

      {/* Print button */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm" onClick={() => window.print()}>
          📥 Simpan Tiket
        </Button>
      </div>
    </div>
  );
};

export default CustomerBookingDetail;