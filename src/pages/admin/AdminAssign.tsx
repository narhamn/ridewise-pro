import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AdminAssign = () => {
  const { schedules, setSchedules, routes, drivers, vehicles } = useShuttle();

  const handleAssign = (scheduleId: string, driverId: string) => {
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, driverId: driverId || null } : s));
    toast.success('Driver di-assign');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Assign Driver ke Jadwal</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rute</TableHead>
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
                return (
                  <TableRow key={s.id}>
                    <TableCell>{route?.name}</TableCell>
                    <TableCell className="font-mono">{s.departureTime}</TableCell>
                    <TableCell>{vehicle?.name}</TableCell>
                    <TableCell>
                      <Select value={s.driverId || ''} onValueChange={v => handleAssign(s.id, v)}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Pilih driver" /></SelectTrigger>
                        <SelectContent>
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
    </div>
  );
};

export default AdminAssign;
