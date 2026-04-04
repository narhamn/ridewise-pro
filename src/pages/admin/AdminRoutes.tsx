import { useState } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Pencil, Trash2, MapPin, ChevronRight, ArrowLeft, Settings, RefreshCw, CalendarDays, CalendarIcon } from 'lucide-react';
import { formatRupiah } from '@/data/dummy';
import { toast } from 'sonner';
import { Route, RoutePoint } from '@/types/shuttle';
import { cn } from '@/lib/utils';

const AdminRoutes = () => {
  const { routes, setRoutes, routePoints, setRoutePoints, rayonPricing, setRayonPricing, recalcRoutePointPrices, schedules, setSchedules, vehicles } = useShuttle();
  const [openRoute, setOpenRoute] = useState(false);
  const [openPoint, setOpenPoint] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editingPoint, setEditingPoint] = useState<RoutePoint | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeForm, setRouteForm] = useState({ name: '', rayon: 'A' as Route['rayon'], origin: '', destination: '', pricePerMeter: 2 });
  const [pointForm, setPointForm] = useState({ code: '', name: '', distanceFromPrevious: 0, lat: 3.5952, lng: 98.6722 });
  const [openSchedule, setOpenSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ routeId: '', departureDate: '', departureTime: '', vehicleId: '' });
  const [scheduleDatePicker, setScheduleDatePicker] = useState<Date | undefined>(undefined);

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const points = routePoints.filter(p => p.routeId === selectedRouteId).sort((a, b) => a.order - b.order);

  // --- Rayon Pricing ---
  const handleRayonPriceChange = (rayon: string, newPrice: number) => {
    setRayonPricing(prev => prev.map(r => r.rayon === rayon ? { ...r, pricePerMeter: newPrice } : r));
  };

  const applyRayonPricing = (rayon: string) => {
    const config = rayonPricing.find(r => r.rayon === rayon);
    if (!config) return;
    const affectedRoutes = routes.filter(r => r.rayon === rayon);
    affectedRoutes.forEach(r => {
      recalcRoutePointPrices(r.id, config.pricePerMeter);
    });
    setRoutes(prev => prev.map(r => {
      if (r.rayon !== rayon) return r;
      const pts = routePoints.filter(p => p.routeId === r.id).sort((a, b) => a.order - b.order);
      const totalDist = pts.length > 0 ? pts[pts.length - 1].cumulativeDistance : 0;
      return { ...r, pricePerMeter: config.pricePerMeter, price: Math.round(totalDist * config.pricePerMeter) };
    }));
    toast.success(`Harga Rayon ${rayon} diterapkan ke ${affectedRoutes.length} rute`);
  };

  // --- Route CRUD ---
  const openNewRoute = () => {
    const defaultPpm = rayonPricing.find(r => r.rayon === 'A')?.pricePerMeter || 2;
    setEditingRoute(null);
    setRouteForm({ name: '', rayon: 'A', origin: '', destination: '', pricePerMeter: defaultPpm });
    setOpenRoute(true);
  };
  const openEditRoute = (r: Route) => {
    setEditingRoute(r);
    setRouteForm({ name: r.name, rayon: r.rayon, origin: r.origin, destination: r.destination, pricePerMeter: r.pricePerMeter });
    setOpenRoute(true);
  };

  const handleRayonChange = (rayon: Route['rayon']) => {
    const defaultPpm = rayonPricing.find(r => r.rayon === rayon)?.pricePerMeter || 1;
    setRouteForm({ ...routeForm, rayon, pricePerMeter: defaultPpm });
  };

  const handleSaveRoute = () => {
    if (editingRoute) {
      const pts = routePoints.filter(p => p.routeId === editingRoute.id).sort((a, b) => a.order - b.order);
      const totalDist = pts.length > 0 ? pts[pts.length - 1].cumulativeDistance : 0;
      if (routeForm.pricePerMeter !== editingRoute.pricePerMeter) {
        recalcRoutePointPrices(editingRoute.id, routeForm.pricePerMeter);
      }
      setRoutes(prev => prev.map(r => r.id === editingRoute.id ? {
        ...r, ...routeForm,
        distanceMeters: totalDist,
        price: Math.round(totalDist * routeForm.pricePerMeter),
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

  // --- Point CRUD ---
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

  const recalcAllPoints = (routeId: string, allPoints: RoutePoint[], pricePerMeter: number): RoutePoint[] => {
    const routePts = allPoints.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);
    let cumDist = 0;
    const withCum = routePts.map(p => {
      cumDist += p.distanceFromPrevious;
      return { ...p, cumulativeDistance: cumDist };
    });
    const totalDist = withCum.length > 0 ? withCum[withCum.length - 1].cumulativeDistance : 0;
    return withCum.map(p => ({
      ...p,
      distanceToDestination: totalDist - p.cumulativeDistance,
      price: Math.round((totalDist - p.cumulativeDistance) * pricePerMeter),
    }));
  };

  const recalcRoute = (routeId: string, updatedPoints: RoutePoint[]) => {
    const pts = updatedPoints.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);
    const totalDist = pts.length > 0 ? pts[pts.length - 1].cumulativeDistance : 0;
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setRoutes(prev => prev.map(r => r.id === routeId ? {
        ...r, distanceMeters: totalDist, price: Math.round(totalDist * r.pricePerMeter),
      } : r));
    }
  };

  const handleSavePoint = () => {
    if (!selectedRouteId || !selectedRoute) return;
    const pricePerMeter = selectedRoute.pricePerMeter;
    if (editingPoint) {
      const updated = routePoints.map(p => p.id === editingPoint.id ? { ...p, ...pointForm } : p);
      const recalculated = recalcAllPoints(selectedRouteId, updated, pricePerMeter);
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
        id: `rp${Date.now()}`, routeId: selectedRouteId, code: pointForm.code, name: pointForm.name,
        order: newOrder, lat: pointForm.lat, lng: pointForm.lng, distanceFromPrevious: pointForm.distanceFromPrevious,
        cumulativeDistance: cumDist, distanceToDestination: 0, price: 0,
      };
      const allPts = [...routePoints, newPoint];
      const recalculated = recalcAllPoints(selectedRouteId, allPts, pricePerMeter);
      setRoutePoints(prev => {
        const others = prev.filter(p => p.routeId !== selectedRouteId);
        const result = [...others, ...recalculated];
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
    let cumDist = 0;
    const reordered = remaining.map((p, i) => {
      const dist = i === 0 ? 0 : p.distanceFromPrevious;
      cumDist += dist;
      return { ...p, order: i + 1, cumulativeDistance: cumDist, distanceFromPrevious: dist };
    });
    const totalDist = reordered.length > 0 ? reordered[reordered.length - 1].cumulativeDistance : 0;
    const recalculated = reordered.map(p => ({
      ...p, distanceToDestination: totalDist - p.cumulativeDistance,
      price: Math.round((totalDist - p.cumulativeDistance) * pricePerMeter),
    }));
    setRoutePoints(prev => {
      const others = prev.filter(p => p.routeId !== selectedRouteId);
      const result = [...others, ...recalculated];
      setTimeout(() => recalcRoute(selectedRouteId, result), 0);
      return result;
    });
    toast.success('Titik jemput dihapus');
  };

  const getSimulatedPrices = (routeId: string, ppm: number) => {
    const pts = routePoints.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);
    const totalDist = pts.length > 0 ? pts[pts.length - 1].cumulativeDistance : 0;
    return pts.map(p => ({
      ...p, distanceToDestination: totalDist - p.cumulativeDistance,
      simulatedPrice: Math.round((totalDist - p.cumulativeDistance) * ppm),
    }));
  };

  // --- Schedule CRUD ---
  const handleSaveSchedule = () => {
    if (!scheduleForm.departureDate) {
      toast.error('Pilih tanggal berangkat!');
      return;
    }
    setSchedules(prev => [...prev, {
      id: `s${Date.now()}`,
      routeId: scheduleForm.routeId,
      departureDate: scheduleForm.departureDate,
      departureTime: scheduleForm.departureTime,
      vehicleId: scheduleForm.vehicleId,
      driverId: null,
      status: 'scheduled' as const,
    }]);
    toast.success('Jadwal ditambahkan');
    setOpenSchedule(false);
    setScheduleForm({ routeId: '', departureDate: '', departureTime: '', vehicleId: '' });
    setScheduleDatePicker(undefined);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    toast.success('Jadwal dihapus');
  };

  const sortedSchedules = [...schedules].sort((a, b) => {
    const dateComp = a.departureDate.localeCompare(b.departureDate);
    if (dateComp !== 0) return dateComp;
    return a.departureTime.localeCompare(b.departureTime);
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="routes">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {selectedRouteId && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedRouteId(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
             <h1 className="text-2xl font-bold">
               {selectedRouteId ? selectedRoute?.name : 'Rute, Jadwal & Harga'}
             </h1>
           </div>
           {!selectedRouteId && (
             <TabsList>
               <TabsTrigger value="routes"><MapPin className="h-4 w-4 mr-1" />Rute</TabsTrigger>
               <TabsTrigger value="schedules"><CalendarDays className="h-4 w-4 mr-1" />Jadwal</TabsTrigger>
               <TabsTrigger value="pricing"><Settings className="h-4 w-4 mr-1" />Harga</TabsTrigger>
             </TabsList>
           )}
        </div>

        {/* === PRICING SETTINGS TAB === */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Settings className="h-5 w-5 text-primary" />Harga per Meter per Rayon</CardTitle>
              <p className="text-sm text-muted-foreground">Atur tarif default per rayon. Perubahan bisa diterapkan ke semua rute di rayon tersebut.</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rayon</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Harga/Meter (Rp)</TableHead>
                    <TableHead>Jumlah Rute</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rayonPricing.map(rp => {
                    const routeCount = routes.filter(r => r.rayon === rp.rayon).length;
                    return (
                      <TableRow key={rp.rayon}>
                        <TableCell><Badge variant="outline" className="font-bold">Rayon {rp.rayon}</Badge></TableCell>
                        <TableCell className="text-sm">{rp.label}</TableCell>
                        <TableCell>
                          <Input type="number" step="0.1" className="w-28" value={rp.pricePerMeter}
                            onChange={e => handleRayonPriceChange(rp.rayon, Number(e.target.value))} />
                        </TableCell>
                        <TableCell>{routeCount} rute</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => applyRayonPricing(rp.rayon)} disabled={routeCount === 0}>
                            <RefreshCw className="h-3 w-3 mr-1" />Terapkan ke Semua
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Simulasi Harga per Rute</CardTitle>
              <p className="text-sm text-muted-foreground">Preview harga tiap titik jemput berdasarkan jarak ke tujuan akhir × tarif/m</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {routes.map(r => {
                const simulated = getSimulatedPrices(r.id, r.pricePerMeter);
                if (simulated.length === 0) return null;
                return (
                  <div key={r.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Rayon {r.rayon}</Badge>
                      <span className="font-semibold text-sm">{r.name}</span>
                      <span className="text-xs text-muted-foreground">({r.pricePerMeter} Rp/m)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                      {simulated.map(sp => (
                        <div key={sp.id} className="flex justify-between text-sm border-b border-dashed py-1 px-1">
                          <span className="text-muted-foreground">{sp.code} {sp.name}</span>
                          <span className="font-medium">
                            {sp.distanceToDestination === 0 ? (
                              <span className="text-muted-foreground">Tujuan</span>
                            ) : (
                              <>{(sp.distanceToDestination / 1000).toFixed(0)} km → {formatRupiah(sp.simulatedPrice)}</>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === ROUTES TAB === */}
        <TabsContent value="routes" className="space-y-4">
          {!selectedRouteId && (
            <>
              <div className="flex justify-end">
                <Dialog open={openRoute} onOpenChange={setOpenRoute}>
                  <DialogTrigger asChild><Button onClick={openNewRoute}><Plus className="h-4 w-4 mr-1" />Tambah Rute</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingRoute ? 'Edit Rute' : 'Tambah Rute'}</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><Label>Nama Rute</Label><Input value={routeForm.name} onChange={e => setRouteForm({ ...routeForm, name: e.target.value })} /></div>
                      <div><Label>Rayon</Label>
                        <Select value={routeForm.rayon} onValueChange={v => handleRayonChange(v as Route['rayon'])}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{rayonPricing.map(r => <SelectItem key={r.rayon} value={r.rayon}>Rayon {r.rayon} — {r.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label>Asal</Label><Input value={routeForm.origin} onChange={e => setRouteForm({ ...routeForm, origin: e.target.value })} /></div>
                        <div><Label>Tujuan</Label><Input value={routeForm.destination} onChange={e => setRouteForm({ ...routeForm, destination: e.target.value })} /></div>
                      </div>
                      <div><Label>Harga per Meter (Rp) — Override</Label><Input type="number" step="0.1" value={routeForm.pricePerMeter} onChange={e => setRouteForm({ ...routeForm, pricePerMeter: Number(e.target.value) })} /></div>
                      <p className="text-xs text-muted-foreground">Default dari rayon. Bisa di-override per rute. Harga = jarak ke tujuan × Rp/m.</p>
                      <Button className="w-full" onClick={handleSaveRoute}>Simpan</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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
                          <p className="text-sm text-muted-foreground">{(r.distanceMeters / 1000).toFixed(0)} km · {formatRupiah(r.price)} · {r.pricePerMeter} Rp/m</p>
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
            </>
          )}

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
                  <p className="text-xs text-muted-foreground mt-1">Harga = jarak ke tujuan akhir × {selectedRoute.pricePerMeter} Rp/m</p>
                </CardContent>
              </Card>

              <div className="flex justify-end">
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
                      <p className="text-xs text-muted-foreground">Harga otomatis: jarak ke tujuan akhir × {selectedRoute.pricePerMeter} Rp/m</p>
                      <Button className="w-full" onClick={handleSavePoint}>Simpan</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

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
                        <TableHead>Ke Tujuan</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {points.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Belum ada titik jemput.</TableCell></TableRow>
                      ) : points.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="text-muted-foreground">{p.order}</TableCell>
                          <TableCell className="font-mono font-bold">{p.code}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.order === 1 ? '—' : `${(p.distanceFromPrevious / 1000).toFixed(1)} km`}</TableCell>
                          <TableCell>
                            {p.distanceToDestination === 0 ? <Badge variant="secondary">Tujuan</Badge> : `${(p.distanceToDestination / 1000).toFixed(1)} km`}
                          </TableCell>
                          <TableCell className="font-medium">{p.distanceToDestination === 0 ? '—' : formatRupiah(p.price)}</TableCell>
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
        </TabsContent>

        {/* === SCHEDULES TAB === */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openSchedule} onOpenChange={setOpenSchedule}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Tambah Jadwal</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Tambah Jadwal</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Rute</Label>
                    <Select value={scheduleForm.routeId} onValueChange={v => setScheduleForm({...scheduleForm, routeId: v})}>
                      <SelectTrigger><SelectValue placeholder="Pilih rute" /></SelectTrigger>
                      <SelectContent>{routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tanggal Berangkat</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !scheduleDatePicker && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduleDatePicker ? format(scheduleDatePicker, 'dd MMMM yyyy', { locale: localeId }) : 'Pilih tanggal'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduleDatePicker}
                          onSelect={(date) => {
                            setScheduleDatePicker(date);
                            if (date) setScheduleForm({ ...scheduleForm, departureDate: format(date, 'yyyy-MM-dd') });
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div><Label>Jam Berangkat</Label><Input type="time" value={scheduleForm.departureTime} onChange={e => setScheduleForm({...scheduleForm, departureTime: e.target.value})} /></div>
                  <div><Label>Kendaraan</Label>
                    <Select value={scheduleForm.vehicleId} onValueChange={v => setScheduleForm({...scheduleForm, vehicleId: v})}>
                      <SelectTrigger><SelectValue placeholder="Pilih kendaraan" /></SelectTrigger>
                      <SelectContent>{vehicles.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.plateNumber})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleSaveSchedule}>Simpan</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rute</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Kendaraan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSchedules.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{routes.find(r => r.id === s.routeId)?.name}</TableCell>
                      <TableCell className="font-mono text-sm">{s.departureDate}</TableCell>
                      <TableCell className="font-mono">{s.departureTime}</TableCell>
                      <TableCell>{vehicles.find(v => v.id === s.vehicleId)?.name}</TableCell>
                      <TableCell><Badge variant="secondary">{s.status}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleDeleteSchedule(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminRoutes;
