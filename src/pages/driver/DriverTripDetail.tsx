import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, MapPin, QrCode, UserPlus, Bell, Check, X, CheckCircle2 } from 'lucide-react';
import { generateSeats, formatRupiah } from '@/data/dummy';
import { toast } from 'sonner';
import QRScanner from '@/components/QRScanner';

const DriverTripDetail = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { schedules, routes, routePoints, vehicles, bookings, addBooking, updateScheduleStatus, rideRequests, acceptRideRequest, rejectRideRequest, checkInPassenger } = useShuttle();
  const [scanOpen, setScanOpen] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [addPassengerOpen, setAddPassengerOpen] = useState(false);
  const [passengerName, setPassengerName] = useState('');
  const [selectedPickup, setSelectedPickup] = useState('');
  const [selectedSeat, setSelectedSeat] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');

  const processTicketData = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      const bookingId = parsed.id;
      const found = bookings.find(b => b.id === bookingId);

      if (found && found.scheduleId === scheduleId) {
        if (found.checkedIn) {
          toast.warning(`⚠️ ${found.userName} sudah check-in sebelumnya (Kursi #${found.seatNumber})`);
        } else {
          checkInPassenger(found.id);
          toast.success(`✅ Check-in berhasil! ${found.userName} — Kursi #${found.seatNumber}`);
        }
      } else if (found) {
        toast.error('❌ Tiket valid tapi bukan untuk perjalanan ini');
      } else {
        toast.error('❌ Tiket tidak ditemukan');
      }
    } catch {
      const found = bookings.find(b => b.id === data.trim());
      if (found && found.scheduleId === scheduleId) {
        if (found.checkedIn) {
          toast.warning(`⚠️ ${found.userName} sudah check-in sebelumnya`);
        } else {
          checkInPassenger(found.id);
          toast.success(`✅ Check-in berhasil! ${found.userName} — Kursi #${found.seatNumber}`);
        }
      } else if (found) {
        toast.error('❌ Tiket valid tapi bukan untuk perjalanan ini');
      } else {
        toast.error('❌ Tiket tidak ditemukan');
      }
    }
    setScanOpen(false);
    setScanInput('');
  }, [bookings, scheduleId, checkInPassenger]);

  const handleScanSuccess = useCallback((decodedText: string) => {
    processTicketData(decodedText);
  }, [processTicketData]);

  const schedule = schedules.find(s => s.id === scheduleId);
  const route = routes.find(r => r.id === schedule?.routeId);
  const vehicle = vehicles.find(v => v.id === schedule?.vehicleId);
  const passengers = bookings.filter(b => b.scheduleId === scheduleId && b.status !== 'cancelled');
  const points = routePoints.filter(p => p.routeId === schedule?.routeId).sort((a, b) => a.order - b.order);

  if (!schedule || !route || !vehicle) return <div className="p-4">Data tidak ditemukan</div>;
    try {
      const parsed = JSON.parse(data);
      const bookingId = parsed.id;
      const found = bookings.find(b => b.id === bookingId);

      if (found && found.scheduleId === scheduleId) {
        if (found.checkedIn) {
          toast.warning(`⚠️ ${found.userName} sudah check-in sebelumnya (Kursi #${found.seatNumber})`);
        } else {
          checkInPassenger(found.id);
          toast.success(`✅ Check-in berhasil! ${found.userName} — Kursi #${found.seatNumber}`);
        }
      } else if (found) {
        toast.error('❌ Tiket valid tapi bukan untuk perjalanan ini');
      } else {
        toast.error('❌ Tiket tidak ditemukan');
      }
    } catch {
      // Not JSON — try as plain booking ID
      const found = bookings.find(b => b.id === data.trim());
      if (found && found.scheduleId === scheduleId) {
        if (found.checkedIn) {
          toast.warning(`⚠️ ${found.userName} sudah check-in sebelumnya`);
        } else {
          checkInPassenger(found.id);
          toast.success(`✅ Check-in berhasil! ${found.userName} — Kursi #${found.seatNumber}`);
        }
      } else if (found) {
        toast.error('❌ Tiket valid tapi bukan untuk perjalanan ini');
      } else {
        toast.error('❌ Tiket tidak ditemukan');
      }
    }
    setScanOpen(false);
    setScanInput('');
  }, [bookings, scheduleId, checkInPassenger]);

  const handleScanSuccess = useCallback((decodedText: string) => {
    processTicketData(decodedText);
  }, [processTicketData]);

  const handleManualScan = () => {
    if (!scanInput.trim()) return;
    processTicketData(scanInput.trim());
  };

  const handleAddPassenger = () => {
    if (!passengerName.trim() || !selectedPickup || !selectedSeat) {
      toast.error('Lengkapi semua data penumpang!');
      return;
    }
    const pickup = points.find(p => p.id === selectedPickup);
    if (!pickup) return;

    const seatNum = parseInt(selectedSeat);
    if (bookedSeats.includes(seatNum)) {
      toast.error('Kursi sudah terisi!');
      return;
    }

    const newBooking = {
      id: `b${Date.now()}`,
      userId: `rt-${Date.now()}`,
      userName: passengerName.trim(),
      scheduleId: schedule.id,
      routeId: route.id,
      routeName: route.name,
      pickupPointId: pickup.id,
      pickupPointName: pickup.name,
      seatNumber: seatNum,
      price: pickup.price,
      status: 'confirmed' as const,
      bookingDate: new Date().toISOString().split('T')[0],
      departureTime: schedule.departureTime,
      paymentStatus: 'paid' as const,
      paymentMethod: paymentMethod === 'cash' ? 'ewallet' as const : 'qris' as const,
      bookingType: 'realtime' as const,
    };

    addBooking(newBooking);
    toast.success(`✅ ${passengerName} ditambahkan! Kursi #${seatNum} · ${formatRupiah(pickup.price)}`);
    setPassengerName('');
    setSelectedPickup('');
    setSelectedSeat('');
    setPaymentMethod('cash');
    setAddPassengerOpen(false);
  };

  return (
    <div className="p-4 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/driver')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Button>

      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold">{route.name}</h2>
          <p className="text-sm opacity-80">{schedule.departureTime} · {vehicle.name}</p>
        </CardContent>
      </Card>

      {/* Status Controls */}
      <Card>
        <CardContent className="p-4 flex gap-2">
          {schedule.status === 'scheduled' && (
            <Button onClick={handleStart} className="flex-1 bg-secondary hover:bg-secondary/90">Mulai Perjalanan</Button>
          )}
          {(schedule.status === 'boarding' || schedule.status === 'departed') && (
            <Button onClick={handleFinish} className="flex-1">Selesai Perjalanan</Button>
          )}
          {schedule.status === 'arrived' && (
            <Badge className="bg-success text-success-foreground w-full text-center py-2">Perjalanan Selesai</Badge>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => { setScanOpen(true); setScanMode('camera'); }}>
          <QrCode className="h-4 w-4 mr-2" /> Scan QR
        </Button>
        {canAddPassenger && availableSeats.length > 0 && (
          <Button onClick={() => setAddPassengerOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
            <UserPlus className="h-4 w-4 mr-2" /> + Penumpang
          </Button>
        )}
        {canAddPassenger && availableSeats.length === 0 && (
          <Button disabled variant="outline">
            <UserPlus className="h-4 w-4 mr-2" /> Kursi Penuh
          </Button>
        )}
      </div>

      {/* Incoming Ride Requests */}
      {(() => {
        const pendingRequests = rideRequests.filter(r => r.scheduleId === scheduleId && r.status === 'pending');
        if (pendingRequests.length === 0) return null;
        return (
          <Card className="border-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-500" />
                Request Masuk ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingRequests.map(req => (
                <div key={req.id} className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{req.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 inline" /> {req.pickupPointName} · Kursi #{req.seatNumber} · {formatRupiah(req.price)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white h-8 px-2"
                      onClick={() => {
                        acceptRideRequest(req.id);
                        toast.success(`✅ ${req.userName} diterima!`);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 px-2"
                      onClick={() => {
                        rejectRideRequest(req.id);
                        toast.info(`❌ Request ${req.userName} ditolak`);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })()}

      {/* Seat Map */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Peta Kursi ({passengers.length}/{vehicle.capacity})</CardTitle></CardHeader>
        <CardContent>
          <div className={`grid gap-2 mx-auto ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`} style={{ maxWidth: cols === 3 ? '180px' : '120px' }}>
            {seats.map(seat => {
              const isBooked = bookedSeats.includes(seat.seatNumber);
              const passenger = passengers.find(p => p.seatNumber === seat.seatNumber);
              const isRealtime = passenger?.bookingType === 'realtime';
              const isCheckedIn = passenger?.checkedIn;
              return (
                <div
                  key={seat.seatNumber}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold relative ${
                    isBooked
                      ? isRealtime
                        ? 'bg-orange-500 text-white'
                        : 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  title={passenger ? `${passenger.userName} (${passenger.bookingType})${isCheckedIn ? ' ✓' : ''}` : 'Kosong'}
                >
                  {seat.seatNumber}
                  {isCheckedIn && (
                    <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-green-400 bg-background rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary inline-block" /> Terjadwal</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500 inline-block" /> Realtime</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted inline-block" /> Kosong</span>
          </div>
        </CardContent>
      </Card>

      {/* Passengers */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Daftar Penumpang</CardTitle>
            {passengers.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Check-in: {checkedInCount}/{passengers.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {passengers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada penumpang</p>
          ) : (
            passengers.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                <User className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{p.userName}</p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        p.bookingType === 'realtime'
                          ? 'border-orange-500 text-orange-600'
                          : 'border-primary text-primary'
                      }`}
                    >
                      {p.bookingType === 'realtime' ? 'Realtime' : 'Terjadwal'}
                    </Badge>
                    {p.checkedIn ? (
                      <Badge className="text-[10px] px-1.5 py-0 bg-green-500 text-white border-0">
                        ✓ Checked In
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                        Belum Check-in
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground"><MapPin className="h-3 w-3 inline" /> {p.pickupPointName} · {formatRupiah(p.price)}</p>
                </div>
                <Badge variant="outline">#{p.seatNumber}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Scan QR Dialog */}
      <Dialog open={scanOpen} onOpenChange={(open) => { setScanOpen(open); if (!open) setScanMode('camera'); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" /> Scan QR Tiket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Toggle camera/manual */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={scanMode === 'camera' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScanMode('camera')}
              >
                📷 Kamera
              </Button>
              <Button
                variant={scanMode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScanMode('manual')}
              >
                ⌨️ Manual
              </Button>
            </div>

            {scanMode === 'camera' ? (
              <QRScanner onScanSuccess={handleScanSuccess} />
            ) : (
              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Masukkan ID Booking secara manual</p>
                </div>
                <Input
                  placeholder="Contoh: b1"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualScan()}
                />
                <Button className="w-full" onClick={handleManualScan} disabled={!scanInput.trim()}>
                  Validasi & Check-in
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Passenger Dialog */}
      <Dialog open={addPassengerOpen} onOpenChange={setAddPassengerOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Tambah Penumpang</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nama Penumpang</label>
              <Input
                placeholder="Masukkan nama"
                value={passengerName}
                onChange={e => setPassengerName(e.target.value)}
              />
            </div>
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
                <p className="text-xs text-muted-foreground">Harga dari titik jemput</p>
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
            <div>
              <label className="text-sm font-medium mb-1 block">Metode Bayar</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className="w-full"
                >
                  💵 Cash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'qris' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('qris')}
                  className="w-full"
                >
                  📱 QRIS
                </Button>
              </div>
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleAddPassenger}
              disabled={!passengerName.trim() || !selectedPickup || !selectedSeat}
            >
              Tambahkan Penumpang
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverTripDetail;
