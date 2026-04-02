import { QRCodeSVG } from 'qrcode.react';
import { Booking } from '@/types/shuttle';
import { formatRupiah } from '@/data/dummy';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Armchair, Bus } from 'lucide-react';

interface ETicketProps {
  booking: Booking;
  compact?: boolean;
}

export const ETicket = ({ booking, compact = false }: ETicketProps) => {
  const qrData = JSON.stringify({
    id: booking.id,
    scheduleId: booking.scheduleId,
    seat: booking.seatNumber,
    route: booking.routeName,
  });

  if (compact) {
    return (
      <Card className="border-l-4 border-l-primary overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-sm">{booking.routeName}</h3>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.departureTime}</span>
                <span className="flex items-center gap-1"><Armchair className="h-3 w-3" /> #{booking.seatNumber}</span>
              </div>
              <p className="font-bold text-primary text-sm">{formatRupiah(booking.price)}</p>
            </div>
            <QRCodeSVG value={qrData} size={56} level="M" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden print:shadow-none" id={`ticket-${booking.id}`}>
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6" />
            <div>
              <h3 className="font-bold text-lg">ShuttleKu</h3>
              <p className="text-xs opacity-80">E-Ticket</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">ID Booking</p>
            <p className="font-mono text-sm font-bold">{booking.id.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Route */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Rute</p>
          <p className="text-xl font-bold">{booking.routeName}</p>
        </div>

        <Separator />

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Tanggal & Waktu</p>
              <p className="text-sm font-medium">{booking.bookingDate}</p>
              <p className="text-sm font-bold">{booking.departureTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Armchair className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Kursi</p>
              <p className="text-2xl font-bold text-primary">#{booking.seatNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-secondary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Titik Jemput</p>
              <p className="text-sm font-medium">{booking.pickupPointName}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Penumpang</p>
            <p className="text-sm font-medium">{booking.userName}</p>
          </div>
        </div>

        <Separator />

        {/* QR + Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Harga</p>
            <p className="text-2xl font-bold text-primary">{formatRupiah(booking.price)}</p>
            {booking.paymentStatus === 'paid' && (
              <span className="text-xs text-success font-medium">✓ Lunas</span>
            )}
          </div>
          <div className="bg-card p-2 rounded-lg border">
            <QRCodeSVG value={qrData} size={80} level="M" />
          </div>
        </div>

        {/* Barcode ID */}
        <div className="text-center pt-2 border-t border-dashed">
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground">{booking.id.toUpperCase()}</p>
        </div>
      </CardContent>
    </Card>
  );
};
