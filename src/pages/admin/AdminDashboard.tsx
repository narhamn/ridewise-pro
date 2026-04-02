import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Users, MapPin, CalendarDays, BookOpen, Navigation } from 'lucide-react';

const AdminDashboard = () => {
  const { routes, drivers, vehicles, schedules, bookings } = useShuttle();

  const stats = [
    { label: 'Total Rute', value: routes.length, icon: Navigation, color: 'text-primary' },
    { label: 'Total Driver', value: drivers.filter(d => d.status === 'active').length, icon: Users, color: 'text-secondary' },
    { label: 'Kendaraan Aktif', value: vehicles.filter(v => v.status === 'active').length, icon: Bus, color: 'text-primary' },
    { label: 'Jadwal Hari Ini', value: schedules.length, icon: CalendarDays, color: 'text-warning' },
    { label: 'Total Booking', value: bookings.length, icon: BookOpen, color: 'text-secondary' },
    { label: 'Booking Aktif', value: bookings.filter(b => b.status === 'confirmed').length, icon: MapPin, color: 'text-success' },
  ];

  const recentBookings = bookings.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Booking Terbaru</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                <div>
                  <p className="font-medium">{b.userName}</p>
                  <p className="text-xs text-muted-foreground">{b.routeName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs">{b.departureTime}</p>
                  <p className="text-xs text-muted-foreground">Kursi #{b.seatNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
