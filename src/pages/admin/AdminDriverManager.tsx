import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Plus, 
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Car,
  FileText,
  Eye,
  History as HistoryIcon,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Pencil,
  Trash2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Driver, VerificationStatus } from '@/types/shuttle';
import { toast } from 'sonner';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/Pagination';

const AdminDriverManager = () => {
  const { drivers, setDrivers, updateRegistrationStatus, currentUser } = useShuttle();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'list';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };
  
  // List State
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', licenseNumber: '' });

  // Verification State
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedReg, setSelectedReg] = useState<Driver | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Access Control
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="p-6 bg-rose-50 rounded-full">
          <AlertTriangle className="h-12 w-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Akses Ditolak</h2>
        <p className="text-muted-foreground font-medium">Anda tidak memiliki izin untuk mengakses modul manajemen driver ini.</p>
      </div>
    );
  }

  // Filter Logic
  const activeDrivers = drivers.filter(d => d.verificationStatus === 'approved');
  const registrations = drivers.filter(d => d.verificationStatus !== 'approved');

  const filteredActive = activeDrivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phoneNumber.includes(searchQuery)
  );

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.verificationStatus === filterStatus;
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const regDate = new Date(r.submittedAt || r.joinDate);
      matchesDate = isWithinInterval(regDate, {
        start: startOfDay(new Date(dateRange.start)),
        end: endOfDay(new Date(dateRange.end))
      });
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const { paginatedItems: paginatedActive, ...activePaginationProps } = usePagination(filteredActive, { itemsPerPage: 10 });
  const { paginatedItems: paginatedRegistrations, ...registrationPaginationProps } = usePagination(filteredRegistrations, { itemsPerPage: 10 });

  // Handlers
  const openNew = () => { 
    setEditing(null); 
    setForm({ name: '', email: '', phoneNumber: '', licenseNumber: '' }); 
    setOpenForm(true); 
  };

  const openEdit = (d: Driver) => { 
    setEditing(d); 
    setForm({ name: d.name, email: d.email, phoneNumber: d.phoneNumber, licenseNumber: d.licenseNumber }); 
    setOpenForm(true); 
  };

  const handleSaveDriver = () => {
    if (editing) {
      setDrivers(prev => prev.map(d => d.id === editing.id ? { ...d, ...form } : d));
      toast.success('Informasi driver diperbarui');
    } else {
      const newDriver: Driver = {
        ...form,
        id: `d${Date.now()}`,
        status: 'offline',
        verificationStatus: 'approved',
        rating: 5.0,
        totalTrips: 0,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setDrivers(prev => [...prev, newDriver]);
      toast.success('Driver baru berhasil ditambahkan');
    }
    setOpenForm(false);
  };

  const handleDeleteDriver = (id: string) => { 
    setDrivers(prev => prev.filter(d => d.id !== id)); 
    toast.success('Driver berhasil dihapus'); 
  };

  const handleApprove = (id: string) => {
    updateRegistrationStatus(id, 'approved');
    setSelectedReg(null);
  };

  const handleReject = () => {
    if (!selectedReg || !rejectionReason.trim()) return;
    updateRegistrationStatus(selectedReg.id, 'rejected', rejectionReason);
    setShowRejectDialog(false);
    setRejectionReason('');
    setSelectedReg(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground">Manajemen Driver</h1>
          <p className="text-muted-foreground font-medium text-sm">Kelola seluruh mitra driver dan pantau proses verifikasi.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black uppercase tracking-widest text-[10px]">
            {activeDrivers.length} Aktif
          </Badge>
          <Badge variant="outline" className="rounded-full bg-amber-500/10 text-amber-600 border-amber-200 px-3 py-1 font-black uppercase tracking-widest text-[10px]">
            {registrations.filter(r => r.verificationStatus === 'pending').length} Menunggu Verifikasi
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-14 border border-slate-200/50">
          <TabsTrigger value="list" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-lg h-12 px-6">
            <Users className="h-4 w-4 mr-2" /> Daftar Driver
          </TabsTrigger>
          <TabsTrigger value="verification" className="rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-lg h-12 px-6">
            <ShieldCheck className="h-4 w-4 mr-2" /> Verifikasi Pendaftaran
          </TabsTrigger>
        </TabsList>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder={activeTab === 'list' ? "Cari driver aktif..." : "Cari pendaftar..."}
            className="pl-11 h-14 rounded-[1.25rem] border-none shadow-xl shadow-slate-200/50 bg-white font-bold"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <TabsContent value="list" className="space-y-4 outline-none">
          <div className="flex justify-end">
            <Button onClick={openNew} className="rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" /> Tambah Driver Manual
            </Button>
          </div>

          <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white flex flex-col">
            <CardContent className="p-0 flex flex-col flex-1">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 pl-8">Driver</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Kontak</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Lisensi</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px]">Status Operasional</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[10px] text-right pr-8">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedActive.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Tidak ada driver aktif yang ditemukan</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedActive.map(d => (
                      <TableRow key={d.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                        <TableCell className="py-6 pl-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                              {d.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 leading-none">{d.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">ID: {d.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><Mail className="h-3 w-3" /> {d.email}</p>
                            <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5"><Phone className="h-3 w-3" /> {d.phoneNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg font-mono font-bold border-slate-200 bg-slate-50/50 px-2 py-0.5">
                            {d.licenseNumber}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={cn(
                              "rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest transition-all",
                              d.status === 'online' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                            )}
                          >
                            {d.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5" onClick={() => openEdit(d)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-destructive hover:bg-destructive/5" onClick={() => handleDeleteDriver(d.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Pagination
                {...activePaginationProps}
                onPageChange={activePaginationProps.goToPage}
                onItemsPerPageChange={activePaginationProps.setItemsPerPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="outline-none">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-4">
              {/* Verification Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['all', 'pending', 'approved', 'rejected'].map(s => (
                  <Button
                    key={s}
                    variant={filterStatus === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(s as any)}
                    className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-4"
                  >
                    {s}
                  </Button>
                ))}
                <Separator orientation="vertical" className="h-10 mx-2 bg-slate-100" />
                <div className="flex items-center gap-2 bg-white px-4 rounded-xl shadow-sm border border-slate-100">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <Input type="date" className="border-none h-8 text-[10px] font-bold p-0 w-28 focus-visible:ring-0" value={dateRange.start} onChange={e => setDateRange(p => ({...p, start: e.target.value}))} />
                  <span className="text-slate-300">-</span>
                  <Input type="date" className="border-none h-8 text-[10px] font-bold p-0 w-28 focus-visible:ring-0" value={dateRange.end} onChange={e => setDateRange(p => ({...p, end: e.target.value}))} />
                </div>
              </div>

              {filteredRegistrations.length === 0 ? (
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 p-12 text-center bg-white">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Search className="h-8 w-8" />
                  </div>
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Tidak ada data pendaftaran</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {paginatedRegistrations.map(reg => (
                    <Card 
                      key={reg.id} 
                      className={cn(
                        "group rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white cursor-pointer transition-all hover:shadow-2xl active:scale-[0.99]",
                        selectedReg?.id === reg.id ? "ring-2 ring-primary ring-offset-4" : ""
                      )}
                      onClick={() => setSelectedReg(reg)}
                    >
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl">
                            {reg.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-black text-slate-800 tracking-tight">{reg.name}</h3>
                              <Badge className={cn(
                                "rounded-full font-black text-[8px] uppercase tracking-widest px-2 py-0 border",
                                reg.verificationStatus === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                reg.verificationStatus === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                "bg-rose-50 text-rose-600 border-rose-100"
                              )}>
                                {reg.verificationStatus}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {reg.email}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(reg.submittedAt || reg.joinDate), 'dd MMM yyyy')}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                      </CardContent>
                    </Card>
                  ))}
                  <Pagination
                    {...registrationPaginationProps}
                    onPageChange={registrationPaginationProps.goToPage}
                    onItemsPerPageChange={registrationPaginationProps.setItemsPerPage}
                  />
                </div>
              )}
            </div>

            {/* Detail Panel */}
            <div className="space-y-6">
              {selectedReg ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
                    <CardHeader className="p-6 pb-0">
                      <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                        <User className="h-3.5 w-3.5" /> Detail Pendaftar
                      </h3>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nama Lengkap</p>
                          <p className="text-sm font-black text-slate-800">{selectedReg.name}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">No. Lisensi / SIM</p>
                          <p className="text-xs font-black text-slate-800">{selectedReg.licenseNumber}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">No. Telepon</p>
                          <p className="text-xs font-black text-slate-800">{selectedReg.phoneNumber}</p>
                        </div>
                        {selectedReg.vehicleDetails && (
                          <div className="col-span-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kendaraan</p>
                            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                              <Car className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-xs font-black text-slate-800 leading-none">{selectedReg.vehicleDetails.plateNumber}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{selectedReg.vehicleDetails.brandModel} ({selectedReg.vehicleDetails.year})</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator className="bg-slate-50" />

                      {/* Documents */}
                      {selectedReg.documents && selectedReg.documents.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dokumen Pendukung</h4>
                          <div className="grid gap-3">
                            {selectedReg.documents.map(doc => (
                              <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-800 leading-none uppercase">{doc.type.replace('_', ' ')}</p>
                                    {doc.manipulationScore !== undefined && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <div className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          doc.manipulationScore > 0.5 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                                        )} />
                                        <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400">
                                          AI Security Score: {((1 - doc.manipulationScore) * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-slate-300 group-hover:text-primary">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {selectedReg.verificationStatus === 'pending' && (
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                          <Button 
                            variant="outline" 
                            className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => setShowRejectDialog(true)}
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Tolak
                          </Button>
                          <Button 
                            className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                            onClick={() => handleApprove(selectedReg.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Setujui
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Audit Trail */}
                  {selectedReg.logs && selectedReg.logs.length > 0 && (
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                      <CardHeader className="p-6 pb-0">
                        <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                          <HistoryIcon className="h-3.5 w-3.5" /> Audit Trail
                        </h3>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {selectedReg.logs.map(log => (
                            <div key={log.id} className="flex gap-3 relative before:absolute before:left-4 before:top-8 before:bottom-0 before:w-0.5 before:bg-slate-50 last:before:hidden">
                              <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                log.status === 'approved' ? "bg-emerald-50 text-emerald-500" :
                                log.status === 'rejected' ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"
                              )}>
                                {log.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> :
                                 log.status === 'rejected' ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 -mt-0.5">
                                <p className="text-[10px] font-black text-slate-800 leading-none uppercase tracking-widest">{log.status}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">{log.changedBy} • {format(new Date(log.timestamp), 'HH:mm, dd MMM')}</p>
                                {log.reason && <p className="text-[10px] italic text-slate-500 mt-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">"{log.reason}"</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white p-8 text-center border-2 border-dashed border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
                  <ShieldCheck className="h-16 w-16 text-slate-100 mb-4" />
                  <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Pilih pendaftaran untuk melihat detail verifikasi</p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Driver Form Dialog */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl tracking-tight">{editing ? 'Edit Driver' : 'Tambah Driver Manual'}</DialogTitle>
            <DialogDescription className="font-medium">
              {editing ? 'Perbarui informasi profil driver yang sudah aktif.' : 'Daftarkan driver secara manual (bypass pendaftaran publik).'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Lengkap</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="rounded-2xl border-slate-100 h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="rounded-2xl border-slate-100 h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">No. Telepon</Label>
                <Input value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} className="rounded-2xl border-slate-100 h-12" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">No. Lisensi (SIM)</Label>
                <Input value={form.licenseNumber} onChange={e => setForm({...form, licenseNumber: e.target.value})} className="rounded-2xl border-slate-100 h-12" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenForm(false)} className="rounded-xl font-black uppercase tracking-widest text-[10px]">Batal</Button>
            <Button onClick={handleSaveDriver} className="rounded-xl font-black uppercase tracking-widest text-[10px] px-8 h-12 shadow-lg shadow-primary/20">Simpan Driver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl tracking-tight text-rose-600">Tolak Pendaftaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Alasan Penolakan</Label>
              <Textarea 
                placeholder="Berikan alasan mengapa pendaftaran ini ditolak..." 
                className="rounded-2xl border-slate-100 min-h-[120px] font-medium"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowRejectDialog(false)} className="rounded-xl font-black uppercase tracking-widest text-[10px]">Batal</Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
              className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-rose-500 hover:bg-rose-600 h-12 px-8"
            >
              Konfirmasi Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDriverManager;
