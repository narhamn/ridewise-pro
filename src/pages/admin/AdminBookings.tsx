import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/data/dummy';

const AdminBookings = () => {
  const { bookings } = useShuttle();

  const statusColor: Record<string, string> = {
    confirmed: 'bg-success text-success-foreground',
    completed: 'bg-muted text-muted-foreground',
    cancelled: 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Monitoring Booking</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Penumpang</TableHead>
                <TableHead>Rute</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Kursi</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.id}</TableCell>
                  <TableCell className="font-medium">{b.userName}</TableCell>
                  <TableCell>{b.routeName}</TableCell>
                  <TableCell>{b.departureTime} · {b.bookingDate}</TableCell>
                  <TableCell>#{b.seatNumber}</TableCell>
                  <TableCell>{formatRupiah(b.price)}</TableCell>
                  <TableCell><Badge className={statusColor[b.status]}>{b.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;
