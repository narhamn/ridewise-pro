import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/pricing';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/Pagination';

const AdminBookings = () => {
  const { bookings } = useShuttle();
  const { paginatedItems, ...paginationProps } = usePagination(bookings, { itemsPerPage: 10 });

  const statusColor: Record<string, string> = {
    confirmed: 'bg-success text-success-foreground',
    completed: 'bg-muted text-muted-foreground',
    cancelled: 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Monitoring Booking</h1>
      <Card>
        <CardContent className="p-0 flex flex-col">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Penumpang</TableHead>
                <TableHead>Rute</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Kursi</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Tidak ada booking untuk ditampilkan
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell className="font-medium">{b.userName}</TableCell>
                    <TableCell>{b.routeName}</TableCell>
                    <TableCell>{b.departureTime} · {b.bookingDate}</TableCell>
                    <TableCell>#{b.seatNumber}</TableCell>
                    <TableCell>{formatPrice(b.price)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={b.bookingType === 'realtime' ? 'border-orange-500 text-orange-600' : 'border-primary text-primary'}>
                        {b.bookingType === 'realtime' ? 'Realtime' : 'Terjadwal'}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge className={statusColor[b.status]}>{b.status}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            {...paginationProps}
            onPageChange={paginationProps.goToPage}
            onItemsPerPageChange={paginationProps.setItemsPerPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;
