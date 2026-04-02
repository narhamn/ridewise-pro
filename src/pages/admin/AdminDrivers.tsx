import { useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Driver } from '@/types/shuttle';

const AdminDrivers = () => {
  const { drivers, setDrivers } = useShuttle();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', licenseNumber: '' });

  const openNew = () => { setEditing(null); setForm({ name: '', email: '', phone: '', licenseNumber: '' }); setOpen(true); };
  const openEdit = (d: Driver) => { setEditing(d); setForm({ name: d.name, email: d.email, phone: d.phone, licenseNumber: d.licenseNumber }); setOpen(true); };

  const handleSave = () => {
    if (editing) {
      setDrivers(prev => prev.map(d => d.id === editing.id ? { ...d, ...form } : d));
      toast.success('Driver diperbarui');
    } else {
      setDrivers(prev => [...prev, { id: `d${Date.now()}`, ...form, status: 'active' as const }]);
      toast.success('Driver ditambahkan');
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => { setDrivers(prev => prev.filter(d => d.id !== id)); toast.success('Dihapus'); };

  const toggleStatus = (id: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' } : d));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Driver</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Tambah</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Driver' : 'Tambah Driver'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nama</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><Label>Telepon</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div><Label>No. SIM</Label><Input value={form.licenseNumber} onChange={e => setForm({...form, licenseNumber: e.target.value})} /></div>
              <Button className="w-full" onClick={handleSave}>Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>SIM</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell className="font-mono">{d.licenseNumber}</TableCell>
                  <TableCell>
                    <Badge className={`cursor-pointer ${d.status === 'active' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`} onClick={() => toggleStatus(d.id)}>
                      {d.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDrivers;
