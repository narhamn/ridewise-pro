import { useState } from "react";
import { useShuttle } from "@/contexts/ShuttleContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Phone, 
  Search, 
  MoreVertical,
  Key,
  ShieldX,
  History,
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const AdminManagement = () => {
  const { customers, addAuditLog, currentUser } = useShuttle();
  const [open, setOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [reason, setReason] = useState("");

  // Filter only admin roles for this management view
  const admins = customers.filter(c => c.role === 'admin');

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    toast.success("Admin baru berhasil ditambahkan");
    setOpen(false);
    addAuditLog('Create Admin', `User ${currentUser?.name} created new admin account`);
  };

  const handleDeactivate = async () => {
    if (!reason) {
      toast.error("Alasan penonaktifan wajib diisi");
      return;
    }
    // Simulate API call
    toast.success(`Admin ${selectedAdmin.name} berhasil dinonaktifkan`);
    setDeactivateOpen(false);
    addAuditLog('Deactivate Admin', `User ${currentUser?.name} deactivated admin ${selectedAdmin.name}. Reason: ${reason}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Admin</h1>
          <p className="text-muted-foreground text-sm">Kelola akses, izin granular, dan keamanan akun administrator.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 shadow-lg shadow-primary/20">
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Tambah Admin Baru
              </DialogTitle>
              <DialogDescription>Daftarkan administrator baru dengan role permission granular.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAdmin} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input placeholder="Budi Santoso" required />
                </div>
                <div className="space-y-2">
                  <Label>Email Bisnis</Label>
                  <Input type="email" placeholder="budi@ridewise.pro" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Password Awal</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="Min. 8 karakter + simbol" className="pl-9" required />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Permissions Granular</Label>
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border">
                  {[
                    'manage_users', 'manage_drivers', 
                    'manage_vehicles', 'manage_routes',
                    'view_analytics', 'manage_finance'
                  ].map(perm => (
                    <div key={perm} className="flex items-center space-x-2">
                      <Checkbox id={perm} />
                      <label htmlFor={perm} className="text-xs font-medium leading-none cursor-pointer">
                        {perm.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
                <Button type="submit">Buat Akun Admin</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50 border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg"><ShieldCheck className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Admin</p>
              <p className="text-xl font-bold">{admins.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg"><UserCheck className="h-5 w-5 text-emerald-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Admin Aktif</p>
              <p className="text-xl font-bold">{admins.filter(a => (a.status || 'Active') === 'Active').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg"><History className="h-5 w-5 text-orange-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Log Aktivitas Hari Ini</p>
              <p className="text-xl font-bold">45</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50">
        <CardHeader className="bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Daftar Akun Administrator</CardTitle>
              <CardDescription>Akses kontrol hierarki untuk staf operasional platform.</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari admin..." className="pl-9 bg-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Nama & Email</TableHead>
                <TableHead>Role & Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Terakhir Login</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(admins || []).map((admin) => (
                <TableRow key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{admin.name || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {admin.email || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary" className="w-fit text-[10px] uppercase">{admin.role || 'admin'}</Badge>
                      <Badge className="w-fit bg-emerald-500 text-white text-[10px] uppercase">{admin.status || 'Active'}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {['manage_users', 'manage_drivers'].map(p => (
                        <Badge key={p} variant="outline" className="text-[9px] lowercase bg-white">{p.replace('_', ' ')}</Badge>
                      ))}
                      <span className="text-[9px] text-muted-foreground">+2 more</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Today, 09:45
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Reset Password">
                        <Key className="h-4 w-4 text-orange-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Nonaktifkan"
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setDeactivateOpen(true);
                        }}
                      >
                        <ShieldX className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deactivate Dialog */}
      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Konfirmasi Penonaktifan
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menonaktifkan akun <strong>{selectedAdmin?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Alasan Penonaktifan (Wajib)</Label>
              <Select onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih alasan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="security">Pelanggaran Keamanan</SelectItem>
                  <SelectItem value="resign">Resign / Berhenti Bekerja</SelectItem>
                  <SelectItem value="mistake">Kesalahan Operasional Berat</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-[10px] text-muted-foreground bg-slate-50 p-2 rounded border italic">
              * Aksi ini akan dicatat dalam audit trail dan notifikasi akan dikirim ke email admin terkait.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeactivateOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDeactivate}>Nonaktifkan Akun</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;
