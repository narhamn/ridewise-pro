import { useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Pencil, Trash2, Eye, FileText, Car, Wrench, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Vehicle } from '@/types/shuttle';
import { format } from 'date-fns';

const AdminVehicles = () => {
  const { vehicles, setVehicles, schedules, setSchedules, routes, drivers } = useShuttle();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<{
    name: string;
    plateNumber: string;
    capacity: number;
    type: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    vin: string;
    engineNumber: string;
    fuelType: 'bensin' | 'diesel' | 'listrik' | 'hybrid';
    transmission: 'manual' | 'automatic';
    stnkNumber: string;
    stnkExpiryDate: string;
    stnkOwnerName: string;
    lastServiceDate: string;
    nextServiceDate: string;
    mileage: number;
  }>({
    name: '',
    plateNumber: '',
    capacity: 8,
    type: 'MPV',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vin: '',
    engineNumber: '',
    fuelType: 'bensin',
    transmission: 'manual',
    stnkNumber: '',
    stnkExpiryDate: '',
    stnkOwnerName: '',
    lastServiceDate: '',
    nextServiceDate: '',
    mileage: 0
  });

  const openNew = () => {
    setEditing(null);
    setForm({
      name: '',
      plateNumber: '',
      capacity: 8,
      type: 'MPV',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      vin: '',
      engineNumber: '',
      fuelType: 'bensin',
      transmission: 'manual',
      stnkNumber: '',
      stnkExpiryDate: '',
      stnkOwnerName: '',
      lastServiceDate: '',
      nextServiceDate: '',
      mileage: 0
    });
    setOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      name: v.name,
      plateNumber: v.plateNumber,
      capacity: v.capacity,
      type: v.type,
      brand: v.brand || '',
      model: v.model || '',
      year: v.year || new Date().getFullYear(),
      color: v.color || '',
      vin: v.vin || '',
      engineNumber: v.engineNumber || '',
      fuelType: v.fuelType || 'bensin',
      transmission: v.transmission || 'manual',
      stnkNumber: v.stnkNumber || '',
      stnkExpiryDate: v.stnkExpiryDate || '',
      stnkOwnerName: v.stnkOwnerName || '',
      lastServiceDate: v.lastServiceDate || '',
      nextServiceDate: v.nextServiceDate || '',
      mileage: v.mileage || 0
    });
    setOpen(true);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    if (editing) {
      setVehicles(prev => prev.map(v => v.id === editing.id ? {
        ...v,
        ...form,
        updatedAt: now
      } : v));
      toast.success('Kendaraan diperbarui');
    } else {
      const newVehicle: Vehicle = {
        id: `v${Date.now()}`,
        ...form,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin1'
      };
      setVehicles(prev => [...prev, newVehicle]);
      toast.success('Kendaraan ditambahkan');
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    toast.success('Kendaraan dihapus');
  };

  const handleAssign = (scheduleId: string, driverId: string) => {
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, driverId: driverId || null } : s));
    toast.success('Driver di-assign ke jadwal');
  };

  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'maintenance': return 'bg-warning/10 text-warning border-warning/20';
      case 'inactive': return 'bg-muted text-muted-foreground border-muted';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Manajemen Kendaraan</h1>
          <p className="text-muted-foreground">Kelola detail kendaraan, dokumen, dan assignment driver</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Kendaraan
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detail Kendaraan</TabsTrigger>
          <TabsTrigger value="assign">Assign Driver</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Kendaraan</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicles.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif</CardTitle>
                <Car className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'active').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'maintenance').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Kapasitas</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(vehicles.reduce((acc, v) => acc + v.capacity, 0) / vehicles.length)} kursi
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Kendaraan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Plat Nomor</TableHead>
                    <TableHead>Brand/Model</TableHead>
                    <TableHead>Kapasitas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>STNK Expired</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell className="font-mono">{v.plateNumber}</TableCell>
                      <TableCell>{v.brand} {v.model}</TableCell>
                      <TableCell>{v.capacity} kursi</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(v.status)}>
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {v.stnkExpiryDate ? (
                          <span className={`text-sm ${new Date(v.stnkExpiryDate) < new Date() ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {format(new Date(v.stnkExpiryDate), 'dd/MM/yyyy')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedVehicle(v)}
                            aria-label={`Lihat detail ${v.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(v)}
                            aria-label={`Edit ${v.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(v.id)}
                            aria-label={`Hapus ${v.name}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedVehicle ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Detail Kendaraan: {selectedVehicle.name}</h2>
                <Button variant="outline" onClick={() => setSelectedVehicle(null)}>
                  Kembali
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Informasi Dasar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Nama</Label>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Plat Nomor</Label>
                        <p className="text-sm text-muted-foreground font-mono">{selectedVehicle.plateNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Brand</Label>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.brand || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Model</Label>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.model || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tahun</Label>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.year || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Warna</Label>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.color || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Kapasitas</Label>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.capacity} kursi</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tipe</Label>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Spesifikasi Teknis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">VIN</Label>
                        <p className="text-sm text-muted-foreground font-mono">{selectedVehicle.vin || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">No. Mesin</Label>
                        <p className="text-sm text-muted-foreground font-mono">{selectedVehicle.engineNumber || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Bahan Bakar</Label>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.fuelType || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Transmisi</Label>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.transmission || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Kilometer</Label>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.mileage?.toLocaleString() || '-'} km</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge className={getStatusColor(selectedVehicle.status)}>
                          {selectedVehicle.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informasi STNK
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">No. STNK</Label>
                        <p className="text-sm text-muted-foreground font-mono">{selectedVehicle.stnkNumber || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tanggal Expired</Label>
                        <p className={`text-sm ${selectedVehicle.stnkExpiryDate && new Date(selectedVehicle.stnkExpiryDate) < new Date() ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {selectedVehicle.stnkExpiryDate ? format(new Date(selectedVehicle.stnkExpiryDate), 'dd/MM/yyyy') : '-'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium">Nama Pemilik</Label>
                        <p className="text-sm text-muted-foreground">{selectedVehicle.stnkOwnerName || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Maintenance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Service Terakhir</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedVehicle.lastServiceDate ? format(new Date(selectedVehicle.lastServiceDate), 'dd/MM/yyyy') : '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Service Selanjutnya</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedVehicle.nextServiceDate ? format(new Date(selectedVehicle.nextServiceDate), 'dd/MM/yyyy') : '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedVehicle.documents && selectedVehicle.documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dokumen Kendaraan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedVehicle.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.type}</p>
                              <p className="text-sm text-muted-foreground">
                                Uploaded: {format(new Date(doc.uploadedAt), 'dd/MM/yyyy')}
                                {doc.expiryDate && ` • Expired: ${format(new Date(doc.expiryDate), 'dd/MM/yyyy')}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getDocumentStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Lihat
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedVehicle.photos && (
                <Card>
                  <CardHeader>
                    <CardTitle>Foto Kendaraan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {selectedVehicle.photos.exterior && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Exterior</Label>
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <img
                              src={selectedVehicle.photos.exterior}
                              alt="Foto exterior kendaraan"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                      {selectedVehicle.photos.interior && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Interior</Label>
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <img
                              src={selectedVehicle.photos.interior}
                              alt="Foto interior kendaraan"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                      {selectedVehicle.photos.dashboard && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Dashboard</Label>
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <img
                              src={selectedVehicle.photos.dashboard}
                              alt="Foto dashboard kendaraan"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Pilih kendaraan untuk melihat detail</h3>
              <p className="text-muted-foreground">Klik ikon mata pada tabel overview untuk melihat detail lengkap kendaraan.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assign Driver ke Jadwal</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rute</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Kendaraan</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map(s => {
                    const route = routes.find(r => r.id === s.routeId);
                    const vehicle = vehicles.find(v => v.id === s.vehicleId);
                    const driver = drivers.find(d => d.id === s.driverId);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{route?.name}</TableCell>
                        <TableCell>{format(new Date(s.departureDate), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-mono">{s.departureTime}</TableCell>
                        <TableCell>{vehicle?.name} ({vehicle?.plateNumber})</TableCell>
                        <TableCell>
                          <Select value={s.driverId || ''} onValueChange={v => handleAssign(s.id, v)}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Pilih driver" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Tidak ada driver</SelectItem>
                              {drivers.filter(d => d.status === 'active').map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.driverId ? 'default' : 'destructive'}>
                            {s.driverId ? 'Assigned' : 'Unassigned'}
                          </Badge>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Perbarui informasi detail kendaraan.' : 'Masukkan informasi lengkap kendaraan baru.'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Kendaraan *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Contoh: Hiace Commuter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plateNumber">Plat Nomor *</Label>
                  <Input
                    id="plateNumber"
                    value={form.plateNumber}
                    onChange={e => setForm({...form, plateNumber: e.target.value})}
                    placeholder="Contoh: BK 1234 AB"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Kapasitas (kursi) *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={form.capacity}
                    onChange={e => setForm({...form, capacity: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Kendaraan *</Label>
                  <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Minibus">Minibus</SelectItem>
                      <SelectItem value="MPV">MPV</SelectItem>
                      <SelectItem value="Bus">Bus</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Tahun</Label>
                  <Input
                    id="year"
                    type="number"
                    value={form.year}
                    onChange={e => setForm({...form, year: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={form.brand}
                    onChange={e => setForm({...form, brand: e.target.value})}
                    placeholder="Contoh: Toyota"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={form.model}
                    onChange={e => setForm({...form, model: e.target.value})}
                    placeholder="Contoh: Hiace"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Warna</Label>
                  <Input
                    id="color"
                    value={form.color}
                    onChange={e => setForm({...form, color: e.target.value})}
                    placeholder="Contoh: Putih"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Bahan Bakar</Label>
                  <Select value={form.fuelType} onValueChange={(v: 'bensin' | 'diesel' | 'listrik' | 'hybrid') => setForm({...form, fuelType: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bensin">Bensin</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="listrik">Listrik</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmisi</Label>
                  <Select value={form.transmission} onValueChange={(v: 'manual' | 'automatic') => setForm({...form, transmission: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Kilometer</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={form.mileage}
                    onChange={e => setForm({...form, mileage: Number(e.target.value)})}
                    placeholder="Contoh: 50000"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi STNK</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stnkNumber">Nomor STNK</Label>
                    <Input
                      id="stnkNumber"
                      value={form.stnkNumber}
                      onChange={e => setForm({...form, stnkNumber: e.target.value})}
                      placeholder="Contoh: STNK-001234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stnkExpiryDate">Tanggal Expired STNK</Label>
                    <Input
                      id="stnkExpiryDate"
                      type="date"
                      value={form.stnkExpiryDate}
                      onChange={e => setForm({...form, stnkExpiryDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stnkOwnerName">Nama Pemilik STNK</Label>
                  <Input
                    id="stnkOwnerName"
                    value={form.stnkOwnerName}
                    onChange={e => setForm({...form, stnkOwnerName: e.target.value})}
                    placeholder="Contoh: PT PYU GO Transport"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Teknis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                    <Input
                      id="vin"
                      value={form.vin}
                      onChange={e => setForm({...form, vin: e.target.value})}
                      placeholder="Contoh: MHKM1BA1AKJ123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engineNumber">Nomor Mesin</Label>
                    <Input
                      id="engineNumber"
                      value={form.engineNumber}
                      onChange={e => setForm({...form, engineNumber: e.target.value})}
                      placeholder="Contoh: 1TR123456"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Maintenance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastServiceDate">Tanggal Service Terakhir</Label>
                    <Input
                      id="lastServiceDate"
                      type="date"
                      value={form.lastServiceDate}
                      onChange={e => setForm({...form, lastServiceDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextServiceDate">Tanggal Service Selanjutnya</Label>
                    <Input
                      id="nextServiceDate"
                      type="date"
                      value={form.nextServiceDate}
                      onChange={e => setForm({...form, nextServiceDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={!form.name || !form.plateNumber}>
              {editing ? 'Perbarui' : 'Simpan'} Kendaraan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVehicles;
