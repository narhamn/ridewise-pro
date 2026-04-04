import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Clock, Users, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { generateSeats, formatRupiah } from '@/data/dummy';
import { toast } from 'sonner';

const CustomerRideNow = () => {
  const navigate = useNavigate();
  const { currentUser, schedules, routes, routePoints, vehicles, bookings, drivers, rideRequests, addRideRequest } = useShuttle();

  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [selectedSeat, setSelectedSeat] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  // Active shuttles (boarding or departed)
  const todayStr = new Date().toISOString().split('T')[0];
  const activeSchedules = schedules.filter(s => (s.status === 'boarding' || s.status === 'departed') && s.departureDate === todayStr);

  const getScheduleInfo = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    const route = routes.find(r => r.id === schedule?.routeId);
    const vehicle = vehicles.find(v => v.id === schedule?.vehicleId);
    const driver = drivers.find(d => d.id === schedule?.driverId);
    const passengers = bookings.filter(b => b.scheduleId === scheduleId && b.status !== 'cancelled');
    const seats = vehicle ? generateSeats(vehicle.id) : [];
    const availableCount = vehicle ? vehicle.capacity - passengers.length : 0;
    return { schedule, route, vehicle, driver, passengers, seats, availableCount };
  };

  const selectedInfo = selectedSchedule ? getScheduleInfo(selectedSchedule) : null;
  const points = selectedInfo?.route ? routePoints.filter(p => p.routeId === selectedInfo.route!.id).sort((a, b) => a.order - b.order) : [];
  const bookedSeats = selectedInfo?.passengers.map(p => p.seatNumber) || [];
  const availableSeats = selectedInfo?.seats.filter(s => !bookedSeats.includes(s.seatNumber)) || [];

  // Watch request status
  const currentRequest = currentRequestId ? rideRequests.find(r => r.id === currentRequestId) : null;

  useEffect(() => {
    if (currentRequest?.status === 'accepted') {
      const booking = bookings.find(b => b.userId === currentUser?.id && b.scheduleId === currentRequest.scheduleId && b.bookingType === 'realtime');
      if (booking) {
        toast.success('Request diterima! Anda mendapat kursi.');
        setTimeout(() => navigate(`/customer/booking/${booking.id}`), 1500);
      }
    }
  }, [currentRequest?.status, bookings]);

  const handleSubmitRequest = () => {
    if (!currentUser || !selectedSchedule || !selectedPickup || !selectedSeat || !selectedInfo?.route) return;

    const pickup = points.find(p => p.id === selectedPickup);
    if (!pickup) return;

    const requestId = `rr-${Date.now()}`;
    addRideRequest({
      id: requestId,
      userId: currentUser.id,
      userName: currentUser.name,
      scheduleId: selectedSchedule,
      routeId: selectedInfo.route.id,
      pickupPointId: pickup.id,
      pickupPointName: pickup.name,
      seatNumber: parseInt(selectedSeat),
      price: pickup.price,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    setCurrentRequestId(requestId);
    setSubmitted(true);
    toast.info('Request dikirim! Menunggu konfirmasi driver...');
  };

  const handleReset = () => {
    setSubmitted(false);
    setCurrentRequestId(null);
    setSelectedSchedule(null);
    setSelectedPickup('');
    setSelectedSeat('');
  };

  // Waiting / result screen
  if (submitted && currentRequest) {
    return (
      <div className="p-4 space-y-4">
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            {currentRequest.status === 'pending' && (
              <>
                <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                <h2 className="text-lg font-bold">Menunggu Konfirmasi Driver</h2>
                <p className="text-sm text-muted-foreground">
                  Request Anda sedang ditinjau oleh driver. Harap tunggu...
                </p>
                <div className="bg-muted rounded-lg p-4 text-left space-y-1">
                  <p className="text-sm"><strong>Rute:</strong> {selectedInfo?.route?.name}</p>
                  <p className="text-sm"><strong>Titik Jemput:</strong> {currentRequest.pickupPointName}</p>
                  <p className="text-sm"><strong>Kursi:</strong> #{currentRequest.seatNumber}</p>
                  <p className="text-sm"><strong>Harga:</strong> {formatRupiah(currentRequest.price)}</p>
                </div>
              </>
            )}
            {currentRequest.status === 'accepted' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <h2 className="text-lg font-bold text-green-600">Request Diterima!</h2>
                <p className="text-sm text-muted-foreground">Mengalihkan ke detail booking...</p>
              </>
            )}
            {currentRequest.status === 'rejected' && (
              <>
                <XCircle className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="text-lg font-bold text-destructive">Request Ditolak</h2>
                <p className="text-sm text-muted-foreground">
                  Maaf, driver menolak request Anda. Silakan coba shuttle lain.
                </p>
                <Button onClick={handleReset} className="mt-2">Coba Lagi</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/customer')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Button>

      <div>
        <h1 className="text-xl font-bold">🚐 Naik Sekarang</h1>
        <p className="text-sm text-muted-foreground">Pilih shuttle yang sedang berjalan dan request kursi</p>
      </div>

      {activeSchedules.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Tidak ada shuttle aktif saat ini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeSchedules.map(s => {
            const info = getScheduleInfo(s.id);
            if (!info.route || !info.vehicle) return null;
            const isSelected = selectedSchedule === s.id;
            return (
              <Card
                key={s.id}
                className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                onClick={() => {
                  setSelectedSchedule(s.id);
                  setSelectedPickup('');
                  setSelectedSeat('');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{info.route.name}</h3>
                    <Badge className={s.status === 'boarding' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}>
                      {s.status === 'boarding' ? 'Boarding' : 'Dalam Perjalanan'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.departureTime}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {info.availableCount} kursi kosong</span>
                    <span>{info.vehicle.name}</span>
                  </div>
                  {info.driver && (
                    <p className="text-xs text-muted-foreground mt-1">Driver: {info.driver.name}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Booking form when shuttle selected */}
      {selectedSchedule && selectedInfo?.route && availableSeats.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Request Kursi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Titik Jemput</label>
              <Select value={selectedPickup} onValueChange={setSelectedPickup}>
                <SelectTrigger><SelectValue placeholder="Pilih titik jemput" /></SelectTrigger>
                <SelectContent>
                  {points.filter(p => p.distanceToDestination > 0).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} — {p.name} · {formatRupiah(p.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPickup && (
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Harga</p>
                <p className="text-xl font-bold text-primary">{formatRupiah(points.find(p => p.id === selectedPickup)?.price || 0)}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Pilih Kursi</label>
              <Select value={selectedSeat} onValueChange={setSelectedSeat}>
                <SelectTrigger><SelectValue placeholder="Pilih kursi kosong" /></SelectTrigger>
                <SelectContent>
                  {availableSeats.map(s => (
                    <SelectItem key={s.seatNumber} value={String(s.seatNumber)}>
                      Kursi #{s.seatNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleSubmitRequest}
              disabled={!selectedPickup || !selectedSeat}
            >
              <MapPin className="h-4 w-4 mr-2" /> Request Naik
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedSchedule && availableSeats.length === 0 && (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            Shuttle ini sudah penuh. Pilih shuttle lain.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerRideNow;
