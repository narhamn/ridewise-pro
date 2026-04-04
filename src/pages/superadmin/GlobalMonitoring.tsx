import { useState } from "react";
import { useShuttle } from "@/contexts/ShuttleContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  UserX, 
  Users,
  AlertCircle,
  Truck,
  CreditCard,
  MapPin,
  Star,
  Calendar,
  Image as ImageIcon,
  FileText
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRupiah } from "@/data/dummy";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const GlobalMonitoring = () => {
  const { bookings, drivers, vehicles, transactions, setDrivers, addAuditLog, currentUser } = useShuttle();
  const [searchTerm, setSearchTerm] = useState("");
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [suspendDays, setSuspendDays] = useState("1");
  const [suspendReason, setSuspendReason] = useState("");

  const handleSuspend = () => {
    if (!selectedDriver) return;
    if (!suspendReason) {
      toast.error("Alasan penangguhan wajib diisi");
      return;
    }
    const days = parseInt(suspendDays);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    setDrivers(prev => prev.map(d => d.id === selectedDriver.id ? { 
      ...d, 
      status: 'suspended',
      suspensionEnd: endDate.toISOString(),
      suspensionReason: suspendReason
    } : d));

    addAuditLog('Suspend Driver', `Super Admin ${currentUser?.name} suspended driver ${selectedDriver.name} for ${days} days. Reason: ${suspendReason}`);
    toast.success(`Driver ${selectedDriver.name} ditangguhkan selama ${days} hari`);
    setSuspendOpen(false);
  };

  const exportCSV = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Global</h1>
          <p className="text-muted-foreground text-sm">Pemantauan menyeluruh terhadap booking, driver, armada, dan transaksi.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCSV(bookings, 'all_bookings')}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="bookings" className="data-[state=active]:bg-white">
            <Calendar className="h-4 w-4 mr-2" /> Bookings
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-white">
            <Users className="h-4 w-4 mr-2" /> Drivers
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-white">
            <Truck className="h-4 w-4 mr-2" /> Armada
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-white">
            <CreditCard className="h-4 w-4 mr-2" /> Transaksi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Log Booking Real-time</CardTitle>
                <CardDescription>Seluruh riwayat pemesanan di platform.</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari ID, User, Rute..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rute</TableHead>
                    <TableHead>Tanggal & Jam</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(bookings || []).filter(b => b && b.id).map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs font-bold">{b.id}</TableCell>
                      <TableCell>{b.userName || 'N/A'}</TableCell>
                      <TableCell>{b.routeName || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{b.bookingDate || 'N/A'}</span>
                          <span className="text-[10px] text-muted-foreground">{b.departureTime || 'N/A'} WIB</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{formatRupiah(b.price || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'}>
                          {b.status || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-emerald-500 rounded-lg text-white"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-emerald-700 font-bold uppercase">Driver Online</p>
                  <p className="text-2xl font-black text-emerald-900">{drivers.filter(d => d.status === 'active').length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-100">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-orange-500 rounded-lg text-white"><UserX className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-orange-700 font-bold uppercase">Suspended</p>
                  <p className="text-2xl font-black text-orange-900">{drivers.filter(d => d.status === 'suspended').length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Total Trip</TableHead>
                    <TableHead>Saldo Wallet</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(drivers || []).filter(d => d && d.id).map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{d.name || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{d.phone || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={d.status === 'active' ? 'default' : d.status === 'suspended' ? 'destructive' : 'secondary'}>
                          {d.status || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold">{d.rating || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>{d.totalTrips || 0} Trip</TableCell>
                      <TableCell className="font-mono text-sm">{formatRupiah(d.walletBalance || 0)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedDriver(d); setSuspendOpen(true); }}>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive"><UserX className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(vehicles || []).filter(v => v && v.id).map((v) => (
              <Card key={v.id} className="overflow-hidden border-none shadow-lg group">
                <div className="relative aspect-video bg-slate-100">
                  <img src={v.imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957'} alt={v.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2">
                    <Badge className={v.status === 'active' ? 'bg-emerald-500' : 'bg-orange-500'}>
                      {v.status || 'unknown'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{v.name || 'N/A'}</h3>
                      <p className="text-xs font-mono text-muted-foreground">{v.plateNumber || 'N/A'}</p>
                    </div>
                    <Badge variant="outline">{v.type || 'N/A'}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="text-[10px] h-8">
                      <FileText className="h-3 w-3 mr-1" /> STNK
                    </Button>
                    <Button variant="outline" size="sm" className="text-[10px] h-8">
                      <ImageIcon className="h-3 w-3 mr-1" /> Foto
                    </Button>
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground uppercase font-bold">Next Maintenance</span>
                      <span className="font-bold text-orange-600">{v.nextMaintenanceDate || 'N/A'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-[70%]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>History Transaksi Platform</CardTitle>
                <CardDescription>Pemantauan aliran dana, fee, dan refund.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Total Nominal</TableHead>
                    <TableHead>Fee Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(transactions || []).filter(t => t && t.id).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-[10px]">{t.id}</TableCell>
                      <TableCell>{t.userName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase text-[9px]">{t.type || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium uppercase">{(t.method || 'unknown').replace('_', ' ')}</TableCell>
                      <TableCell className="font-bold">{formatRupiah(t.amount || 0)}</TableCell>
                      <TableCell className="text-emerald-600 font-bold">+{formatRupiah(t.platformFee || 0)}</TableCell>
                      <TableCell>
                        <Badge className={t.status === 'success' ? 'bg-emerald-500' : 'bg-orange-500'}>{t.status || 'unknown'}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.timestamp || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Suspend Dialog */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              Tangguhkan Driver
            </DialogTitle>
            <DialogDescription>
              Tangguhkan akses driver <strong>{selectedDriver?.name}</strong> untuk sementara.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Durasi Penangguhan</Label>
              <Select value={suspendDays} onValueChange={setSuspendDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih durasi..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hari (Peringatan Ringan)</SelectItem>
                  <SelectItem value="7">7 Hari (Pelanggaran Sedang)</SelectItem>
                  <SelectItem value="30">30 Hari (Pelanggaran Berat)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Alasan Penangguhan (Wajib)</Label>
              <Input 
                placeholder="Contoh: Pembatalan sepihak berulang..." 
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSuspendOpen(false)}>Batal</Button>
            <Button variant="default" className="bg-orange-600 hover:bg-orange-700" onClick={handleSuspend}>Konfirmasi Suspend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlobalMonitoring;
