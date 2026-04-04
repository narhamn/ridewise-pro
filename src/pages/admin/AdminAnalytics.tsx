import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/pricing';
import { TrendingUp, Users, Bus, DollarSign, MapPin, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend } from 'recharts';

const COLORS = ['hsl(221,83%,53%)', 'hsl(160,84%,39%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)'];

const AdminAnalytics = () => {
  const { bookings, routes, schedules } = useShuttle();

  const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.price, 0);
  const totalBookings = bookings.length;
  const avgOccupancy = 65; // Simulated

  // Revenue per route
  const revenueByRoute = routes.map(r => ({
    name: r.name.split('→')[0].trim(),
    revenue: bookings.filter(b => b.routeId === r.id && b.paymentStatus === 'paid').reduce((s, b) => s + b.price, 0),
  })).filter(r => r.revenue > 0);

  // Booking by rayon
  const bookingByRayon = ['A', 'B', 'C', 'D'].map(rayon => {
    const routeIds = routes.filter(r => r.rayon === rayon).map(r => r.id);
    return {
      name: `Rayon ${rayon}`,
      value: bookings.filter(b => routeIds.includes(b.routeId)).length,
    };
  }).filter(r => r.value > 0);

  // Daily trend (dummy 7 days)
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      bookings: Math.floor(Math.random() * 15) + 5,
      revenue: Math.floor(Math.random() * 2000000) + 500000,
    };
  });

  // Occupancy by schedule
  const occupancyData = schedules.slice(0, 6).map(s => {
    const route = routes.find(r => r.id === s.routeId);
    const passengers = bookings.filter(b => b.scheduleId === s.id && b.status !== 'cancelled').length;
    return {
      name: `${route?.name.split('→')[0].trim() || ''} ${s.departureTime}`,
      occupancy: Math.min(100, Math.floor((passengers / 12) * 100) + Math.floor(Math.random() * 40) + 20),
    };
  });

  const topRoute = revenueByRoute.sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10"><DollarSign className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold">{formatPrice(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-secondary/10"><TrendingUp className="h-6 w-6 text-secondary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Booking</p>
              <p className="text-lg font-bold">{totalBookings}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-warning/10"><Users className="h-6 w-6 text-warning" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Occupancy</p>
              <p className="text-lg font-bold">{avgOccupancy}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-destructive/10"><Bus className="h-6 w-6 text-destructive" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Top Route</p>
              <p className="text-lg font-bold truncate">{topRoute?.name || '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Route */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Pendapatan per Rute</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByRoute}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatPrice(v)} />
                <Bar dataKey="revenue" fill="hsl(221,83%,53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking by Rayon */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Distribusi Booking per Rayon</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={bookingByRayon} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {bookingByRayon.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Trend Booking Harian (7 Hari)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="hsl(221,83%,53%)" strokeWidth={2} name="Booking" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Occupancy Rate per Jadwal</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Area type="monotone" dataKey="occupancy" stroke="hsl(160,84%,39%)" fill="hsl(160,84%,39%)" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
