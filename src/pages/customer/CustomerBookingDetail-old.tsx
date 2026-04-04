import { useParams, useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, MapPin, Clock, Navigation, Signal, Info } from 'lucide-react';
import { formatPrice } from '@/lib/pricing';
import { ETicket } from '@/components/ETicket';
import MapView from '@/components/MapView';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { cn } from '@/lib/utils';

const CustomerBookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings, schedules, routes, routePoints, driverLocations } = useShuttle();
  const [map, setMap] = useState<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  const booking = bookings.find(b => b.id === bookingId);
  const schedule = schedules.find(s => s.id === booking?.scheduleId);
  const route = routes.find(r => r.id === booking?.routeId);
  const points = routePoints.filter(p => p.routeId === booking?.routeId).sort((a, b) => a.order - b.order);
  
  const isTrackingAvailable = schedule && (schedule.status === 'departed' || schedule.status === 'boarding');
  const driverLocation = schedule?.driverId ? driverLocations[schedule.driverId] : null;

  useEffect(() => {
    if (!map || points.length === 0) return;

    // Draw route
    const latlngs = points.map(p => [p.lat, p.lng] as [number, number]);
    const polyline = L.polyline(latlngs, { color: 'hsl(221,83%,53%)', weight: 4, opacity: 0.4, dashArray: '5, 10' }).addTo(map);
    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

    // Mark pickup point
    const pickup = points.find(p => p.id === booking?.pickupPointId);
    if (pickup) {
      const pickupIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white text-xs font-black">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map).bindPopup("Titik Jemput Anda");
    }

    // Driver Marker
    const driverIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center text-xl shadow-xl border-2 border-white animate-bounce">🚐</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
    
    if (driverLocation) {
      driverMarkerRef.current = L.marker([driverLocation.latitude, driverLocation.longitude], { icon: driverIcon }).addTo(map);
    }

    return () => {
      map.eachLayer(l => { if (!(l instanceof L.TileLayer)) map.removeLayer(l); });
    };
  }, [map, points, booking]);

  // Update driver marker position
  useEffect(() => {
    if (driverLocation && driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverLocation.latitude, driverLocation.longitude]);
      if (map) {
        map.panTo([driverLocation.latitude, driverLocation.longitude], { animate: true });
      }
    }
  }, [driverLocation, map]);

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
            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 animate-pulse font-black text-[10px] uppercase">
              📡 LIVE Tracking
            </Badge>
          </div>
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <CardContent className="p-0 relative">
              <div className="h-[300px] w-full">
                <MapView onMapReady={setMap} />
              </div>
              <div className="absolute bottom-4 left-4 right-4 z-[400]">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Navigation className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Posisi Terkini</p>
                    <p className="font-black text-sm text-slate-800 leading-none">Shuttle sedang menuju lokasi Anda</p>
                  </div>
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
