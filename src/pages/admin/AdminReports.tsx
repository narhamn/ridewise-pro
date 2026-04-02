import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah } from '@/data/dummy';

const AdminReports = () => {
  const { bookings, routes, schedules } = useShuttle();

  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.price, 0);
  const completedTrips = schedules.filter(s => s.status === 'arrived').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  const revenueByRoute = routes.map(r => {
    const routeBookings = bookings.filter(b => b.routeId === r.id && b.status !== 'cancelled');
    return { name: r.name, revenue: routeBookings.reduce((s, b) => s + b.price, 0), count: routeBookings.length };
  }).filter(r => r.count > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Laporan Perjalanan</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Pendapatan</p>
            <p className="text-2xl font-bold text-primary">{formatRupiah(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Perjalanan Selesai</p>
            <p className="text-2xl font-bold text-success">{completedTrips}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Booking Batal</p>
            <p className="text-2xl font-bold text-destructive">{cancelledBookings}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Pendapatan per Rute</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenueByRoute.map(r => (
              <div key={r.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.count} booking</p>
                </div>
                <p className="font-bold text-primary">{formatRupiah(r.revenue)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
