import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, User, MapPin, QrCode, UserPlus, Bell, Check, X, 
  CheckCircle2, Navigation, Signal, SignalHigh, SignalLow, 
  AlertTriangle, Power, Clock, Users, TrendingUp, Wallet, Phone, MessageSquare
} from 'lucide-react';
import { generateSeats } from '@/data/dummy';
import { formatPrice } from '@/lib/pricing';
import { toast } from 'sonner';
import QRScanner from '@/components/QRScanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { DriverStatusCard } from '@/components/DriverStatusCard';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateHaversineDistance, cn } from '@/lib/utils';
import { GPSStatus } from '@/types/shuttle';
import { TRIP_STATUS_CONFIG, DRIVER_TYPOGRAPHY, DRIVER_LAYOUT } from '@/lib/driver-ui';

const DriverTripDetail = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const {
    schedules, routes, routePoints, vehicles, bookings, drivers,
    addBooking, updateScheduleStatus, rideRequests,
    acceptRideRequest, rejectRideRequest, checkInPassenger,
    updateDriverStatus, currentUser
  } = useShuttle();

  const schedule = schedules.find(s => s.id === scheduleId);
  const route = routes.find(r => r.id === schedule?.routeId);
  const vehicle = vehicles.find(v => v.id === schedule?.vehicleId);
  const points = routePoints.filter(p => p.routeId === schedule?.routeId).sort((a, b) => a.order - b.order);

  const currentDriver = drivers.find(d => d.id === schedule?.driverId || d.id === (currentUser?.id || 'd1'));
  const isOnline = currentDriver?.status === 'online';

  // GPS & Geolocation Integration
  const { location, status: gpsStatus, error: gpsError } = useGeolocation({
    enableHighAccuracy: true,
    syncIntervalMs: 30000 // 30s interval
  }, isOnline);

  const [scanOpen, setScanOpen] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [addPassengerOpen, setAddPassengerOpen] = useState(false);
  const [passengerName, setPassengerName] = useState('');
  const [selectedPickup, setSelectedPickup] = useState('');
  const [selectedSeat, setSelectedSeat] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');

  // Geofencing logic
  useEffect(() => {
    if (location && points.length > 0) {
      points.forEach(point => {
        const dist = calculateHaversineDistance(
          location.latitude, location.longitude,
          point.lat, point.lng
        );
        if (dist <= 0.1) {
          const key = `geofence_notify_${point.id}`;
          if (!sessionStorage.getItem(key)) {
            toast.info(`📍 Anda mendekati ${point.name}`, { duration: 5000 });
            sessionStorage.setItem(key, 'true');
          }
        }
      });
    }
  }, [location, points]);

  const processTicketData = useCallback((data: string) => {
    const validate = (bookingId: string) => {
      const found = bookings.find(b => b.id === bookingId);
      if (found && found.scheduleId === scheduleId) {
        if (found.checkedIn) {
          toast.warning(`⚠️ ${found.userName} sudah check-in`);
        } else {
          checkInPassenger(found.id);
          toast.success(`✅ Check-in berhasil! ${found.userName}`);
        }
      } else if (found) {
        toast.error('❌ Tiket valid tapi bukan untuk perjalanan ini');
      } else {
        toast.error('❌ Tiket tidak ditemukan');
      }
    };

    try {
      const parsed = JSON.parse(data);
      validate(parsed.id);
    } catch {
      validate(data.trim());
    }
    setScanOpen(false);
    setScanInput('');
  }, [bookings, scheduleId, checkInPassenger]);

  const handleScanSuccess = useCallback((decodedText: string) => {
    processTicketData(decodedText);
  }, [processTicketData]);

  if (!schedule || !route || !vehicle) return <div className="p-4">Data tidak ditemukan</div>;

  const passengers = bookings.filter(b => b.scheduleId === scheduleId && b.status !== 'cancelled');
  const totalRevenue = passengers.reduce((sum, p) => sum + p.price, 0);

  const seats = generateSeats(vehicle.id);
  const bookedSeats = passengers.map(p => p.seatNumber);
  const availableSeats = seats.filter(s => !bookedSeats.includes(s.seatNumber));
  const cols = vehicle.capacity <= 8 ? 2 : 3;
  const canAddPassenger = schedule.status === 'boarding' || schedule.status === 'departed';
  const checkedInCount = passengers.filter(p => p.checkedIn).length;

  const handleStart = () => {
    updateScheduleStatus(schedule.id, 'departed');
    toast.success('Perjalanan dimulai!');
  };

  const handleFinish = () => {
    updateScheduleStatus(schedule.id, 'arrived');
    toast.success('Perjalanan selesai!');
  };

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
    toast.success(`✅ ${passengerName} ditambahkan!`);
    setPassengerName('');
    setSelectedPickup('');
    setSelectedSeat('');
    setAddPassengerOpen(false);
  };

  return (
    <div className={cn("p-4 pb-32", DRIVER_LAYOUT.sectionGap)}>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/driver')} 
          className="h-10 w-10 p-0 rounded-xl border-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className={DRIVER_TYPOGRAPHY.heading2}>Detail Perjalanan</h2>
      </div>

      {currentDriver && (
        <DriverStatusCard 
          driver={currentDriver} 
          onToggle={(status) => updateDriverStatus(currentDriver.id, status)} 
        />
      )}

      {/* Trip Info Spotlight Card */}
      <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white rounded-[2rem]">
        <CardContent className="p-0">
          <div className="bg-slate-900 p-6 text-white">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Rute Aktif</p>
                <h3 className="text-xl font-black leading-tight tracking-tight pr-4">{route.name}</h3>
              </div>
              <Badge className="bg-primary hover:bg-primary text-primary-foreground border-none text-[10px] font-black px-3 py-1.5 uppercase tracking-widest rounded-lg">
                {vehicle.plateNumber}
              </Badge>
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className={DRIVER_TYPOGRAPHY.caption}>Penumpang</p>
                <p className="text-lg font-black">{passengers.length}/{vehicle.capacity}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <SignalHigh className={cn(
                  "h-6 w-6",
                  gpsStatus === 'active' ? "text-emerald-500" : "text-amber-500"
                )} />
              </div>
              <div>
                <p className={DRIVER_TYPOGRAPHY.caption}>Status GPS</p>
                <p className={cn(
                  "text-lg font-black",
                  gpsStatus === 'active' ? "text-emerald-600" : "text-amber-600"
                )}>
                  {gpsStatus === 'active' ? 'Stabil' : 'Lemah'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => setScanOpen(true)}
          className="h-16 rounded-[1.25rem] gap-3 shadow-lg shadow-primary/20 text-md font-black uppercase tracking-wider"
        >
          <QrCode className="h-6 w-6" /> Scan Tiket
        </Button>
        <Button 
          variant="outline"
          onClick={() => setAddPassengerOpen(true)}
          className="h-16 rounded-[1.25rem] gap-3 border-slate-200 shadow-sm text-md font-black uppercase tracking-wider bg-white"
          disabled={!canAddPassenger}
        >
          <UserPlus className="h-6 w-6" /> Tambah
        </Button>
      </div>

      {/* Main Status Control - High Visibility */}
      <div className="sticky bottom-24 z-20 px-1">
        {schedule.status === 'scheduled' && (
          <Button 
            onClick={handleStart} 
            className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.25rem] font-black text-lg shadow-xl shadow-indigo-200 transition-all active:scale-95"
          >
            Mulai Perjalanan
          </Button>
        )}
        {(schedule.status === 'boarding' || schedule.status === 'departed') && (
          <Button 
            onClick={handleFinish} 
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.25rem] font-black text-lg shadow-xl shadow-emerald-200 transition-all active:scale-95"
          >
            Selesaikan Trip
          </Button>
        )}
        {schedule.status === 'arrived' && (
          <div className="w-full h-16 bg-slate-100 rounded-[1.25rem] flex items-center justify-center gap-3 text-slate-400 font-black text-lg border-2 border-dashed border-slate-200">
            <CheckCircle2 className="h-6 w-6" /> Trip Telah Selesai
          </div>
        )}
      </div>

      {/* Incoming Ride Requests (Real-time) */}
      {(() => {
        const pendingRequests = rideRequests.filter(r => r.scheduleId === scheduleId && r.status === 'pending');
        if (pendingRequests.length === 0) return null;
        return (
          <div className="space-y-3">
            <h3 className={cn(DRIVER_TYPOGRAPHY.caption, "text-orange-600 flex items-center gap-2 px-1")}>
              <Bell className="h-3 w-3 animate-bounce" /> Request Masuk
            </h3>
            <div className="space-y-2">
              {pendingRequests.map(req => (
                <Card key={req.id} className="border-orange-200 bg-orange-50 shadow-sm overflow-hidden rounded-2xl">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800">{req.userName}</p>
                      <p className="text-[10px] text-orange-700 font-bold uppercase tracking-tight flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {req.pickupPointName} · Kursi #{req.seatNumber}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 w-10 p-0 rounded-xl"
                        onClick={() => acceptRideRequest(req.id)}
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-500 hover:bg-rose-100 h-10 w-10 p-0 rounded-xl"
                        onClick={() => rejectRideRequest(req.id)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Seat Map Visualizer */}
      <Card className="border-none shadow-sm bg-white rounded-[2rem]">
        <CardHeader className="pb-2">
          <CardTitle className={DRIVER_TYPOGRAPHY.caption}>Visualisasi Kursi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-3 mx-auto ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`} style={{ maxWidth: cols === 3 ? '220px' : '140px' }}>
            {seats.map(seat => {
              const isBooked = bookedSeats.includes(seat.seatNumber);
              const passenger = passengers.find(p => p.seatNumber === seat.seatNumber);
              const isRealtime = passenger?.bookingType === 'realtime';
              const isCheckedIn = passenger?.checkedIn;
              return (
                <div
                  key={seat.seatNumber}
                  className={cn(
                    "aspect-square rounded-[1rem] flex items-center justify-center text-sm font-black relative transition-all border-2",
                    isBooked
                      ? isRealtime
                        ? 'bg-orange-500 text-white border-orange-600'
                        : 'bg-slate-900 text-white border-slate-950'
                      : 'bg-slate-50 text-slate-300 border-slate-100'
                  )}
                >
                  {seat.seatNumber}
                  {isCheckedIn && (
                    <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-md border-2 border-white">
                      <Check className="h-3 w-3 stroke-[3px]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-900" /> Reguler</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-500" /> Realtime</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200" /> Kosong</span>
          </div>
        </CardContent>
      </Card>

      {/* Passenger List Refined */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className={DRIVER_TYPOGRAPHY.heading3}>Penumpang</h3>
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-black text-[10px] px-2 py-1 uppercase tracking-widest">
            {checkedInCount}/{passengers.length} Terdata
          </Badge>
        </div>
        
        {passengers.length === 0 ? (
          <Card className="border-dashed border-2 bg-slate-50/50 rounded-[2rem]">
            <CardContent className="p-12 text-center text-slate-300 font-bold text-xs uppercase tracking-widest italic">
              Kosong
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {passengers.map(p => (
              <Card key={p.id} className={cn(
                "border-none shadow-sm transition-all overflow-hidden rounded-2xl bg-white group",
                p.checkedIn ? "opacity-60" : "opacity-100"
              )}>
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className={cn(
                      "w-14 flex items-center justify-center font-black text-lg border-r border-slate-50",
                      p.checkedIn ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                    )}>
                      {p.seatNumber}
                    </div>
                    <div className="p-4 flex-1 flex items-center justify-between min-w-0">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-800 truncate">{p.userName}</p>
                          {p.bookingType === 'realtime' && (
                            <Badge className="bg-orange-100 text-orange-700 border-none text-[8px] h-4 font-black px-1.5">RT</Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1 mt-1">
                          <MapPin className="h-2.5 w-2.5" /> {p.pickupPointName}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-slate-50 text-slate-400">
                           <Phone className="h-4 w-4" />
                         </Button>
                         {p.checkedIn ? (
                          <div className="bg-emerald-500 text-white rounded-xl p-2 shadow-lg shadow-emerald-100">
                            <Check className="h-5 w-5 stroke-[3px]" />
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] px-4 rounded-xl uppercase tracking-widest shadow-md shadow-primary/10"
                            onClick={() => checkInPassenger(p.id)}
                          >
                            Check-in
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Revenue Estimation Sticky Summary */}
      <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[2rem] overflow-hidden relative">
        <div className="absolute bottom-0 right-0 p-4 opacity-5 translate-y-4 translate-x-4">
          <Wallet className="h-24 w-24" />
        </div>
        <CardContent className="p-6 flex justify-between items-center relative z-10">
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Estimasi Pendapatan</p>
            <p className="text-3xl font-black mt-1 text-primary-foreground tracking-tighter">{formatPrice(totalRevenue)}</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <TrendingUp className="h-7 w-7 text-primary-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Scan QR Dialog Refined */}
      <Dialog open={scanOpen} onOpenChange={(open) => { setScanOpen(open); if (!open) setScanMode('camera'); }}>
        <DialogContent className="max-w-sm rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-black text-xl"><QrCode className="h-6 w-6 text-primary" /> Scan Tiket</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Arahkan kamera ke QR tiket penumpang.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
              <Button 
                variant={scanMode === 'camera' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setScanMode('camera')}
                className={cn("rounded-xl font-black text-[10px] uppercase tracking-widest", scanMode === 'camera' ? "shadow-md" : "text-slate-500")}
              >
                Kamera
              </Button>
              <Button 
                variant={scanMode === 'manual' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setScanMode('manual')}
                className={cn("rounded-xl font-black text-[10px] uppercase tracking-widest", scanMode === 'manual' ? "shadow-md" : "text-slate-500")}
              >
                Manual
              </Button>
            </div>

            {scanMode === 'camera' ? (
              <div className="overflow-hidden rounded-[1.5rem] border-4 border-slate-50 shadow-inner bg-black aspect-square flex items-center justify-center">
                <ErrorBoundary>
                  <QRScanner onScanSuccess={handleScanSuccess} />
                </ErrorBoundary>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  placeholder="ID Booking (e.g. b1)"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  className="h-14 rounded-2xl border-slate-200 font-bold text-center text-lg uppercase"
                />
                <Button className="w-full h-14 rounded-2xl font-black text-md uppercase tracking-widest" onClick={handleManualScan} disabled={!scanInput.trim()}>
                  Validasi Tiket
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Passenger Dialog Refined */}
      <Dialog open={addPassengerOpen} onOpenChange={setAddPassengerOpen}>
        <DialogContent className="max-w-sm rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-black text-xl"><UserPlus className="h-6 w-6 text-primary" /> Penumpang Baru</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Isi data penumpang naik di tengah jalan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div className="space-y-1.5">
              <Label className={DRIVER_TYPOGRAPHY.caption}>Nama Penumpang</Label>
              <Input placeholder="Nama lengkap" value={passengerName} onChange={e => setPassengerName(e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className={DRIVER_TYPOGRAPHY.caption}>Titik Jemput</Label>
              <Select value={selectedPickup} onValueChange={setSelectedPickup}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pilih lokasi" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {points.filter(p => p.distanceToDestination > 0).map(p => (
                    <SelectItem key={p.id} value={p.id} className="rounded-lg">{p.name} · {formatPrice(p.price)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPickup && (
              <div className="bg-primary/5 rounded-2xl p-4 text-center border border-primary/10">
                <p className="text-[10px] text-primary/60 font-black uppercase tracking-[0.2em] mb-1">Total Bayar</p>
                <p className="text-2xl font-black text-primary tracking-tight">{formatPrice(points.find(p => p.id === selectedPickup)?.price || 0)}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className={DRIVER_TYPOGRAPHY.caption}>Pilih Kursi</Label>
              <Select value={selectedSeat} onValueChange={setSelectedSeat}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Kursi kosong" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {availableSeats.map(s => (
                    <SelectItem key={s.seatNumber} value={String(s.seatNumber)} className="rounded-lg">Nomor #{s.seatNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={DRIVER_TYPOGRAPHY.caption}>Metode Pembayaran</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('cash')} className="h-12 rounded-xl font-bold">💵 Tunai</Button>
                <Button type="button" variant={paymentMethod === 'qris' ? 'default' : 'outline'} onClick={() => setPaymentMethod('qris')} className="h-12 rounded-xl font-bold">📱 QRIS</Button>
              </div>
            </div>
            <Button className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest mt-2" onClick={handleAddPassenger} disabled={!passengerName.trim() || !selectedPickup || !selectedSeat}>
              Konfirmasi & Tambah
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverTripDetail;
