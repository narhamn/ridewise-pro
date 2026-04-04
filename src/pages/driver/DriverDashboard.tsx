import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Clock, 
  CalendarDays, 
  Wallet, 
  TrendingUp, 
  Star,
  ChevronRight,
  Navigation,
  ArrowRight
} from 'lucide-react';
import { formatPrice } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { TRIP_STATUS_CONFIG, DRIVER_TYPOGRAPHY, DRIVER_LAYOUT } from '@/lib/driver-ui';

const DriverDashboard = () => {
  const { schedules, routes, vehicles, bookings, currentUser, drivers, updateTripStatus } = useShuttle();
  const navigate = useNavigate();

  const driverData = drivers.find(d => d.id === currentUser?.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const mySchedules = schedules.filter(s => s.driverId === currentUser?.id);
  const todaySchedules = mySchedules.filter(s => s.departureDate === todayStr);
  
  // Find the next/current active trip
  const activeTrip = todaySchedules.find(s => ['boarding', 'departed'].includes(s.status)) 
                   || todaySchedules.filter(s => s.status === 'scheduled').sort((a,b) => a.departureTime.localeCompare(b.departureTime))[0];

  // Calculate earnings (mock logic: sum of prices of bookings in completed trips)
  const completedTrips = mySchedules.filter(s => s.status === 'arrived');
  const totalEarnings = completedTrips.reduce((acc, s) => {
    const tripBookings = bookings.filter(b => b.scheduleId === s.id && b.status !== 'cancelled');
    return acc + tripBookings.reduce((sum, b) => sum + b.price, 0);
  }, 0);

  return (
    <div className={cn("p-4 pb-10", DRIVER_LAYOUT.sectionGap)}>
      {/* Earnings Summary & Quick Stats */}
      <div className="space-y-4">
        <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative rounded-[2rem]">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Wallet className="h-32 w-32" />
          </div>
          <CardContent className="p-8 relative z-10">
            <p className={DRIVER_TYPOGRAPHY.caption + " text-white/60"}>Estimasi Pendapatan</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-4xl font-black tracking-tighter text-primary-foreground">{formatPrice(totalEarnings)}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Rating</p>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-lg font-black">{driverData?.rating || '0.0'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Selesai</p>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-lg font-black">{completedTrips.length} Trip</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spotlight Trip (Next or Current) */}
      {activeTrip && (
        <div className="space-y-3">
          <h2 className={DRIVER_TYPOGRAPHY.caption + " px-1"}>Trip Berjalan / Berikutnya</h2>
          <Card 
            className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
            onClick={() => navigate(`/driver/trip/${activeTrip.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                  {TRIP_STATUS_CONFIG[activeTrip.status].label}
                </Badge>
                <div className="text-right">
                  <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Waktu</p>
                  <p className="text-xl font-black">{activeTrip.departureTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest mb-1">Rute</p>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg truncate">
                      {routes.find(r => r.id === activeTrip.routeId)?.name}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Navigation className="h-6 w-6" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 opacity-60" />
                  <span className="text-sm font-bold">
                    {bookings.filter(b => b.scheduleId === activeTrip.id && b.status !== 'cancelled').length} / {vehicles.find(v => v.id === activeTrip.vehicleId)?.capacity} Penumpang
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeTrip.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => updateTripStatus(activeTrip.id, 'boarding')}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1"
                    >
                      Mulai Boarding
                    </Button>
                  )}
                  {activeTrip.status === 'boarding' && (
                    <Button
                      size="sm"
                      onClick={() => updateTripStatus(activeTrip.id, 'departed')}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                    >
                      Berangkat
                    </Button>
                  )}
                  {activeTrip.status === 'departed' && (
                    <Button
                      size="sm"
                      onClick={() => updateTripStatus(activeTrip.id, 'arrived')}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1"
                    >
                      Tiba
                    </Button>
                  )}
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter bg-white text-primary px-3 py-1.5 rounded-lg">
                    Lanjutkan <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Schedule List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className={DRIVER_TYPOGRAPHY.heading3 + " text-slate-800"}>Jadwal Hari Ini</h2>
          <Badge variant="outline" className="bg-white text-[10px] font-bold border-slate-200 uppercase tracking-widest">
            {todayStr}
          </Badge>
        </div>

        {todaySchedules.length === 0 ? (
          <Card className="border-dashed border-2 bg-slate-50/50">
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Tidak ada perjalanan terjadwal</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todaySchedules.map(schedule => {
              const route = routes.find(r => r.id === schedule.routeId);
              const vehicle = vehicles.find(v => v.id === schedule.vehicleId);
              const passengers = bookings.filter(b => b.scheduleId === schedule.id && b.status !== 'cancelled');
              const config = TRIP_STATUS_CONFIG[schedule.status];

              return (
                <Card 
                  key={schedule.id} 
                  className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group bg-white"
                  onClick={() => navigate(`/driver/trip/${schedule.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("w-2 h-2 rounded-full", config.color)} />
                          <p className={DRIVER_TYPOGRAPHY.caption}>{config.label}</p>
                        </div>
                        <h3 className="font-black text-slate-800 truncate group-hover:text-primary transition-colors pr-2">
                          {route?.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                            <Clock className="h-3.5 w-3.5 text-slate-300" />
                            {schedule.departureTime}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                            <Users className="h-3.5 w-3.5 text-slate-300" />
                            {passengers.length}/{vehicle?.capacity} Seat
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                           <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                         </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
