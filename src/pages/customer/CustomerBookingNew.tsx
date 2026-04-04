import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { formatRupiah, generateSeats } from '@/data/dummy';
import { toast } from 'sonner';
import { PaymentModal } from '@/components/PaymentModal';
import { PaymentMethod } from '@/types/shuttle';

const CustomerBookingNew = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { routes, routePoints, schedules, vehicles, bookings, addBooking, setBookings, currentUser } = useShuttle();

  const scheduleId = searchParams.get('scheduleId') || '';
  const routeId = searchParams.get('routeId') || '';

  const schedule = schedules.find(s => s.id === scheduleId);
  const route = routes.find(r => r.id === routeId);
  const vehicle = vehicles.find(v => v.id === schedule?.vehicleId);
  const points = routePoints.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [lastBookingId, setLastBookingId] = useState('');

  const handlePaymentConfirm = (method: PaymentMethod) => {
    setBookings(prev => prev.map(b => b.id === lastBookingId ? { ...b, paymentStatus: 'paid' as const, paymentMethod: method } : b));
    setShowPayment(false);
    toast.success('Booking & pembayaran berhasil!');
    navigate(`/customer/booking/${lastBookingId}`);
  };

  if (!schedule || !route || !vehicle) return <div className="p-4">Data tidak ditemukan</div>;

  const seats = generateSeats(vehicle.id);
  const bookedSeats = bookings.filter(b => b.scheduleId === scheduleId && b.status !== 'cancelled').map(b => b.seatNumber);
  const cols = vehicle.capacity <= 8 ? 2 : 3;

  const handleBooking = () => {
    if (!selectedSeat || !selectedPickup) {
      toast.error('Pilih kursi dan titik penjemputan!');
      return;
    }
    const pickup = points.find(p => p.id === selectedPickup);
    const bookingPrice = pickup?.price || route.price;
    const newBooking = {
      id: `b${Date.now()}`,
      userId: currentUser?.id || 'u1',
      userName: currentUser?.name || 'Guest',
      scheduleId,
      routeId,
      routeName: route.name,
      pickupPointId: selectedPickup,
      pickupPointName: pickup?.name || '',
      seatNumber: selectedSeat,
      price: bookingPrice,
      status: 'confirmed' as const,
      bookingDate: new Date().toISOString().split('T')[0],
      departureTime: schedule.departureTime,
      paymentStatus: 'pending' as const,
      paymentMethod: null,
    };
    addBooking(newBooking);
    setLastBookingId(newBooking.id);
    setShowPayment(true);
  };

  return (
    <div className="p-4 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Button>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Detail Perjalanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Rute:</span> {route.name}</p>
          <p><span className="text-muted-foreground">Waktu:</span> {schedule.departureTime}</p>
          <p><span className="text-muted-foreground">Kendaraan:</span> {vehicle.name} ({vehicle.plateNumber})</p>
          <p><span className="text-muted-foreground">Harga mulai:</span> <span className="font-bold text-primary">{formatRupiah(points.length > 1 ? points[1]?.price || 0 : route.price)} — {formatRupiah(route.price)}</span></p>
        </CardContent>
      </Card>

      {/* Pickup Point */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg">Titik Penjemputan</CardTitle></CardHeader>
        <CardContent>
          <Select value={selectedPickup} onValueChange={setSelectedPickup}>
            <SelectTrigger><SelectValue placeholder="Pilih titik jemput" /></SelectTrigger>
            <SelectContent>
              {points.filter(p => p.order > 1).map(p => (
                <SelectItem key={p.id} value={p.id}>{p.code} — {p.name} ({formatRupiah(p.price)})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Seat Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pilih Kursi</CardTitle>
          <div className="flex gap-3 text-xs mt-1">
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-success inline-block" /> Kosong</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-destructive inline-block" /> Terisi</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-primary inline-block" /> Dipilih</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-xl p-4">
            {/* Driver area */}
            <div className="flex justify-end mb-3">
              <div className="bg-foreground/20 text-foreground text-xs rounded px-2 py-1">🚗 Driver</div>
            </div>
            <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`} style={{ maxWidth: cols === 3 ? '180px' : '120px', margin: '0 auto' }}>
              {seats.map(seat => {
                const isBooked = bookedSeats.includes(seat.seatNumber);
                const isSelected = selectedSeat === seat.seatNumber;
                return (
                  <button
                    key={seat.seatNumber}
                    disabled={isBooked}
                    onClick={() => setSelectedSeat(isSelected ? null : seat.seatNumber)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                      isBooked ? 'bg-destructive text-destructive-foreground cursor-not-allowed' :
                      isSelected ? 'bg-primary text-primary-foreground scale-110 shadow-lg' :
                      'bg-success text-success-foreground hover:scale-105'
                    }`}
                  >
                    {seat.seatNumber}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Harga</p>
              <p className="text-2xl font-bold text-primary">{formatRupiah(route.price)}</p>
            </div>
            {selectedSeat && <Badge className="bg-primary text-primary-foreground">Kursi #{selectedSeat}</Badge>}
          </div>
          <Button className="w-full" size="lg" onClick={handleBooking} disabled={!selectedSeat || !selectedPickup}>
            Konfirmasi Booking
          </Button>
        </CardContent>
      </Card>

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        amount={route.price}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
};

export default CustomerBookingNew;
