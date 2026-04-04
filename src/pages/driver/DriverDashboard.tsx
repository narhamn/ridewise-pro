import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Clock, CalendarDays } from 'lucide-react';

const DriverDashboard = () => {
  const { schedules, routes, vehicles, bookings, currentUser } = useShuttle();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];
  const mySchedules = schedules.filter(s => s.driverId === currentUser?.id && s.departureDate === todayStr);

  const statusColor: Record<string, string> = {
    scheduled: 'bg-primary text-primary-foreground',
    boarding: 'bg-warning text-warning-foreground',
    departed: 'bg-secondary text-secondary-foreground',
    arrived: 'bg-success text-success-foreground',
    cancelled: 'bg-destructive text-destructive-foreground',
  };

  const statusLabel: Record<string, string> = {
    scheduled: 'Terjadwal', boarding: 'Boarding', departed: 'Berangkat', arrived: 'Tiba', cancelled: 'Batal',
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Perjalanan Hari Ini</h2>
      <p className="text-xs text-muted-foreground">{todayStr}</p>

      {mySchedules.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">Tidak ada perjalanan hari ini</p>
      ) : (
        mySchedules.map(schedule => {
          const route = routes.find(r => r.id === schedule.routeId);
          const vehicle = vehicles.find(v => v.id === schedule.vehicleId);
          const passengers = bookings.filter(b => b.scheduleId === schedule.id && b.status !== 'cancelled');

          return (
            <Card key={schedule.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/driver/trip/${schedule.id}`)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{route?.name}</h3>
                  <Badge className={statusColor[schedule.status]}>{statusLabel[schedule.status]}</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {schedule.departureDate}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {schedule.departureTime}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {vehicle?.name} · {vehicle?.plateNumber}</div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4" /> {passengers.length}/{vehicle?.capacity} penumpang</div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default DriverDashboard;
