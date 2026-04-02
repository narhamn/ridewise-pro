import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users } from 'lucide-react';

const DriverTrips = () => {
  const { schedules, routes, vehicles, bookings, currentUser } = useShuttle();
  const navigate = useNavigate();
  const mySchedules = schedules.filter(s => s.driverId === currentUser?.id);

  const statusLabel: Record<string, string> = {
    scheduled: 'Terjadwal', boarding: 'Boarding', departed: 'Berangkat', arrived: 'Tiba', cancelled: 'Batal',
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Semua Perjalanan</h2>
      {mySchedules.map(s => {
        const route = routes.find(r => r.id === s.routeId);
        const vehicle = vehicles.find(v => v.id === s.vehicleId);
        const count = bookings.filter(b => b.scheduleId === s.id && b.status !== 'cancelled').length;
        return (
          <Card key={s.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`/driver/trip/${s.id}`)}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium">{route?.name}</p>
                <Badge variant="secondary">{statusLabel[s.status]}</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.departureTime}</div>
                <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{vehicle?.plateNumber}</div>
                <div className="flex items-center gap-1"><Users className="h-3 w-3" />{count}/{vehicle?.capacity}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DriverTrips;
