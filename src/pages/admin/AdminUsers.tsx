import { useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search, UserCheck, UserX, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Driver, User } from '@/types/shuttle';

const AdminUsers = () => {
  const { drivers, setDrivers, customers, setCustomers, addAuditLog } = useShuttle();
  const [searchTerm, setSearchSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'drivers' | 'customers'>('drivers');
  
  // State for Driver Dialog
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverForm, setDriverForm] = useState<Partial<Driver>>({
    name: '', email: '', phone: '', licenseNumber: '', status: 'active'
  });

  // State for Customer Dialog
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [customerForm, setCustomerForm] = useState<Partial<User>>({
    name: '', email: '', phone: '', role: 'customer'
  });

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveDriver = () => {
    if (editingDriver) {
      setDrivers(prev => prev.map(d => d.id === editingDriver.id ? { ...d, ...driverForm } as Driver : d));
      addAuditLog('Update Driver', `Updated driver ${editingDriver.name} (${editingDriver.id})`);
      toast.success('Driver berhasil diperbarui');
    } else {
      const newDriver: Driver = {
        id: `d${Date.now()}`,
        ...driverForm as Driver,
        status: 'active'
      };
      setDrivers(prev => [...prev, newDriver]);
      addAuditLog('Create Driver', `Created new driver ${newDriver.name}`);
      toast.success('Driver berhasil ditambahkan');
    }
    setDriverDialogOpen(false);
  };

  const handleSaveCustomer = () => {
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...customerForm } as User : c));
      addAuditLog('Update Customer', `Updated customer ${editingCustomer.name} (${editingCustomer.id})`);
      toast.success('Customer berhasil diperbarui');
    } else {
      const newCustomer: User = {
        id: `u${Date.now()}`,
        ...customerForm as User,
        role: 'customer'
      };
      setCustomers(prev => [...prev, newCustomer]);
      addAuditLog('Create Customer', `Created new customer ${newCustomer.name}`);
      toast.success('Customer berhasil ditambahkan');
    }
    setCustomerDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Manajemen User</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari nama atau email..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {
            if (activeTab === 'drivers') {
              setEditingDriver(null);
              setDriverForm({ name: '', email: '', phone: '', licenseNumber: '', status: 'active' });
              setDriverDialogOpen(true);
            } else {
              setEditingCustomer(null);
              setCustomerForm({ name: '', email: '', phone: '', role: 'customer' });
              setCustomerDialogOpen(true);
            }
          }}>
            <Plus className="h-4 w-4 mr-2" /> Tambah
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Driver
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" /> Customer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email / Telepon</TableHead>
                    <TableHead>No. SIM</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>
                        <div className="text-xs">{d.email}</div>
                        <div className="text-xs text-muted-foreground">{d.phone}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{d.licenseNumber}</TableCell>
                      <TableCell>
                        <Badge variant={d.status === 'active' ? 'success' : 'secondary'}>
                          {d.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingDriver(d);
                            setDriverForm(d);
                            setDriverDialogOpen(true);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                            setDrivers(prev => prev.filter(item => item.id !== d.id));
                            addAuditLog('Delete Driver', `Deleted driver ${d.name} (${d.id})`);
                            toast.success('Driver dihapus');
                          }}>
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="customers" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingCustomer(c);
                            setCustomerForm(c);
                            setCustomerDialogOpen(true);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                            setCustomers(prev => prev.filter(item => item.id !== c.id));
                            addAuditLog('Delete Customer', `Deleted customer ${c.name} (${c.id})`);
                            toast.success('Customer dihapus');
                          }}>
                            <Trash2 className="h-4 w-4" />
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
      </Tabs>

      {/* Driver Dialog */}
      <Dialog open={driverDialogOpen} onOpenChange={setDriverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDriver ? 'Edit Driver' : 'Tambah Driver Baru'}</DialogTitle>
            <DialogDescription>
              {editingDriver ? 'Ubah informasi data driver yang sudah ada.' : 'Lengkapi data untuk mendaftarkan driver baru ke sistem.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value={driverForm.name} onChange={e => setDriverForm({...driverForm, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={driverForm.email} onChange={e => setDriverForm({...driverForm, email: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input id="phone" value={driverForm.phone} onChange={e => setDriverForm({...driverForm, phone: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="license">No. SIM</Label>
              <Input id="license" value={driverForm.licenseNumber} onChange={e => setDriverForm({...driverForm, licenseNumber: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDriverDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveDriver}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Tambah Customer Baru'}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? 'Ubah profil pelanggan yang terpilih.' : 'Daftarkan pelanggan baru ke basis data sistem.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="c-name">Nama Lengkap</Label>
              <Input id="c-name" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-phone">No. Telepon</Label>
              <Input id="c-phone" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveCustomer}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
