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
import { ArrowLeft, MapPin, Clock, Users, CalendarIcon } from 'lucide-react';
import { formatRupiah } from '@/data/dummy';
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
    <div className="p-4 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/customer')} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Button>

      <div className="bg-primary text-primary-foreground rounded-xl p-4">
        <h2 className="text-xl font-bold">{route.name}</h2>
        <p className="text-sm opacity-80">{(route.distanceMeters / 1000).toFixed(0)} km · {formatRupiah(route.price)}</p>
      </div>

      {/* Pickup Points */}
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Titik Penjemputan</h3>
        <div className="space-y-2">
          {points.map(p => (
            <div key={p.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">{p.code}</Badge>
                <span className="text-sm">{p.name}</span>
              </div>
              <div className="text-right text-sm">
                {p.distanceToDestination === 0 ? (
                  <span className="text-muted-foreground">Tujuan</span>
                ) : (
                  <>
                    <span className="font-semibold text-primary">{formatRupiah(p.price)}</span>
                    <span className="text-muted-foreground ml-1 text-xs">({(p.distanceToDestination / 1000).toFixed(0)} km)</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date Picker + Schedules */}
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Jadwal Tersedia</h3>
        <div className="mb-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: localeId })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {availableSchedules.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada jadwal tersedia pada tanggal ini</p>
        ) : (
          <div className="space-y-2">
            {availableSchedules.map(schedule => {
              const available = getAvailableSeats(schedule.id, schedule.vehicleId);
              const vehicle = vehicles.find(v => v.id === schedule.vehicleId);
              return (
                <Card key={schedule.id} className="cursor-pointer hover:border-primary transition-all" onClick={() => navigate(`/customer/booking/new?scheduleId=${schedule.id}&routeId=${routeId}`)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{schedule.departureTime}</p>
                      <p className="text-xs text-muted-foreground">{vehicle?.name} · {vehicle?.plateNumber}</p>
                      <p className="text-xs text-muted-foreground">{schedule.departureDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4" />
                        <span className={available <= 2 ? 'text-destructive font-medium' : 'text-success font-medium'}>{available} kursi</span>
                      </div>
                      <Badge variant={schedule.status === 'boarding' ? 'default' : 'secondary'} className="text-xs mt-1">
                        {schedule.status === 'boarding' ? 'Boarding' : 'Terjadwal'}
                      </Badge>
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

export default CustomerRouteDetail;
