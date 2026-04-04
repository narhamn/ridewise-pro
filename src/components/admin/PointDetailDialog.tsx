import { useState, useEffect } from "react";
import { RoutePoint, Booking } from "@/types/shuttle";
import { useShuttle } from "@/contexts/ShuttleContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Clock,
  Navigation,
  History,
  Info,
  Loader2,
  Map as MapIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PointDetailDialogProps {
  point: RoutePoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PointDetailDialog = ({
  point,
  open,
  onOpenChange,
}: PointDetailDialogProps) => {
  const { bookings, rayons } = useShuttle();
  const [loading, setLoading] = useState(true);
  const [pointBookings, setPointBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (point && open) {
      setLoading(true);
      // Simulate API call to fetch details
      const timer = setTimeout(() => {
        const filteredBookings = bookings.filter(
          (b) => b.pickupPointId === point.id
        );
        setPointBookings(filteredBookings);
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [point, open, bookings]);

  if (!point) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] sm:h-auto overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{point.name}</DialogTitle>
              <DialogDescription>
                Informasi detail dan riwayat pemesanan di titik {point.code}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">
              Memuat data titik jemput...
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-1">
            <div className="space-y-6 py-4">
              {/* Image Section */}
              <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                <img
                  src={
                    point.imageUrl ||
                    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
                  }
                  alt={point.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="backdrop-blur-md bg-white/50">
                    <MapIcon className="h-3 w-3 mr-1" /> {point.lat}, {point.lng}
                  </Badge>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Harga Tiket</p>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/20 p-2 rounded-lg">
                        <Navigation className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xl font-black text-primary">
                        {(point as any).price > 0 ? (
                          new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format((point as any).price)
                        ) : (
                          "FREE / DEST"
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Rayon</p>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/20 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xl font-black text-primary">
                        {rayons.find((rayon) => rayon.id === point.rayonId)?.name || 'Rayon tidak tersedia'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Booking</p>
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-500/20 p-2 rounded-lg">
                        <History className="h-4 w-4 text-emerald-600" />
                      </div>
                      <p className="text-xl font-black text-emerald-600">{pointBookings.length} Trip</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Address & Notes */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4" /> Alamat Lengkap
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {point.address || "Alamat lengkap belum tersedia untuk lokasi ini."}
                  </p>
                </div>

                {point.notes && (
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="h-4 w-4 p-0 flex items-center justify-center rounded-full text-[10px]">!</Badge> Catatan
                    </h4>
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-100 dark:border-amber-900/50">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        {point.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Booking History */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" /> Riwayat Pemesanan Terakhir
                </h4>
                
                {pointBookings.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">Belum ada riwayat pemesanan di lokasi ini.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pointBookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{booking.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(booking.bookingDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
