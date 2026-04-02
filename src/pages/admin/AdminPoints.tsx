import { useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { RoutePoint } from '@/types/shuttle';

const AdminPoints = () => {
  const { routePoints, setRoutePoints, routes } = useShuttle();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ routeId: '', code: '', name: '', order: 1 });
  const [filterRoute, setFilterRoute] = useState('all');

  const filtered = filterRoute === 'all' ? routePoints : routePoints.filter(p => p.routeId === filterRoute);

  const handleSave = () => {
    setRoutePoints(prev => [...prev, { id: `rp${Date.now()}`, ...form }]);
    toast.success('Titik jemput ditambahkan');
    setOpen(false);
  };

  const handleDelete = (id: string) => { setRoutePoints(prev => prev.filter(p => p.id !== id)); toast.success('Dihapus'); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Titik Penjemputan</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Tambah</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Titik Jemput</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Rute</Label>
                <Select value={form.routeId} onValueChange={v => setForm({...form, routeId: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih rute" /></SelectTrigger>
                  <SelectContent>{routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Kode</Label><Input placeholder="J1" value={form.code} onChange={e => setForm({...form, code: e.target.value})} /></div>
                <div><Label>Urutan</Label><Input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} /></div>
              </div>
              <div><Label>Nama Lokasi</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <Button className="w-full" onClick={handleSave}>Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={filterRoute} onValueChange={setFilterRoute}>
        <SelectTrigger className="w-64"><SelectValue placeholder="Filter rute" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Rute</SelectItem>
          {routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Rute</TableHead>
                <TableHead>Urutan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.sort((a,b) => a.order - b.order).map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono font-bold">{p.code}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{routes.find(r => r.id === p.routeId)?.name}</TableCell>
                  <TableCell>{p.order}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPoints;
