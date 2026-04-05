import { useState } from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Pencil, Trash2, MapPin, ChevronRight, ArrowLeft, Settings, RefreshCw, CalendarDays, CalendarIcon, History, FileDown, Search, Map } from 'lucide-react';
import { calculateFinalPrice, formatPrice } from '@/lib/pricing';
import { toast } from 'sonner';
import { Route, RoutePoint, PricingAuditLog } from '@/types/shuttle';
import { cn } from '@/lib/utils';
import RouteMapEditor from '@/components/RouteMapEditor';

const AdminRoutes = () => {
  const {
    routes, setRoutes,
    routePoints, setRoutePoints,
    rayonPricing, setRayonPricing,
    recalcRoutePointPrices,
    recalculateRouteDistanceAndPrice,
    schedules, setSchedules,
    vehicles,
    auditLogs, addAuditLog, currentUser,
    drivers, assignDriverToSchedule, removeDriverFromSchedule, getAvailableDrivers
  } = useShuttle();
  const [openRoute, setOpenRoute] = useState(false);
  const [openPoint, setOpenPoint] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editingPoint, setEditingPoint] = useState<RoutePoint | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());

  const toggleExpand = (routeId: string) => {
    const newExpanded = new Set(expandedRoutes);
    if (newExpanded.has(routeId)) {
      newExpanded.delete(routeId);
    } else {
      newExpanded.add(routeId);
    }
    setExpandedRoutes(newExpanded);
  };

  const [routeForm, setRouteForm] = useState({ 
    name: '', 
    rayon: 'A' as Route['rayon'], 
    origin: '', 
    destination: '', 
    pricePerMeter: 2,
    roadConditionMultiplier: 1,
    vehicleTypeMultiplier: 1,
    distanceKm: 0,
  });
  const [distanceFilter, setDistanceFilter] = useState({ min: 0, max: 1000 });
  const [pointForm, setPointForm] = useState({ code: '', name: '', distanceFromPrevious: 0, lat: 3.5952, lng: 98.6722 });
  const [openSchedule, setOpenSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ routeId: '', departureDate: '', departureTime: '', vehicleId: '' });
  const [scheduleDatePicker, setScheduleDatePicker] = useState<Date | undefined>(undefined);

  // Driver Assignment States
  const [openDriverAssignment, setOpenDriverAssignment] = useState(false);
  const [selectedScheduleForDriver, setSelectedScheduleForDriver] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  // --- Audit Log States ---
  const [openAuditDialog, setOpenAuditDialog] = useState(false);
  const [auditReason, setAuditReason] = useState('');
  const [pendingRayonUpdate, setPendingRayonUpdate] = useState<{ rayon: string, oldPrice: number, newPrice: number } | null>(null);
  const [auditFilter, setAuditFilter] = useState({ rayon: 'all', user: '', startDate: '', endDate: '' });

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const points = routePoints.filter(p => p.routeId === selectedRouteId).sort((a, b) => a.order - b.order);

  // --- Rayon Pricing ---
  const handleRayonPriceChange = (rayon: string, newPrice: number) => {
    setRayonPricing(prev => prev.map(r => r.rayon === rayon ? { ...r, pricePerMeter: newPrice } : r));
  };

  const initiateApplyRayonPricing = (rayon: string) => {
    const config = rayonPricing.find(r => r.rayon === rayon);
    if (!config) return;
    
    // Find a route in this rayon to get the old price (assuming they were synced)
    const firstRoute = routes.find(r => r.rayon === rayon);
    const oldPrice = firstRoute?.pricePerMeter || config.pricePerMeter;

    setPendingRayonUpdate({ rayon, oldPrice, newPrice: config.pricePerMeter });
    setAuditReason('');
    setOpenAuditDialog(true);
  };

  const confirmApplyRayonPricing = () => {
    if (!pendingRayonUpdate || !auditReason.trim()) {
      toast.error('Alasan perubahan harus diisi');
      return;
    }

    const { rayon, oldPrice, newPrice } = pendingRayonUpdate;
    const config = rayonPricing.find(r => r.rayon === rayon);
    if (!config) return;

    // Log the change
    addAuditLog({
      rayon: rayon as any,
      oldPrice,
      newPrice,
      changedBy: currentUser?.name || 'Admin',
      reason: auditReason,
    });

    const affectedRoutes = routes.filter(r => r.rayon === rayon);
    affectedRoutes.forEach(r => {
      recalcRoutePointPrices(r.id, config.pricePerMeter, r.roadConditionMultiplier, r.vehicleTypeMultiplier);
    });
    setRoutes(prev => prev.map(r => {
      if (r.rayon !== rayon) return r;
      const pts = routePoints.filter(p => p.routeId === r.id).sort((a, b) => a.order - b.order);
      const totalDist = pts.length > 0 ? pts[pts.length - 1].cumulativeDistance : 0;
      const { finalPrice } = calculateFinalPrice(totalDist, config.pricePerMeter, {
        multipliers: { roadCondition: r.roadConditionMultiplier || 1, vehicleType: r.vehicleTypeMultiplier || 1 }
      });
      return { ...r, pricePerMeter: config.pricePerMeter, price: finalPrice };
    }));

    setOpenAuditDialog(false);
    setPendingRayonUpdate(null);
    toast.success(`Harga Rayon ${rayon} diterapkan dan dicatat di audit log`);
  };

  // --- Route CRUD ---
  const openNewRoute = () => {
    const defaultPpm = rayonPricing.find(r => r.rayon === 'A')?.pricePerMeter || 2;
    setEditingRoute(null);
    setRouteForm({ 
      name: '', 
      rayon: 'A', 
      origin: '', 
      destination: '', 
      pricePerMeter: defaultPpm,
      roadConditionMultiplier: 1,
      vehicleTypeMultiplier: 1,
      distanceKm: 0,
    });
    setOpenRoute(true);
  };
  const openEditRoute = (r: Route) => {
    setEditingRoute(r);
    setRouteForm({ 
      name: r.name, 
      rayon: r.rayon, 
      origin: r.origin, 
      destination: r.destination, 
      pricePerMeter: r.pricePerMeter,
      roadConditionMultiplier: r.roadConditionMultiplier || 1,
      vehicleTypeMultiplier: r.vehicleTypeMultiplier || 1,
      distanceKm: r.distanceKm || (r.distanceMeters / 1000)
    });
    setOpenRoute(true);
  };

  const handleRayonChange = (rayon: Route['rayon']) => {
    const defaultPpm = rayonPricing.find(r => r.rayon === rayon)?.pricePerMeter || 1;
    setRouteForm({ ...routeForm, rayon, pricePerMeter: defaultPpm });
  };

  const handleSaveRoute = () => {
    if (routeForm.distanceKm < 0) {
      toast.error('Jarak tidak boleh negatif!');
      return;
    }

    if (editingRoute) {
      const pts = routePoints.filter(p => p.routeId === editingRoute.id).sort((a, b) => a.order - b.order);
      const totalDist = routeForm.distanceKm > 0 ? routeForm.distanceKm * 1000 : (pts.length > 0 ? pts[pts.length - 1].cumulativeDistance : 0);
      
      if (routeForm.pricePerMeter !== editingRoute.pricePerMeter || 
          routeForm.roadConditionMultiplier !== editingRoute.roadConditionMultiplier || 
          routeForm.vehicleTypeMultiplier !== editingRoute.vehicleTypeMultiplier) {
        recalcRoutePointPrices(
          editingRoute.id, 
          routeForm.pricePerMeter, 
          routeForm.roadConditionMultiplier, 
          routeForm.vehicleTypeMultiplier
        );
      }
      const { finalPrice } = calculateFinalPrice(totalDist, routeForm.pricePerMeter, {
        multipliers: { roadCondition: routeForm.roadConditionMultiplier, vehicleType: routeForm.vehicleTypeMultiplier }
      });
      setRoutes(prev => prev.map(r => r.id === editingRoute.id ? {
        ...r, ...routeForm,
        distanceMeters: totalDist,
        distanceKm: routeForm.distanceKm || totalDist / 1000,
        price: finalPrice,
      } : r));
      toast.success('Rute diperbarui');
    } else {
      const totalDist = routeForm.distanceKm * 1000;
      const { finalPrice } = calculateFinalPrice(totalDist, routeForm.pricePerMeter, {
        multipliers: { roadCondition: routeForm.roadConditionMultiplier, vehicleType: routeForm.vehicleTypeMultiplier }
      });
      setRoutes(prev => [...prev, { 
        id: `r${Date.now()}`, 
        ...routeForm, 
        distanceMeters: totalDist, 
        distanceKm: routeForm.distanceKm, 
        price: finalPrice
      }]);
      toast.success('Rute ditambahkan');
    }
    setOpenRoute(false);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nama Rute', 'Rayon', 'Asal', 'Tujuan', 'Jarak (km)', 'Harga (Rp)'];
    const rows = routes.map(r => [
      r.id, r.name, r.rayon, r.origin, r.destination, r.distanceKm.toFixed(2), r.price
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pyu-go_routes_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data rute diekspor ke CSV');
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
    const route = routes.find(r => r.id === routeId);
    const roadMultiplier = route?.roadConditionMultiplier || 1;
    const vehicleMultiplier = route?.vehicleTypeMultiplier || 1;

    return withCum.map(p => {
      const { finalPrice } = calculateFinalPrice(totalDist - p.cumulativeDistance, pricePerMeter, {
        multipliers: { roadCondition: roadMultiplier, vehicleType: vehicleMultiplier }
      });
      return {
        ...p,
        distanceToDestination: totalDist - p.cumulativeDistance,
        price: finalPrice,
      };
    });
  };

  const recalcRoute = (routeId: string, updatedPoints: RoutePoint[]) => {
    const pts = updatedPoints.filter(p => p.routeId === routeId).sort((a, b) => a.order - b.order);
    const totalDist = pts.length > 0 ? pts[pts.length - 1].cumulativeDistance : 0;
    const route = routes.find(r => r.id === routeId);
    if (route) {
      const { finalPrice } = calculateFinalPrice(totalDist, route.pricePerMeter, {
        multipliers: { roadCondition: route.roadConditionMultiplier || 1, vehicleType: route.vehicleTypeMultiplier || 1 }
      });
      setRoutes(prev => prev.map(r => r.id === routeId ? {
        ...r, 
        distanceMeters: totalDist, 
        distanceKm: totalDist / 1000,
        price: finalPrice,
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
    const recalculated = recalcAllPoints(selectedRouteId, reordered, pricePerMeter);
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
    const route = routes.find(r => r.id === routeId);
    const roadMultiplier = route?.roadConditionMultiplier || 1;
    const vehicleMultiplier = route?.vehicleTypeMultiplier || 1;

    return pts.map(p => {
      const { finalPrice } = calculateFinalPrice(totalDist - p.cumulativeDistance, ppm, {
        multipliers: { roadCondition: roadMultiplier, vehicleType: vehicleMultiplier }
      });
      return {
        ...p, 
        distanceToDestination: totalDist - p.cumulativeDistance,
        simulatedPrice: finalPrice,
      };
    });
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

  // Driver Assignment Functions
  const openDriverAssignmentDialog = (scheduleId: string) => {
    setSelectedScheduleForDriver(scheduleId);
    setSelectedDriverId('');
    setOpenDriverAssignment(true);
  };

  const handleAssignDriver = () => {
    if (!selectedScheduleForDriver || !selectedDriverId) {
      toast.error('Pilih driver terlebih dahulu');
      return;
    }

    assignDriverToSchedule(selectedScheduleForDriver, selectedDriverId);
    setOpenDriverAssignment(false);
    setSelectedScheduleForDriver(null);
    setSelectedDriverId('');
  };

  const handleRemoveDriver = (scheduleId: string) => {
    removeDriverFromSchedule(scheduleId);
  };

  const getAvailableDriversForSchedule = (schedule: any) => {
    return getAvailableDrivers(schedule.departureDate, schedule.departureTime);
  };

  const sortedSchedules = [...schedules].sort((a, b) => {
    const dateComp = a.departureDate.localeCompare(b.departureDate);
    if (dateComp !== 0) return dateComp;
    return a.departureTime.localeCompare(b.departureTime);
  });

  const filteredRoutes = routes.filter(r => {
     const distance = r.distanceKm || (r.distanceMeters / 1000);
     return distance >= distanceFilter.min && distance <= distanceFilter.max;
   });

   const filteredAuditLogs = auditLogs.filter(log => {
    const matchesRayon = auditFilter.rayon === 'all' || log.rayon === auditFilter.rayon;
    const matchesUser = !auditFilter.user || log.changedBy.toLowerCase().includes(auditFilter.user.toLowerCase());
    const matchesDate = (!auditFilter.startDate || log.changeDate >= auditFilter.startDate) &&
                        (!auditFilter.endDate || log.changeDate <= auditFilter.endDate);
    return matchesRayon && matchesUser && matchesDate;
  });

  const exportAuditToExcel = () => {
    const headers = ['ID', 'Rayon', 'Harga Lama', 'Harga Baru', 'User', 'Tanggal', 'Alasan'];
    const rows = filteredAuditLogs.map(log => [
      log.id, log.rayon, log.oldPrice, log.newPrice, log.changedBy, format(new Date(log.changeDate), 'yyyy-MM-dd HH:mm'), log.reason
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_log_pricing_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit log diekspor ke Excel (CSV)');
  };

  const exportAuditToPDF = () => {
    toast.info('Fitur export PDF sedang diproses (Mock)');
    // In real app, use jspdf or similar
    setTimeout(() => toast.success('Audit log berhasil diekspor ke PDF'), 1000);
  };

  return (
    <div className="space-y-4">
      {/* Audit Reason Dialog */}
      <Dialog open={openAuditDialog} onOpenChange={setOpenAuditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Perubahan Harga</DialogTitle>
            <DialogDescription>
              Silakan masukkan alasan untuk perubahan harga rayon ini guna keperluan audit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p><strong>Rayon:</strong> {pendingRayonUpdate?.rayon}</p>
              <p><strong>Perubahan:</strong> {formatPrice(pendingRayonUpdate?.oldPrice || 0)} → {formatPrice(pendingRayonUpdate?.newPrice || 0)}</p>
            </div>
            <div className="space-y-2">
              <Label>Alasan Perubahan</Label>
              <Input 
                placeholder="Contoh: Penyesuaian biaya operasional" 
                value={auditReason} 
                onChange={e => setAuditReason(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenAuditDialog(false)}>Batal</Button>
            <Button onClick={confirmApplyRayonPricing} disabled={!auditReason.trim()}>Terapkan & Log</Button>
          </div>
        </DialogContent>
      </Dialog>

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
               <TabsTrigger value="map"><Map className="h-4 w-4 mr-1" />Peta</TabsTrigger>
               <TabsTrigger value="schedules"><CalendarDays className="h-4 w-4 mr-1" />Jadwal</TabsTrigger>
               <TabsTrigger value="pricing"><Settings className="h-4 w-4 mr-1" />Harga</TabsTrigger>
               <TabsTrigger value="audit"><History className="h-4 w-4 mr-1" />Audit Log</TabsTrigger>
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
                          <Button size="sm" variant="outline" onClick={() => initiateApplyRayonPricing(rp.rayon)} disabled={routeCount === 0}>
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
                              <>{(sp.distanceToDestination / 1000).toFixed(0)} km → {formatPrice(sp.simulatedPrice)}</>
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

        {/* === AUDIT LOG TAB === */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" /> Histori Perubahan Harga
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Audit log lengkap perubahan tarif dasar per rayon.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportAuditToExcel}>
                    <FileDown className="h-4 w-4 mr-1" /> Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportAuditToPDF}>
                    <FileDown className="h-4 w-4 mr-1" /> PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 bg-muted/30 p-3 rounded-lg border">
                <div className="space-y-1">
                  <Label className="text-xs">Rayon</Label>
                  <Select value={auditFilter.rayon} onValueChange={v => setAuditFilter({ ...auditFilter, rayon: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Rayon</SelectItem>
                      <SelectItem value="A">Rayon A</SelectItem>
                      <SelectItem value="B">Rayon B</SelectItem>
                      <SelectItem value="C">Rayon C</SelectItem>
                      <SelectItem value="D">Rayon D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">User</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      placeholder="Cari user..." 
                      className="pl-8 h-9" 
                      value={auditFilter.user}
                      onChange={e => setAuditFilter({ ...auditFilter, user: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dari Tanggal</Label>
                  <Input 
                    type="date" 
                    className="h-9" 
                    value={auditFilter.startDate}
                    onChange={e => setAuditFilter({ ...auditFilter, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sampai Tanggal</Label>
                  <Input 
                    type="date" 
                    className="h-9" 
                    value={auditFilter.endDate}
                    onChange={e => setAuditFilter({ ...auditFilter, endDate: e.target.value })}
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Rayon</TableHead>
                    <TableHead>Perubahan</TableHead>
                    <TableHead>User</TableHead>
                    <Label className="sr-only">Alasan</Label>
                    <TableHead>Alasan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Belum ada data audit log
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAuditLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          {format(new Date(log.changeDate), 'dd MMM yyyy HH:mm', { locale: localeId })}
                        </TableCell>
                        <TableCell><Badge variant="outline">Rayon {log.rayon}</Badge></TableCell>
                        <TableCell className="text-sm font-medium">
                          <span className="text-muted-foreground line-through mr-2">{formatPrice(log.oldPrice)}</span>
                          <span className="text-primary">{formatPrice(log.newPrice)}</span>
                        </TableCell>
                        <TableCell className="text-sm">{log.changedBy}</TableCell>
                        <TableCell className="text-sm italic text-muted-foreground max-w-[200px] truncate" title={log.reason}>
                          {log.reason}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === ROUTES TAB === */}
        <TabsContent value="routes" className="space-y-4">
          {!selectedRouteId && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md">
                    <span className="text-xs text-muted-foreground">Filter Jarak (km):</span>
                    <Input 
                      className="h-7 w-16 text-xs" 
                      type="number" 
                      value={distanceFilter.min} 
                      onChange={e => setDistanceFilter({ ...distanceFilter, min: Number(e.target.value) })} 
                    />
                    <span className="text-xs">-</span>
                    <Input 
                      className="h-7 w-16 text-xs" 
                      type="number" 
                      value={distanceFilter.max} 
                      onChange={e => setDistanceFilter({ ...distanceFilter, max: Number(e.target.value) })} 
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={exportToCSV}>Ekspor CSV</Button>
                </div>
                <Dialog open={openRoute} onOpenChange={setOpenRoute}>
                  <DialogTrigger asChild><Button onClick={openNewRoute}><Plus className="h-4 w-4 mr-1" />Tambah Rute</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingRoute ? 'Edit Rute' : 'Tambah Rute'}</DialogTitle>
                      <DialogDescription>
                        {editingRoute ? 'Perbarui informasi rute perjalanan.' : 'Buat rute perjalanan baru untuk layanan shuttle.'}
                      </DialogDescription>
                    </DialogHeader>
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
                      <div>
                        <Label>Jarak (km)</Label>
                        <Input type="number" min="0" value={routeForm.distanceKm} onChange={e => setRouteForm({ ...routeForm, distanceKm: Number(e.target.value) })} />
                        <p className="text-[10px] text-muted-foreground">Isi manual atau gunakan Auto-Calc di detail rute.</p>
                      </div>
                      <div><Label>Harga per Meter (Rp) — Override</Label><Input type="number" step="0.1" value={routeForm.pricePerMeter} onChange={e => setRouteForm({ ...routeForm, pricePerMeter: Number(e.target.value) })} /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Faktor Kondisi Jalan</Label>
                          <Input type="number" step="0.1" value={routeForm.roadConditionMultiplier} onChange={e => setRouteForm({ ...routeForm, roadConditionMultiplier: Number(e.target.value) })} />
                          <p className="text-[10px] text-muted-foreground">Contoh: 1.0 (Bagus), 1.2 (Rusak)</p>
                        </div>
                        <div>
                          <Label>Faktor Kendaraan</Label>
                          <Input type="number" step="0.1" value={routeForm.vehicleTypeMultiplier} onChange={e => setRouteForm({ ...routeForm, vehicleTypeMultiplier: Number(e.target.value) })} />
                          <p className="text-[10px] text-muted-foreground">Contoh: 1.0 (Standar), 1.5 (Premium)</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Default dari rayon. Bisa di-override per rute. Harga = jarak × Rp/m × Faktor Jalan × Faktor Kendaraan.</p>
                      <Button className="w-full" onClick={handleSaveRoute}>Simpan</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {filteredRoutes.map(r => {
                  const ptCount = routePoints.filter(p => p.routeId === r.id).length;
                  const isExpanded = expandedRoutes.has(r.id);
                  return (
                    <Collapsible
                      key={r.id}
                      open={isExpanded}
                      onOpenChange={() => toggleExpand(r.id)}
                      className="w-full"
                    >
                      <Card className={cn(
                        "overflow-hidden transition-all duration-200",
                        isExpanded ? "border-primary ring-1 ring-primary/20" : "hover:border-primary/50"
                      )}>
                        <CardContent className="p-0">
                          <div 
                            className="p-4 flex items-center justify-between cursor-pointer"
                            onClick={() => toggleExpand(r.id)}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-base">{r.name}</p>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium">
                                  Rayon {r.rayon}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground font-medium">
                                {(r.distanceMeters / 1000).toFixed(1)} km · {formatPrice(r.price)} · {r.pricePerMeter} Rp/m
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="font-medium">{ptCount} titik jemput</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border-r pr-2 mr-1 gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                                  onClick={e => { e.stopPropagation(); openEditRoute(r); }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={e => { e.stopPropagation(); handleDeleteRoute(r.id); }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className={cn(
                                "p-1 rounded-full transition-transform duration-200",
                                isExpanded ? "rotate-90 bg-primary/10 text-primary" : "text-muted-foreground"
                              )}>
                                <ChevronRight className="h-5 w-5" />
                              </div>
                            </div>
                          </div>

                          <CollapsibleContent className="border-t bg-muted/30">
                            <div className="p-4 space-y-4">
                              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted-foreground/20">
                                {routePoints
                                  .filter(p => p.routeId === r.id)
                                  .sort((a, b) => a.order - b.order)
                                  .map((p, idx, array) => {
                                    const isLast = idx === array.length - 1;
                                    return (
                                      <div key={p.id} className="relative group">
                                        <div className={cn(
                                          "absolute -left-[23px] top-1 h-[22px] w-[22px] rounded-full border-2 bg-background flex items-center justify-center text-[10px] font-bold z-10 transition-colors",
                                          isLast ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground/60 group-hover:border-primary/50 group-hover:text-primary/70"
                                        )}>
                                          {p.order}
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                          <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-mono font-bold bg-muted px-1.5 py-0.5 rounded border border-muted-foreground/10 text-muted-foreground">
                                                {p.code}
                                              </span>
                                              <span className="text-sm font-semibold">{p.name}</span>
                                              {isLast && <Badge variant="secondary" className="h-5 text-[10px] px-1.5 uppercase tracking-wider bg-primary/10 text-primary border-none">Tujuan</Badge>}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4 text-xs font-medium">
                                            <div className="text-muted-foreground whitespace-nowrap">
                                              {p.distanceToDestination === 0 ? "—" : `${(p.distanceToDestination / 1000).toFixed(1)} km`}
                                            </div>
                                            <div className="w-20 text-right font-bold text-primary/80">
                                              {p.distanceToDestination === 0 ? "—" : formatPrice(p.price)}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                              
                              <div className="pt-2 flex justify-end">
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="text-primary font-bold h-8 p-0 hover:no-underline group"
                                   onClick={() => setSelectedRouteId(r.id)}
                                 >
                                   Lihat Detail →
                                 </Button>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </CardContent>
                      </Card>
                    </Collapsible>
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
                    <span className="font-semibold text-primary">{formatPrice(selectedRoute.price)}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{selectedRoute.pricePerMeter} Rp/m</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Harga = jarak ke tujuan akhir × {selectedRoute.pricePerMeter} Rp/m</p>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between gap-2">
                <div className="text-left">
                  <div className="text-sm font-medium">{selectedRoute.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedRoute.origin} → {selectedRoute.destination} ({selectedRoute.distanceKm || (selectedRoute.distanceMeters / 1000).toFixed(1)} km)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 h-8 text-xs"
                    onClick={() => {
                      recalculateRouteDistanceAndPrice(
                        selectedRoute.id, 
                        selectedRoute.roadConditionMultiplier || 1, 
                        selectedRoute.vehicleTypeMultiplier || 1
                      );
                      toast.success('Jarak & harga dikalkulasi ulang berdasarkan koordinat');
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Auto-Calc
                  </Button>
                  <Dialog open={openPoint} onOpenChange={setOpenPoint}>
                    <DialogTrigger asChild><Button onClick={openNewPoint}><Plus className="h-4 w-4 mr-1" />Tambah Titik</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingPoint ? 'Edit Titik Jemput' : 'Tambah Titik Jemput'}</DialogTitle>
                        <DialogDescription>
                          {editingPoint ? 'Ubah informasi lokasi penjemputan.' : 'Tambahkan lokasi penjemputan baru pada rute ini.'}
                        </DialogDescription>
                      </DialogHeader>
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
                          <TableCell className="font-medium">{p.distanceToDestination === 0 ? '—' : formatPrice(p.price)}</TableCell>
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

        {/* === MAP EDITOR TAB === */}
        <TabsContent value="map" className="space-y-4">
          <RouteMapEditor
            routes={routes}
            routePoints={routePoints}
            onSaveRoute={(route, points) => {
              setRoutes(prev => [...prev, route]);
              setRoutePoints(prev => [...prev, ...points]);
              toast.success('Rute baru berhasil disimpan');
            }}
            onUpdateRoute={(routeId, route, points) => {
              setRoutes(prev => prev.map(r => r.id === routeId ? route : r));
              setRoutePoints(prev => {
                const others = prev.filter(p => p.routeId !== routeId);
                return [...others, ...points];
              });
              toast.success('Rute berhasil diperbarui');
            }}
            onDeleteRoute={(routeId) => {
              setRoutes(prev => prev.filter(r => r.id !== routeId));
              setRoutePoints(prev => prev.filter(p => p.routeId !== routeId));
              toast.success('Rute berhasil dihapus');
            }}
            onSavePoint={(point) => {
              setRoutePoints(prev => [...prev, point]);
              toast.success('Titik jemput berhasil ditambahkan');
            }}
            onUpdatePoint={(pointId, point) => {
              setRoutePoints(prev => prev.map(p => p.id === pointId ? point : p));
              toast.success('Titik jemput berhasil diperbarui');
            }}
            onDeletePoint={(pointId) => {
              setRoutePoints(prev => prev.filter(p => p.id !== pointId));
              toast.success('Titik jemput berhasil dihapus');
            }}
          />
        </TabsContent>

        {/* === SCHEDULES TAB === */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openSchedule} onOpenChange={setOpenSchedule}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Tambah Jadwal</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Jadwal</DialogTitle>
                  <DialogDescription>
                    Atur jadwal keberangkatan untuk rute dan kendaraan tertentu.
                  </DialogDescription>
                </DialogHeader>
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

          {/* Driver Assignment Dialog */}
          <Dialog open={openDriverAssignment} onOpenChange={setOpenDriverAssignment}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Driver ke Jadwal</DialogTitle>
                <DialogDescription>
                  Pilih driver yang tersedia untuk menjalankan jadwal ini.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedScheduleForDriver && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      Jadwal: {routes.find(r => r.id === schedules.find(s => s.id === selectedScheduleForDriver)?.routeId)?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {schedules.find(s => s.id === selectedScheduleForDriver)?.departureDate} • {schedules.find(s => s.id === selectedScheduleForDriver)?.departureTime}
                    </p>
                  </div>
                )}

                <div>
                  <Label>Pilih Driver</Label>
                  <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih driver yang tersedia" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedScheduleForDriver && getAvailableDriversForSchedule(schedules.find(s => s.id === selectedScheduleForDriver)!).map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - Rating: {driver.rating} ⭐
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAssignDriver} disabled={!selectedDriverId} className="flex-1">
                    Assign Driver
                  </Button>
                  <Button variant="outline" onClick={() => setOpenDriverAssignment(false)} className="flex-1">
                    Batal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rute</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Kendaraan</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSchedules.map(s => {
                    const route = routes.find(r => r.id === s.routeId);
                    const vehicle = vehicles.find(v => v.id === s.vehicleId);
                    const assignedDriver = drivers.find(d => d.id === s.driverId);
                    const availableDrivers = getAvailableDriversForSchedule(s);

                    return (
                      <TableRow key={s.id}>
                        <TableCell>{route?.name}</TableCell>
                        <TableCell className="font-mono text-sm">{s.departureDate}</TableCell>
                        <TableCell className="font-mono">{s.departureTime}</TableCell>
                        <TableCell>{vehicle?.name} ({vehicle?.plateNumber})</TableCell>
                        <TableCell>
                          {assignedDriver ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{assignedDriver.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDriver(s.id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDriverAssignmentDialog(s.id)}
                              disabled={availableDrivers.length === 0}
                            >
                              {availableDrivers.length === 0 ? 'Tidak Ada Driver' : 'Assign Driver'}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell><Badge variant="secondary">{s.status}</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSchedule(s.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
