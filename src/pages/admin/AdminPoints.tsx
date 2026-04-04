import { useEffect, useMemo, useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { Plus, Trash2, Edit, Eye, MapPin, Loader2, Download, FileText, Search, Filter } from 'lucide-react';
import { MAP_LAYERS } from '@/components/map/MapController';
import { toast } from 'sonner';
import { RoutePoint } from '@/types/shuttle';
import { PointEditDialog } from '@/components/admin/PointEditDialog';
import { PointDetailDialog } from '@/components/admin/PointDetailDialog';
import PickupPointMap from '@/components/admin/PickupPointMap';
import { Textarea } from '@/components/ui/textarea';
import { exportPickupPointsToExcel, exportPickupPointsToPdf } from '@/lib/exportUtils';

const AdminPoints = () => {
  const context = useShuttle();
  
  if (!context) return null;
  
  const { routePoints = [], setRoutePoints, routes = [], rayons = [], addAuditLog } = context;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoute, setFilterRoute] = useState('all');
  const [filterRayon, setFilterRayon] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({ 
    routeId: '', 
    rayonId: '',
    code: '', 
    name: '', 
    order: 1, 
    address: '', 
    lat: -6.2088, 
    lng: 106.8456, 
    notes: '',
    price: 0,
    status: 'active'
  });

  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!form.routeId) {
      setForm((prev) => ({ ...prev, rayonId: '' }));
      return;
    }

    const route = routes.find((r) => r.id === form.routeId);
    if (route && form.rayonId !== route.rayonId) {
      setForm((prev) => ({ ...prev, rayonId: route.rayonId }));
    }
  }, [form.routeId, form.rayonId, routes]);

  useEffect(() => {
    if (!open || routes.length === 0) return;
    if (!form.routeId) {
      const defaultRoute = routes[0];
      setForm((prev) => ({
        ...prev,
        routeId: defaultRoute.id,
        rayonId: defaultRoute.rayonId,
        order: routePoints.filter((p) => p.routeId === defaultRoute.id).length + 1,
      }));
    }
  }, [open, routes, form.routeId, routePoints]);

  const filtered = useMemo(() => {
    return routePoints
      .filter((point) => {
        const routeMatch = filterRoute === 'all' || point.routeId === filterRoute;
        const rayonMatch = filterRayon === 'all' || point.rayonId === filterRayon;
        const statusMatch = filterStatus === 'all' || point.status === filterStatus;
        const searchMatch =
          point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          point.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (routes.find((route) => route.id === point.routeId)?.name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (rayons.find((rayon) => rayon.id === point.rayonId)?.name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        return routeMatch && rayonMatch && statusMatch && searchMatch;
      })
      .sort((a, b) => a.order - b.order);
  }, [routePoints, routes, rayons, filterRoute, filterRayon, filterStatus, searchTerm]);

  const handleSave = async () => {
    if (!form.routeId || !form.rayonId || !form.name || !form.code) {
      toast.error('Mohon lengkapi data wajib (Rute, Rayon, Nama, Kode)');
      return;
    }

    const normalizedCode = form.code.trim().toLowerCase();
    const normalizedName = form.name.trim().toLowerCase();
    const duplicate = routePoints.some((point) =>
      point.routeId === form.routeId && (
        point.code.trim().toLowerCase() === normalizedCode ||
        point.name.trim().toLowerCase() === normalizedName ||
        (point.lat === form.lat && point.lng === form.lng)
      )
    );

    if (duplicate) {
      toast.error('Titik jemput duplikat terdeteksi pada rute ini. Periksa Kode, Nama, atau koordinat.');
      return;
    }

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newPoint: RoutePoint = {
        id: `rp${Date.now()}`,
        ...form,
      };

      setRoutePoints((prev) => [...prev, newPoint]);
      addAuditLog?.(
        'Tambah Titik Jemput',
        `Titik ${newPoint.name} (${newPoint.code}) ditambahkan pada rute ${routes.find((r) => r.id === newPoint.routeId)?.name || newPoint.routeId}`
      );
      toast.success('Titik jemput berhasil ditambahkan');
      setOpen(false);
      setForm({
        routeId: '',
        rayonId: '',
        code: '',
        name: '',
        order: routePoints.length + 1,
        address: '',
        lat: -6.2088,
        lng: 106.8456,
        notes: '',
        price: 0,
        status: 'active',
      });
    } catch (error) {
      toast.error('Gagal menambahkan titik jemput');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus titik jemput ini?')) {
      setRoutePoints((prev) => prev.filter((p) => p.id !== id));
      addAuditLog?.('Hapus Titik Jemput', `Titik jemput dengan ID ${id} dihapus`);
      toast.success('Titik jemput berhasil dihapus');
    }
  };

  const totals = useMemo(() => ({
    all: routePoints.length,
    active: routePoints.filter((p) => p.status === 'active').length,
    inactive: routePoints.filter((p) => p.status === 'inactive').length,
    rayons: rayons.map((rayon) => ({
      ...rayon,
      pointCount: routePoints.filter((point) => point.rayonId === rayon.id).length,
    })),
  }), [routePoints, rayons]);

  const handleExportExcel = () => {
    exportPickupPointsToExcel(filtered, routes, rayons);
  };

  const handleExportPdf = () => {
    exportPickupPointsToPdf(filtered, routes, rayons);
  };

  const openEdit = (point: RoutePoint) => {
    setSelectedPoint(point);
    setEditOpen(true);
  };

  const openDetail = (point: RoutePoint) => {
    setSelectedPoint(point);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Titik Penjemputan</h1>
          <p className="text-muted-foreground">Kelola lokasi penjemputan penumpang untuk setiap rute.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" />Tambah Titik</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[calc(100vh-4rem)] overflow-auto">
            <DialogHeader>
              <DialogTitle>Tambah Titik Jemput</DialogTitle>
              <DialogDescription>
                Daftarkan titik koordinat penjemputan baru untuk rute tertentu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Rute</Label>
                  <Select value={form.routeId} onValueChange={(v) => setForm({ ...form, routeId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih rute" /></SelectTrigger>
                    <SelectContent>
                      {routes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rayon</Label>
                  <Select value={form.rayonId} onValueChange={(v) => setForm({ ...form, rayonId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih rayon" /></SelectTrigger>
                    <SelectContent>
                      {rayons.map((rayon) => (
                        <SelectItem key={rayon.id} value={rayon.id}>{rayon.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as RoutePoint['status'] })}>
                    <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Non-aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kode Titik</Label>
                  <Input placeholder="J1" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Urutan</Label>
                  <Input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Nama Lokasi</Label>
                <Input placeholder="Contoh: Halte Terminal" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Alamat Lengkap</Label>
                <Textarea placeholder="Alamat jalan, nomor, dsb..." value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" step="any" value={form.lat} onChange={e => setForm({...form, lat: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" step="any" value={form.lng} onChange={e => setForm({...form, lng: Number(e.target.value)})} />
                </div>
              </div>

              <Card className="border shadow-sm bg-slate-50">
                <CardHeader className="bg-slate-100 border-b">
                  <CardTitle className="text-sm font-semibold">Preview Lokasi Titik</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[220px]">
                    {open && (
                      <MapContainer center={[form.lat, form.lng]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                        <TileLayer url={MAP_LAYERS.osm.url} attribution={MAP_LAYERS.osm.attribution} />
                        <CircleMarker center={[form.lat, form.lng]} radius={8} pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.9 }} />
                      </MapContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Catatan Tambahan</Label>
                <Input placeholder="Catatan untuk driver/penumpang" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label className="text-primary font-bold">Harga Tiket (Rp)</Label>
                <Input type="number" placeholder="Contoh: 75000" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="border-primary/50 focus:ring-primary" />
                <p className="text-[10px] text-muted-foreground italic">* Harga ini akan berlaku saat penumpang memilih titik ini sebagai penjemputan.</p>
              </div>

              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Titik Jemput
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Cari nama, kode, rute, atau rayon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={filterRoute} onValueChange={setFilterRoute}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Filter rute" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Rute</SelectItem>
              {routes.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterRayon} onValueChange={setFilterRayon}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Filter rayon" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Rayon</SelectItem>
              {rayons.map((rayon) => (
                <SelectItem key={rayon.id} value={rayon.id}>{rayon.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Filter status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Non-aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportExcel} className="gap-2">
            <Download className="h-4 w-4" /> Export Excel
          </Button>
          <Button variant="secondary" onClick={handleExportPdf} className="gap-2">
            <FileText className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-slate-50">
          <CardContent className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Total Titik Jemput</p>
            <p className="text-3xl font-bold">{totals.all}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50">
          <CardContent className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Aktif</p>
            <p className="text-3xl font-bold text-emerald-700">{totals.active}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-rose-50">
          <CardContent className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Non-aktif</p>
            <p className="text-3xl font-bold text-rose-700">{totals.inactive}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        <Card className="shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/80 border-b">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold">Peta Titik Jemput</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[520px]">
            <PickupPointMap />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div>
              <p className="text-sm font-semibold">Ringkasan Rayon</p>
              <p className="text-xs text-muted-foreground">Kelola cakupan dan jumlah titik jemput per rayon.</p>
            </div>
            <div className="space-y-3">
              {totals.rayons.map((rayon) => (
                <div key={rayon.id} className="rounded-2xl border p-4 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{rayon.name}</p>
                      <p className="text-xs text-muted-foreground">{rayon.coverageArea}</p>
                    </div>
                    <Badge variant="outline">{rayon.pointCount} titik</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[80px]">Kode</TableHead>
                <TableHead>Nama Lokasi</TableHead>
                <TableHead>Rute</TableHead>
                <TableHead>Rayon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Urutan</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    Tidak ada titik penjemputan ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                [...filtered].sort((a,b) => a.order - b.order).map(p => (
                  <TableRow key={p.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono font-bold">
                      <Badge variant="outline" className="rounded-md px-1.5 py-0.5">{p.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {routes.find((r) => r.id === p.routeId)?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rayons.find((rayon) => rayon.id === p.rayonId)?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'active' ? 'secondary' : 'outline'} className="uppercase text-[10px] tracking-wider">
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">{p.order}</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {p.price > 0 ? (
                        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price)
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground bg-slate-50 border-slate-200">FREE / DEST</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDetail(p)} title="Lihat Detail">
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Edit Informasi">
                          <Edit className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} title="Hapus">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PointEditDialog 
        point={selectedPoint} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
      />
      
      <PointDetailDialog 
        point={selectedPoint} 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
      />
    </div>
  );
};

export default AdminPoints;
