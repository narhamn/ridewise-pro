import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/pricing';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/Pagination';

const CustomerHistory = () => {
  const { bookings } = useShuttle();
  const navigate = useNavigate();
  const { paginatedItems, ...paginationProps } = usePagination(bookings, { itemsPerPage: 10 });

  const statusColor = {
    confirmed: 'bg-success text-success-foreground',
    completed: 'bg-muted text-muted-foreground',
    cancelled: 'bg-destructive text-destructive-foreground',
  };
  const statusLabel = { confirmed: 'Aktif', completed: 'Selesai', cancelled: 'Batal' };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Riwayat Perjalanan</h2>
      {bookings.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">Belum ada riwayat perjalanan</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedItems.map(b => (
              <Card key={b.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/customer/booking/${b.id}`)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{b.routeName}</p>
                    <Badge className={statusColor[b.status]}>{statusLabel[b.status]}</Badge>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{b.bookingDate} · {b.departureTime}</span>
                    <span className="font-medium text-foreground">{formatPrice(b.price)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Kursi #{b.seatNumber} · {b.pickupPointName}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination
            {...paginationProps}
            onPageChange={paginationProps.goToPage}
            onItemsPerPageChange={paginationProps.setItemsPerPage}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerHistory;
