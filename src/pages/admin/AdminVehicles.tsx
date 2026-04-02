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
import { Vehicle } from '@/types/shuttle';

const AdminVehicles = () => {
  const { vehicles, setVehicles } = useShuttle();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ name: '', plateNumber: '', capacity: 8, type: 'MPV' });

  const openNew = () => { setEditing(null); setForm({ name: '', plateNumber: '', capacity: 8, type: 'MPV' }); setOpen(true); };
  const openEdit = (v: Vehicle) => { setEditing(v); setForm({ name: v.name, plateNumber: v.plateNumber, capacity: v.capacity, type: v.type }); setOpen(true); };

  const handleSave = () => {
    if (editing) {
      setVehicles(prev => prev.map(v => v.id === editing.id ? { ...v, ...form } : v));
      toast.success('Kendaraan diperbarui');
    } else {
      setVehicles(prev => [...prev, { id: `v${Date.now()}`, ...form, status: 'active' as const }]);
      toast.success('Kendaraan ditambahkan');
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => { setVehicles(prev => prev.filter(v => v.id !== id)); toast.success('Dihapus'); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Kendaraan</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Tambah</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nama</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>Plat Nomor</Label><Input value={form.plateNumber} onChange={e => setForm({...form, plateNumber: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Kapasitas</Label><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: Number(e.target.value)})} /></div>
                <div><Label>Tipe</Label><Input value={form.type} onChange={e => setForm({...form, type: e.target.value})} /></div>
              </div>
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
                <TableHead>Plat</TableHead>
                <TableHead>Kapasitas</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="font-mono">{v.plateNumber}</TableCell>
                  <TableCell>{v.capacity} kursi</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell><Badge variant={v.status === 'active' ? 'default' : 'secondary'}>{v.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default AdminVehicles;
