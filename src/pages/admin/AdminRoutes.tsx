import { useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { formatRupiah } from '@/data/dummy';
import { toast } from 'sonner';
import { Route, RoutePoint } from '@/types/shuttle';

const AdminRoutes = () => {
  const { routes, setRoutes, routePoints, setRoutePoints } = useShuttle();
  const [openRoute, setOpenRoute] = useState(false);
  const [openPoint, setOpenPoint] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editingPoint, setEditingPoint] = useState<RoutePoint | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeForm, setRouteForm] = useState({ name: '', rayon: 'A' as Route['rayon'], origin: '', destination: '', pricePerMeter: 1.5 });
  const [pointForm, setPointForm] = useState({ code: '', name: '', distanceFromPrevious: 0, lat: 3.5952, lng: 98.6722 });

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const points = routePoints.filter(p => p.routeId === selectedRouteId).sort((a, b) => a.order - b.order);

  // Route CRUD
  const openNewRoute = () => { setEditingRoute(null); setRouteForm({ name: '', rayon: 'A', origin: '', destination: '', pricePerMeter: 1.5 }); setOpenRoute(true); };
  const openEditRoute = (r: Route) => { setEditingRoute(r); setRouteForm({ name: r.name, rayon: r.rayon, origin: r.origin, destination: r.destination, pricePerMeter: r.pricePerMeter }); setOpenRoute(true); };

  const handleSaveRoute = () => {
    if (editingRoute) {
      const pts = routePoints.filter(p => p.routeId === editingRoute.id);
      const lastPt = pts.sort((a, b) => b.order - a.order)[0];
      // Recalculate prices if pricePerMeter changed
      if (routeForm.pricePerMeter !== editingRoute.pricePerMeter) {
        setRoutePoints(prev => prev.map(p => {
          if (p.routeId !== editingRoute.id) return p;
          return { ...p, price: Math.round(p.cumulativeDistance * routeForm.pricePerMeter) };
        }));
      }
      setRoutes(prev => prev.map(r => r.id === editingRoute.id ? {
        ...r, ...routeForm,
        distanceMeters: lastPt?.cumulativeDistance || 0,
        price: Math.round((lastPt?.cumulativeDistance || 0) * routeForm.pricePerMeter),
      } : r));
      toast.success('Rute diperbarui');
    } else {
      setRoutes(prev => [...prev, { id: `r${Date.now()}`, ...routeForm, distanceMeters: 0, price: 0 }]);
      toast.success('Rute ditambahkan');
    }
    setOpenRoute(false);
  };

  const handleDeleteRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
    setRoutePoints(prev => prev.filter(p => p.routeId !== id));
    if (selectedRouteId === id) setSelectedRouteId(null);
    toast.success('Rute dihapus');
  };

  // Point CRUD
  const openNewPoint = () => {
    setEditingPoint(null);
    setPointForm({ code: '', name: '', distanceFromPrevious: 0, lat: 3.5952, lng: 98.6722 });
    setOpenPoint(true);
  };
  const openEditPoint = (p: RoutePoint) => {
    setEditingPoint(p);
    setPointForm({ code: p.code, name: p.name, distanceFromPrevious: p.distanceFromPrevious, lat: p.lat, lng: p.lng });
    setOpenPoint(true);
  };

  const recalcRoute = (routeId: string, updatedPoints: RoutePoint[]) => {
    const pts = updatedPoints.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);
    const lastPt = pts[pts.length - 1];
    const route = routes.find(r => r.id === routeId);
    if (route && lastPt) {
      setRoutes(prev => prev.map(r => r.id === routeId ? {
        ...r,
        distanceMeters: lastPt.cumulativeDistance,
        price: Math.round(lastPt.cumulativeDistance * r.pricePerMeter),
      } : r));
    }
  };

  const handleSavePoint = () => {
    if (!selectedRouteId || !selectedRoute) return;
    const pricePerMeter = selectedRoute.pricePerMeter;

    if (editingPoint) {
      // Update existing point and recalculate cumulative for all subsequent
      const updated = routePoints.map(p => {
        if (p.id === editingPoint.id) return { ...p, ...pointForm };
        return p;
      });
      // Recalculate cumulative distances and prices
      const routePts = updated.filter(p => p.routeId === selectedRouteId).sort((a, b) => a.order - b.order);
      let cumDist = 0;
      const recalculated = routePts.map(p => {
        cumDist += p.distanceFromPrevious;
        return { ...p, cumulativeDistance: cumDist, price: Math.round(cumDist * pricePerMeter) };
      });
      setRoutePoints(prev => {
        const others = prev.filter(p => p.routeId !== selectedRouteId);
        const result = [...others, ...recalculated];
        setTimeout(() => recalcRoute(selectedRouteId, result), 0);
        return result;
      });
      toast.success('Titik jemput diperbarui');
    } else {
      const newOrder = points.length + 1;
      const prevCumDist = points.length > 0 ? points[points.length - 1].cumulativeDistance : 0;
      const cumDist = prevCumDist + pointForm.distanceFromPrevious;
      const newPoint: RoutePoint = {
        id: `rp${Date.now()}`,
        routeId: selectedRouteId,
        code: pointForm.code,
        name: pointForm.name,
        order: newOrder,
        lat: pointForm.lat,
        lng: pointForm.lng,
        distanceFromPrevious: pointForm.distanceFromPrevious,
        cumulativeDistance: cumDist,
        price: Math.round(cumDist * pricePerMeter),
      };
      setRoutePoints(prev => {
        const result = [...prev, newPoint];
        setTimeout(() => recalcRoute(selectedRouteId, result), 0);
        return result;
      });
      toast.success('Titik jemput ditambahkan');
    }
    setOpenPoint(false);
  };

  const handleDeletePoint = (id: string) => {
    if (!selectedRouteId || !selectedRoute) return;
    const pricePerMeter = selectedRoute.pricePerMeter;
    const remaining = routePoints.filter(p => p.id !== id && p.routeId === selectedRouteId).sort((a, b) => a.order - b.order);
    // Reorder and recalculate
    let cumDist = 0;
    const recalculated = remaining.map((p, i) => {
      const dist = i === 0 ? 0 : p.distanceFromPrevious;
      cumDist += dist;
      return { ...p, order: i + 1, cumulativeDistance: cumDist, price: Math.round(cumDist * pricePerMeter) };
    });
    setRoutePoints(prev => {
      const others = prev.filter(p => p.routeId !== selectedRouteId);
      const result = [...others, ...recalculated];
      setTimeout(() => recalcRoute(selectedRouteId, result), 0);
      return result;
    });
    toast.success('Titik jemput dihapus');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedRouteId && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedRouteId(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">
            {selectedRouteId ? `${selectedRoute?.name}` : 'Kelola Rute'}
          </h1>
        </div>
        {!selectedRouteId ? (
          <Dialog open={openRoute} onOpenChange={setOpenRoute}>
            <DialogTrigger asChild><Button onClick={openNewRoute}><Plus className="h-4 w-4 mr-1" />Tambah Rute</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingRoute ? 'Edit Rute' : 'Tambah Rute'}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nama Rute</Label><Input value={routeForm.name} onChange={e => setRouteForm({ ...routeForm, name: e.target.value })} /></div>
                <div><Label>Rayon</Label>
                  <Select value={routeForm.rayon} onValueChange={v => setRouteForm({ ...routeForm, rayon: v as Route['rayon'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['A', 'B', 'C', 'D'].map(r => <SelectItem key={r} value={r}>Rayon {r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Asal</Label><Input value={routeForm.origin} onChange={e => setRouteForm({ ...routeForm, origin: e.target.value })} /></div>
                  <div><Label>Tujuan</Label><Input value={routeForm.destination} onChange={e => setRouteForm({ ...routeForm, destination: e.target.value })} /></div>
                </div>
                <div><Label>Harga per Meter (Rp)</Label><Input type="number" value={routeForm.pricePerMeter} onChange={e => setRouteForm({ ...routeForm, pricePerMeter: Number(e.target.value) })} /></div>
                <p className="text-xs text-muted-foreground">Jarak & harga total dihitung otomatis dari titik jemput.</p>
                <Button className="w-full" onClick={handleSaveRoute}>Simpan</Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={openPoint} onOpenChange={setOpenPoint}>
            <DialogTrigger asChild><Button onClick={openNewPoint}><Plus className="h-4 w-4 mr-1" />Tambah Titik</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingPoint ? 'Edit Titik Jemput' : 'Tambah Titik Jemput'}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Kode</Label><Input placeholder="J1" value={pointForm.code} onChange={e => setPointForm({ ...pointForm, code: e.target.value })} /></div>
                  <div><Label>Jarak dari titik sebelumnya (m)</Label><Input type="number" value={pointForm.distanceFromPrevious} onChange={e => setPointForm({ ...pointForm, distanceFromPrevious: Number(e.target.value) })} /></div>
                </div>
                <div><Label>Nama Lokasi</Label><Input value={pointForm.name} onChange={e => setPointForm({ ...pointForm, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Latitude</Label><Input type="number" step="0.0001" value={pointForm.lat} onChange={e => setPointForm({ ...pointForm, lat: Number(e.target.value) })} /></div>
                  <div><Label>Longitude</Label><Input type="number" step="0.0001" value={pointForm.lng} onChange={e => setPointForm({ ...pointForm, lng: Number(e.target.value) })} /></div>
                </div>
                <p className="text-xs text-muted-foreground">Harga otomatis: jarak kumulatif × {selectedRoute?.pricePerMeter || 0} Rp/m</p>
                <Button className="w-full" onClick={handleSavePoint}>Simpan</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Master: Route List */}
      {!selectedRouteId && (
        <div className="grid gap-3 md:grid-cols-2">
          {routes.map(r => {
            const ptCount = routePoints.filter(p => p.routeId === r.id).length;
            return (
              <Card key={r.id} className="cursor-pointer hover:border-primary transition-all" onClick={() => setSelectedRouteId(r.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{r.name}</p>
                      <Badge variant="outline">Rayon {r.rayon}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{(r.distanceMeters / 1000).toFixed(0)} km · {formatRupiah(r.price)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{ptCount} titik jemput</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); openEditRoute(r); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); handleDeleteRoute(r.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail: Points for selected route */}
      {selectedRouteId && selectedRoute && (
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 flex-wrap text-sm">
                <Badge variant="outline">Rayon {selectedRoute.rayon}</Badge>
                <span>{selectedRoute.origin} → {selectedRoute.destination}</span>
                <span className="text-muted-foreground">·</span>
                <span>{(selectedRoute.distanceMeters / 1000).toFixed(1)} km</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-semibold text-primary">{formatRupiah(selectedRoute.price)}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{selectedRoute.pricePerMeter} Rp/m</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Titik Penjemputan</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jarak (m)</TableHead>
                    <TableHead>Kumulatif</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {points.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Belum ada titik jemput. Klik "Tambah Titik" untuk menambahkan.</TableCell></TableRow>
                  ) : points.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground">{p.order}</TableCell>
                      <TableCell className="font-mono font-bold">{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.order === 1 ? '—' : `${(p.distanceFromPrevious / 1000).toFixed(1)} km`}</TableCell>
                      <TableCell>{(p.cumulativeDistance / 1000).toFixed(1)} km</TableCell>
                      <TableCell className="font-medium">{p.order === 1 ? '—' : formatRupiah(p.price)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditPoint(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePoint(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminRoutes;
