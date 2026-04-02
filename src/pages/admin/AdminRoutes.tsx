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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatRupiah } from '@/data/dummy';
import { toast } from 'sonner';
import { Route } from '@/types/shuttle';

const AdminRoutes = () => {
  const { routes, setRoutes } = useShuttle();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const [form, setForm] = useState({ name: '', rayon: 'A' as Route['rayon'], origin: '', destination: '', distanceMeters: 0, pricePerMeter: 1.5 });

  const openNew = () => { setEditing(null); setForm({ name: '', rayon: 'A', origin: '', destination: '', distanceMeters: 0, pricePerMeter: 1.5 }); setOpen(true); };
  const openEdit = (r: Route) => { setEditing(r); setForm({ name: r.name, rayon: r.rayon, origin: r.origin, destination: r.destination, distanceMeters: r.distanceMeters, pricePerMeter: r.pricePerMeter }); setOpen(true); };

  const handleSave = () => {
    const price = form.distanceMeters * form.pricePerMeter;
    if (editing) {
      setRoutes(prev => prev.map(r => r.id === editing.id ? { ...r, ...form, price } : r));
      toast.success('Rute diperbarui');
    } else {
      setRoutes(prev => [...prev, { id: `r${Date.now()}`, ...form, price }]);
      toast.success('Rute ditambahkan');
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => { setRoutes(prev => prev.filter(r => r.id !== id)); toast.success('Rute dihapus'); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Rute</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Tambah Rute</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Rute' : 'Tambah Rute'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nama Rute</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>Rayon</Label>
                <Select value={form.rayon} onValueChange={v => setForm({...form, rayon: v as Route['rayon']})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['A','B','C','D'].map(r => <SelectItem key={r} value={r}>Rayon {r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Asal</Label><Input value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} /></div>
                <div><Label>Tujuan</Label><Input value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Jarak (m)</Label><Input type="number" value={form.distanceMeters} onChange={e => setForm({...form, distanceMeters: Number(e.target.value)})} /></div>
                <div><Label>Harga/m (Rp)</Label><Input type="number" value={form.pricePerMeter} onChange={e => setForm({...form, pricePerMeter: Number(e.target.value)})} /></div>
              </div>
              <p className="text-sm text-muted-foreground">Total: {formatRupiah(form.distanceMeters * form.pricePerMeter)}</p>
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
                <TableHead>Rute</TableHead>
                <TableHead>Rayon</TableHead>
                <TableHead>Jarak</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell><Badge variant="outline">Rayon {r.rayon}</Badge></TableCell>
                  <TableCell>{(r.distanceMeters/1000).toFixed(0)} km</TableCell>
                  <TableCell>{formatRupiah(r.price)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default AdminRoutes;
