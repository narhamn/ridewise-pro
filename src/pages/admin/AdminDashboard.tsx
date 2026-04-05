import { useEffect, useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Bus, 
  MapPin, 
  CalendarDays,
  BookOpen,
  Navigation,
  ShieldCheck
} from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { 
    registrations,
    routes, 
    schedules, 
    drivers, 
    vehicles, 
    bookings, 
    updateDriverLocation 
  } = useShuttle();
  
  // Simulation for 100+ entities
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate location for all drivers
      drivers.forEach((driver, idx) => {
        // Base coordinate around Medan
        const baseLat = 3.5952;
        const baseLng = 98.6722;
        
        // Add random movement
        const lat = baseLat + (Math.random() - 0.5) * 0.1;
        const lng = baseLng + (Math.random() - 0.5) * 0.1;
        
        updateDriverLocation(driver.id, {
          driverId: driver.id,
          latitude: lat,
          longitude: lng,
          speed: Math.random() * 60,
          accuracy: 5 + Math.random() * 10,
          heading: Math.random() * 360,
          altitude: 20,
          timestamp: new Date().toISOString()
        });
      });

      // Simulate some extra phantom entities for performance testing (100+ total)
      for(let i=0; i<100; i++) {
        updateDriverLocation(`phantom-${i}`, {
          driverId: `phantom-${i}`,
          latitude: 3.5952 + (Math.random() - 0.5) * 0.5,
          longitude: 98.6722 + (Math.random() - 0.5) * 0.5,
          speed: Math.random() * 80,
          accuracy: 10,
          heading: Math.random() * 360,
          altitude: 0,
          timestamp: new Date().toISOString()
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [drivers, updateDriverLocation]);

  const stats = [
    { label: 'Total Rute', value: routes.length, icon: Navigation, color: 'text-primary', url: '/admin/routes' },
    { label: 'Driver Online', value: drivers.filter(d => d.status === 'online').length, icon: Users, color: 'text-secondary', url: '/admin/drivers' },
    { label: 'Kendaraan Aktif', value: vehicles.filter(v => v.status === 'active').length, icon: Bus, color: 'text-primary', url: '/admin/vehicles' },
    { label: 'Jadwal Hari Ini', value: schedules.length, icon: CalendarDays, color: 'text-warning', url: '/admin/routes' },
    { label: 'Total Booking', value: bookings.length, icon: BookOpen, color: 'text-secondary', url: '/admin/bookings' },
    { label: 'Booking Aktif', value: bookings.filter(b => b.status === 'confirmed').length, icon: MapPin, color: 'text-success', url: '/admin/bookings' },
    { label: 'Verifikasi Driver', value: registrations.filter(r => r.verificationStatus === 'pending').length, icon: ShieldCheck, color: 'text-amber-500', url: '/admin/drivers?tab=verification' },
  ];

  const recentBookings = bookings.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(s.url)}>
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
