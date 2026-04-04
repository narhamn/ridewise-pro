import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, MapPin, Clock, Users, CalendarIcon, ChevronRight, Info } from 'lucide-react';
import { formatPrice } from '@/lib/pricing';
import { cn } from '@/lib/utils';

const CustomerRouteDetail = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { routes, routePoints, schedules, vehicles, bookings } = useShuttle();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const route = routes.find(r => r.id === routeId);
  const points = routePoints.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const availableSchedules = schedules.filter(
    s => s.routeId === routeId && s.departureDate === dateStr && (s.status === 'scheduled' || s.status === 'boarding')
  );

  if (!route) return <div className="p-4">Rute tidak ditemukan</div>;

  const getAvailableSeats = (scheduleId: string, vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const booked = bookings.filter(b => b.scheduleId === scheduleId && b.status !== 'cancelled').length;
    return (vehicle?.capacity || 0) - booked;
  };

  return (
    <div className="min-h-full bg-background animate-in fade-in duration-500">
      {/* Header with Back Button */}
      <div className="relative h-48 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-primary" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/customer')} 
          className="absolute top-4 left-4 z-10 text-white hover:bg-white/20 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <Badge variant="outline" className="text-white border-white/40 mb-2 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">
            Rayon {route.rayon}
          </Badge>
          <h2 className="text-3xl font-black tracking-tighter leading-none mb-1">{route.name}</h2>
          <div className="flex items-center gap-3 opacity-90 text-sm font-medium">
            <span>{(route.distanceMeters / 1000).toFixed(0)} KM</span>
            <span className="opacity-40">•</span>
            <span>Mulai {formatPrice(route.price)}</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-8 -mt-4 relative z-10 bg-background rounded-t-[32px]">
        {/* Journey Map/Timeline */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground/80">Titik Pemberhentian</h3>
          </div>
          <div className="relative pl-4 space-y-6 before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/50 before:to-border/40">
            {points.map((p, idx) => (
              <div key={p.id} className="relative flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "relative z-10 w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center transition-all group-hover:scale-125",
                    idx === 0 ? "border-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" : 
                    idx === points.length - 1 ? "border-rose-500" : "border-border"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", idx === 0 ? "bg-primary" : idx === points.length - 1 ? "bg-rose-500" : "bg-muted-foreground/30")} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-black", idx === 0 || idx === points.length - 1 ? "text-foreground" : "text-muted-foreground")}>
                      {p.name}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                      {p.distanceToDestination === 0 ? "Titik Akhir" : `${(p.distanceToDestination / 1000).toFixed(0)} KM ke tujuan`}
                    </p>
                  </div>
                </div>
                {p.distanceToDestination !== 0 && (
                  <Badge variant="outline" className="rounded-full text-[10px] font-black text-primary border-primary/20 bg-primary/5">
                    {formatPrice(p.price)}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Schedule Selection */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground/80">Pilih Jadwal</h3>
          </div>
          
          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-14 justify-between text-left font-black rounded-2xl border-border/50 bg-card hover:bg-muted/50 transition-all">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                    <span>{format(selectedDate, 'EEEE, dd MMM yyyy', { locale: localeId })}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            {availableSchedules.length === 0 ? (
              <div className="bg-muted/30 rounded-3xl p-8 text-center space-y-2 border border-dashed border-border">
                <Info className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm font-black text-muted-foreground/60 uppercase tracking-widest">Tidak ada jadwal</p>
                <p className="text-xs text-muted-foreground font-medium">Coba pilih tanggal lain untuk rute ini.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {availableSchedules.map(schedule => {
                  const available = getAvailableSeats(schedule.id, schedule.vehicleId);
                  const vehicle = vehicles.find(v => v.id === schedule.vehicleId);
                  const isBoarding = schedule.status === 'boarding';
                  
                  return (
                    <Card 
                      key={schedule.id} 
                      className={cn(
                        "group overflow-hidden border-border/40 bg-card transition-all active:scale-[0.98] cursor-pointer hover:border-primary/40 rounded-3xl",
                        isBoarding && "ring-2 ring-primary ring-offset-2"
                      )} 
                      onClick={() => navigate(`/customer/booking/new?scheduleId=${schedule.id}&routeId=${routeId}`)}
                    >
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-colors",
                            isBoarding ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          )}>
                            <p className="text-lg font-black leading-none">{schedule.departureTime.split(':')[0]}</p>
                            <p className="text-[10px] font-black opacity-60">:{schedule.departureTime.split(':')[1]}</p>
                          </div>
                          <div>
                            <p className="font-black text-sm text-foreground group-hover:text-primary transition-colors">
                              {vehicle?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="rounded-md px-1.5 py-0 text-[9px] font-black border-border/60 text-muted-foreground uppercase">
                                {vehicle?.plateNumber}
                              </Badge>
                              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                {schedule.departureDate}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div className={cn(
                            "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                            available <= 2 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                          )}>
                            <Users className="h-3 w-3" />
                            {available} Sisa
                          </div>
                          {isBoarding && (
                            <Badge className="bg-primary animate-pulse text-[9px] font-black uppercase tracking-widest rounded-full px-2">
                              Boarding
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerRouteDetail;
