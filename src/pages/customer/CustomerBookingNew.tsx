import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Ticket, Percent, Info, AlertCircle, CheckCircle2, Loader2, Navigation, Sparkles } from 'lucide-react';
import { generateSeats } from '@/data/dummy';
import { calculateFinalPrice, formatPrice } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PaymentModal } from '@/components/PaymentModal';
import { PaymentMethod, Discount } from '@/types/shuttle';

const CustomerBookingNew = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    routes, routePoints, schedules, vehicles, bookings, 
    addBooking, setBookings, currentUser,
    discounts, taxConfigs, createSecureBooking
  } = useShuttle();

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
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Discount | null>(null);
  const [promoError, setPromoError] = useState('');

  const pickupPoint = points.find(p => p.id === selectedPickup);
  const basePrice = pickupPoint?.price || route?.price || 0;

  // Calculate pricing details
  const pricingDetails = useMemo(() => {
    if (!route) return null;
    
    const activeTax = taxConfigs.find(t => t.isActive);
    const taxRate = activeTax?.rate || 0;
    
    // We treat 'price' as already having multipliers applied from context
    // So we use a distance of 1 and pricePerMeter as the basePrice
    return calculateFinalPrice(1, basePrice, {
      discountRate: appliedPromo?.type === 'percentage' ? appliedPromo.value / 100 : 0,
      discountFixed: appliedPromo?.type === 'fixed' ? appliedPromo.value : 0,
      maxDiscount: appliedPromo?.maxDiscountAmount,
      taxRate: taxRate,
    });
  }, [basePrice, appliedPromo, route, taxConfigs]);

  const handleApplyPromo = () => {
    setPromoError('');
    if (!promoCode.trim()) return;

    const promo = discounts.find(d => d.code.toUpperCase() === promoCode.toUpperCase());
    
    if (!promo) {
      setPromoError('Kode promo tidak ditemukan');
      setAppliedPromo(null);
      return;
    }

    if (!promo.isActive) {
      setPromoError('Promo ini sudah tidak aktif');
      setAppliedPromo(null);
      return;
    }

    const now = new Date();
    if (now < new Date(promo.startDate) || now > new Date(promo.endDate)) {
      setPromoError('Promo sudah kedaluwarsa atau belum dimulai');
      setAppliedPromo(null);
      return;
    }

    if (promo.usageCount >= promo.usageLimit) {
      setPromoError('Kuota promo sudah habis');
      setAppliedPromo(null);
      return;
    }

    if (basePrice < promo.minBookingAmount) {
      setPromoError(`Minimum transaksi untuk promo ini adalah ${formatPrice(promo.minBookingAmount)}`);
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(promo);
    toast.success(`Promo ${promo.code} berhasil digunakan!`);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

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
    
    setIsProcessing(true);
    
    // Simulasi delay network
    setTimeout(() => {
      const response = createSecureBooking({
        userId: currentUser?.id || 'u1',
        scheduleId,
        pickupPointId: selectedPickup,
        seatNumber: selectedSeat,
        promoCode: appliedPromo?.code,
        bookingType: 'scheduled'
      });

      if (response.success && response.booking) {
        setLastBookingId(response.booking.id);
        setShowPayment(true);
      } else {
        toast.error(response.error || "Gagal membuat booking");
      }
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="min-h-full bg-background pb-10 animate-in fade-in duration-500">
      <div className="p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-black tracking-tight text-foreground">Buat Booking</h2>
      </div>

      <div className="px-4 space-y-6">
        {/* Journey Summary */}
        <div className="bg-primary p-6 rounded-[32px] text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden group">
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Rute Perjalanan</p>
                <h3 className="text-xl font-black leading-tight">{route.name}</h3>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Waktu</p>
                  <p className="text-sm font-bold">{schedule.departureTime}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Tanggal</p>
                  <p className="text-sm font-bold">{format(new Date(schedule.departureDate), 'dd MMM yyyy', { locale: localeId })}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <Navigation className="h-6 w-6 fill-current" />
            </div>
          </div>
          <Sparkles className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
        </div>

        {/* Pickup Selection */}
        <section className="space-y-3">
          <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground/80 px-1">Titik Jemput</h3>
          <Select value={selectedPickup} onValueChange={setSelectedPickup}>
            <SelectTrigger className="h-16 rounded-2xl border-border/50 bg-card font-bold transition-all focus:ring-primary/20">
              <SelectValue placeholder="Pilih lokasi penjemputan" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              {points.filter(p => p.distanceToDestination > 0).map(p => (
                <SelectItem key={p.id} value={p.id} className="py-3 rounded-xl focus:bg-primary/5">
                  <div className="flex flex-col">
                    <span className="font-black text-sm">{p.name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                      {formatPrice(p.price)} • {(p.distanceToDestination / 1000).toFixed(0)} KM ke tujuan
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Seat Selection */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground/80">Pilih Kursi</h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-[10px] font-black uppercase opacity-60">Tersedia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase opacity-60">Dipilih</span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-[32px] p-8 border border-border/40">
            <div className="max-w-[180px] mx-auto space-y-8">
              {/* Cockpit Area */}
              <div className="flex justify-between items-center opacity-40">
                <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-current border-t-transparent" />
                </div>
                <div className="px-3 py-1 rounded-full border border-current text-[10px] font-black uppercase tracking-widest">Driver</div>
              </div>

              {/* Seats Grid */}
              <div className={`grid gap-4 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {seats.map(seat => {
                  const isBooked = bookedSeats.includes(seat.seatNumber);
                  const isSelected = selectedSeat === seat.seatNumber;
                  return (
                    <button
                      key={seat.seatNumber}
                      disabled={isBooked}
                      onClick={() => setSelectedSeat(isSelected ? null : seat.seatNumber)}
                      className={cn(
                        "relative aspect-square rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-300",
                        isBooked ? "bg-muted text-muted-foreground/30 cursor-not-allowed grayscale" :
                        isSelected ? "bg-primary text-primary-foreground scale-110 shadow-xl shadow-primary/30 z-10" :
                        "bg-success/10 text-success hover:bg-success/20 hover:scale-105"
                      )}
                    >
                      {seat.seatNumber}
                      {isSelected && <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 fill-primary text-primary-foreground shadow-sm" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Promo Code */}
        <section className="space-y-3">
          <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground/80 px-1">Kode Promo</h3>
          <div className={cn(
            "p-4 rounded-[24px] border border-border/50 transition-all",
            appliedPromo ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20" : "bg-card"
          )}>
            {!appliedPromo ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    placeholder="KODE PROMO" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="pl-9 h-12 rounded-xl border-border/50 bg-background font-black tracking-widest uppercase placeholder:font-bold placeholder:tracking-normal focus-visible:ring-primary/20"
                  />
                </div>
                <Button 
                  onClick={handleApplyPromo} 
                  disabled={!promoCode}
                  className="h-12 rounded-xl px-6 font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                  Pakai
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-xl text-primary">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-primary tracking-widest">{appliedPromo.code}</p>
                    <p className="text-[10px] font-bold text-primary/60 uppercase">{appliedPromo.description}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRemovePromo}
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-black text-[10px] uppercase"
                >
                  Hapus
                </Button>
              </div>
            )}
            {promoError && (
              <p className="mt-2 text-[10px] font-bold text-rose-500 flex items-center gap-1.5 px-1 uppercase tracking-tight">
                <AlertCircle className="h-3.5 w-3.5" /> {promoError}
              </p>
            )}
          </div>
        </section>

        {/* Payment Summary */}
        <Card className="rounded-[32px] border-none bg-muted/30 overflow-hidden shadow-inner">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground/80">Rincian Pembayaran</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Harga Tiket</span>
                <span className="font-black text-foreground">{formatPrice(pricingDetails?.basePrice || basePrice)}</span>
              </div>
              {pricingDetails?.discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-primary uppercase text-[10px] tracking-widest">Diskon</span>
                  <span className="font-black text-primary">-{formatPrice(pricingDetails.discountAmount)}</span>
                </div>
              )}
              {pricingDetails && pricingDetails.taxAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Pajak (11%)</span>
                  <span className="font-black text-foreground">{formatPrice(pricingDetails.taxAmount)}</span>
                </div>
              )}
              <Separator className="bg-border/40" />
              <div className="flex justify-between items-center">
                <span className="font-black text-foreground uppercase text-xs tracking-widest">Total Bayar</span>
                <span className="text-2xl font-black text-primary tracking-tighter">
                  {formatPrice(pricingDetails?.finalPrice || basePrice)}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Button 
              className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/30 transition-all hover:shadow-2xl active:scale-95"
              onClick={handleBooking}
              disabled={!selectedSeat || !selectedPickup || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Bayar Sekarang'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <PaymentModal 
        open={showPayment} 
        onClose={() => setShowPayment(false)}
        amount={pricingDetails?.finalPrice || basePrice}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
};

export default CustomerBookingNew;
