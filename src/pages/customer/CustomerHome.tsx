import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ChevronRight, History, Navigation, Sparkles } from 'lucide-react';

const rayonColors: Record<string, string> = {
  A: 'bg-blue-500/10 text-blue-600 border-blue-200',
  B: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  C: 'bg-amber-500/10 text-amber-600 border-amber-200',
  D: 'bg-rose-500/10 text-rose-600 border-rose-200',
};

const CustomerHome = () => {
  const { routes, schedules, bookings, currentUser } = useShuttle();
  const navigate = useNavigate();

  const rayons = ['A', 'B', 'C', 'D'] as const;

  const getAvailableSchedules = (routeId: string) =>
    schedules.filter(s => s.routeId === routeId && (s.status === 'scheduled' || s.status === 'boarding')).length;

  return (
    <div className="p-5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Halo, {currentUser?.name?.split(' ')[0] || 'Siti'}! 👋
        </h2>
        <p className="text-muted-foreground text-sm font-medium">Mau kemana kita hari ini?</p>
      </div>

      {/* Hero CTA - Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/customer/ride-now')}
          className="group relative overflow-hidden bg-primary p-4 rounded-3xl text-primary-foreground text-left transition-all hover:shadow-lg active:scale-95 hover:shadow-primary/25"
          aria-label="Naik Sekarang - Pesan shuttle instan"
        >
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center">
              <Navigation className="h-5 w-5 fill-current" />
            </div>
            <div>
              <p className="font-black text-lg leading-tight">Naik<br/>Sekarang</p>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider mt-1">Cepat & Instan</p>
            </div>
          </div>
          <Sparkles className="absolute -right-2 -bottom-2 h-20 w-20 opacity-10 group-hover:scale-125 transition-transform duration-500" />
        </button>

        <button
          onClick={() => navigate('/customer/history')}
          className="group relative overflow-hidden bg-card border border-border/50 p-4 rounded-3xl text-left transition-all hover:shadow-lg active:scale-95 hover:border-primary/50"
          aria-label="Cek Riwayat - Lihat perjalanan sebelumnya"
        >
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="bg-primary/10 w-10 h-10 rounded-2xl flex items-center justify-center text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="font-black text-lg leading-tight text-foreground">Cek<br/>Riwayat</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Lihat Perjalanan</p>
            </div>
          </div>
        </button>
      </div>

      {/* Active Bookings Section */}
      {bookings.filter(b => b.status === 'confirmed').length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground/80">Booking Aktif</h3>
            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20">
              {bookings.filter(b => b.status === 'confirmed').length} Total
            </Badge>
          </div>
          <div className="space-y-3">
            {bookings.filter(b => b.status === 'confirmed').slice(0, 2).map(b => (
              <Card 
                key={b.id} 
                className="group relative overflow-hidden border-none bg-gradient-to-br from-card to-muted/30 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                onClick={() => navigate(`/customer/booking/${b.id}`)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-success/10 text-success p-3 rounded-2xl group-hover:bg-success group-hover:text-success-foreground transition-colors">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-foreground">{b.routeName}</p>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                        <span className="text-primary">{b.departureTime}</span>
                        <span className="opacity-30">•</span>
                        <span>Kursi {b.seatNumber}</span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Route Selection Section */}
      <section className="space-y-6 pb-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground/80">Jelajahi Rute</h3>
        </div>

        {rayons.map((rayon, index) => {
          const rayonRoutes = routes.filter(r => r.rayon === rayon);
          if (rayonRoutes.length === 0) return null;
          return (
            <div key={rayon} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center gap-2 px-1">
                <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-tighter ${rayonColors[rayon]}`}>
                  Rayon {rayon}
                </Badge>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              
              <div className="space-y-3">
                {rayonRoutes.map(route => {
                  const schedulesCount = getAvailableSchedules(route.id);
                  return (
                    <Card
                      key={route.id}
                      className="group overflow-hidden border-border/40 bg-card hover:border-primary/40 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                      onClick={() => navigate(`/customer/route/${route.id}`)}
                      aria-label={`Pilih rute ${route.name} - ${schedulesCount} jadwal tersedia, jarak ${(route.distanceMeters / 1000).toFixed(0)} KM`}
                    >
                      <CardContent className="p-0">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/5 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                              <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-black text-sm text-foreground group-hover:text-primary transition-colors">{route.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${schedulesCount > 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                                  {schedulesCount} Jadwal
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                  {(route.distanceMeters / 1000).toFixed(0)} KM
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-black text-foreground">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(route.price)}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default CustomerHome;
