import { useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminSchedules = () => {
  const { schedules, setSchedules, routes, vehicles } = useShuttle();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ routeId: '', departureTime: '', vehicleId: '' });

  const handleSave = () => {
    setSchedules(prev => [...prev, { id: `s${Date.now()}`, ...form, driverId: null, status: 'scheduled' as const }]);
    toast.success('Jadwal ditambahkan');
    setOpen(false);
  };

  const handleDelete = (id: string) => { setSchedules(prev => prev.filter(s => s.id !== id)); toast.success('Dihapus'); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Jadwal</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Tambah</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Jadwal</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Rute</Label>
                <Select value={form.routeId} onValueChange={v => setForm({...form, routeId: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih rute" /></SelectTrigger>
                  <SelectContent>{routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Jam Berangkat</Label><Input type="time" value={form.departureTime} onChange={e => setForm({...form, departureTime: e.target.value})} /></div>
              <div><Label>Kendaraan</Label>
                <Select value={form.vehicleId} onValueChange={v => setForm({...form, vehicleId: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih kendaraan" /></SelectTrigger>
                  <SelectContent>{vehicles.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.plateNumber})</SelectItem>)}</SelectContent>
                </Select>
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
                <TableHead>Rute</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Kendaraan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{routes.find(r => r.id === s.routeId)?.name}</TableCell>
                  <TableCell className="font-mono">{s.departureTime}</TableCell>
                  <TableCell>{vehicles.find(v => v.id === s.vehicleId)?.name}</TableCell>
                  <TableCell><Badge variant="secondary">{s.status}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSchedules;
