import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  Users, 
  CalendarDays, 
  ChevronRight,
  Filter,
  ArrowRight,
  Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { TRIP_STATUS_CONFIG, DRIVER_TYPOGRAPHY, DRIVER_LAYOUT } from '@/lib/driver-ui';

const DriverTrips = () => {
  const { schedules, routes, vehicles, bookings, currentUser } = useShuttle();
  const navigate = useNavigate();
  
  const mySchedules = [...schedules.filter(s => s.driverId === currentUser?.id)]
    .sort((a, b) => {
      const dateComp = b.departureDate.localeCompare(a.departureDate);
      if (dateComp !== 0) return dateComp;
      return b.departureTime.localeCompare(a.departureTime);
    });

  // Group by date
  const groupedSchedules = mySchedules.reduce((acc, s) => {
    if (!acc[s.departureDate]) acc[s.departureDate] = [];
    acc[s.departureDate].push(s);
    return acc;
  }, {} as Record<string, typeof mySchedules>);

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hari Ini';
    if (isYesterday(date)) return 'Kemarin';
    return format(date, 'EEEE, d MMMM yyyy', { locale: id });
  };

  return (
    <div className={cn("p-4 pb-24", DRIVER_LAYOUT.sectionGap)}>
      <div className="flex justify-between items-center px-1">
        <h2 className={DRIVER_TYPOGRAPHY.heading2}>Riwayat Trip</h2>
        <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl border-slate-200">
          <Filter className="h-4 w-4 text-slate-500" />
        </Button>
      </div>

      {Object.keys(groupedSchedules).length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="h-10 w-10 text-slate-200" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada riwayat</p>
        </div>
      ) : (
        Object.entries(groupedSchedules).map(([date, trips]) => (
          <div key={date} className="space-y-4">
            <h3 className={DRIVER_TYPOGRAPHY.caption + " px-1"}>
              {formatDateLabel(date)}
            </h3>
            
            <div className="space-y-3">
              {trips.map(s => {
                const route = routes.find(r => r.id === s.routeId);
                const vehicle = vehicles.find(v => v.id === s.vehicleId);
                const count = bookings.filter(b => b.scheduleId === s.id && b.status !== 'cancelled').length;
                const config = TRIP_STATUS_CONFIG[s.status];
                
                return (
                  <Card 
                    key={s.id} 
                    className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer bg-white group" 
                    onClick={() => navigate(`/driver/trip/${s.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", 
                            s.status === 'arrived' ? "bg-emerald-50 text-emerald-600" : "bg-primary/5 text-primary"
                          )}>
                            <Navigation className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{route?.origin}</p>
                            <div className="flex items-center gap-1 my-0.5">
                              <ArrowRight className="h-3 w-3 text-slate-300" />
                            </div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{route?.destination}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] font-black border-none px-2.5 py-1 uppercase tracking-widest", config.badge)}>
                          {config.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <Clock className="h-3.5 w-3.5" /> {s.departureTime}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <Users className="h-3.5 w-3.5" /> {count} Penumpang
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DriverTrips;
