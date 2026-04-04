import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/pricing';
import { format } from 'date-fns';
import { MessageSquare, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TicketStatus, TicketPriority } from '@/types/shuttle';
import { usePagination } from '@/hooks/usePagination';
import { Pagination } from '@/components/Pagination';

const AdminReports = () => {
  const { bookings, routes, schedules, tickets } = useShuttle();
  const navigate = useNavigate();
  const { paginatedItems: paginatedTickets, ...ticketPaginationProps } = usePagination(tickets, { itemsPerPage: 10 });

  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.price, 0);
  const completedTrips = schedules.filter(s => s.status === 'arrived').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  const revenueByRoute = routes.map(r => {
    const routeBookings = bookings.filter(b => b.routeId === r.id && b.status !== 'cancelled');
    return { name: r.name, revenue: routeBookings.reduce((s, b) => s + b.price, 0), count: routeBookings.length };
  }).filter(r => r.count > 0);

  const statusColors: Record<TicketStatus, string> = {
    open: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    in_progress: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    resolved: 'bg-primary text-primary-foreground border-transparent',
    closed: 'bg-slate-200 text-slate-700 border-transparent',
  };

  const priorityColors: Record<TicketPriority, string> = {
    low: 'bg-slate-100 text-slate-600 border-slate-200',
    medium: 'bg-blue-50 text-blue-600 border-blue-200',
    high: 'bg-amber-50 text-amber-600 border-amber-200',
    critical: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground">Laporan & Tiket</h1>
          <p className="text-muted-foreground font-medium text-sm">Monitor performa layanan dan keluhan pelanggan.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-black text-xs uppercase tracking-widest h-11 border-border/50">
            Unduh Laporan
          </Button>
          <Button className="rounded-xl font-black text-xs uppercase tracking-widest h-11 shadow-lg shadow-primary/20">
            Filter Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-primary overflow-hidden group relative">
          <div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-8 text-primary-foreground relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Total Pendapatan</p>
            <p className="text-3xl font-black tracking-tighter leading-none">{formatPrice(totalRevenue)}</p>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-bold bg-white/10 w-fit px-2 py-1 rounded-full">
              <span className="text-emerald-300">↑ 12.5%</span> dari bulan lalu
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white">
          <CardContent className="p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Perjalanan Selesai</p>
            <p className="text-3xl font-black tracking-tighter leading-none text-slate-800">{completedTrips}</p>
            <p className="text-[10px] font-bold text-muted-foreground mt-4 italic">Total armada yang tiba di tujuan</p>
          </CardContent>
        </Card>
        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white">
          <CardContent className="p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Booking Batal</p>
            <p className="text-3xl font-black tracking-tighter leading-none text-rose-600">{cancelledBookings}</p>
            <p className="text-[10px] font-bold text-muted-foreground mt-4 italic">Berdasarkan pembatalan user & sistem</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue by Route */}
        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="font-black text-sm uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Pendapatan per Rute
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            <div className="space-y-4">
              {revenueByRoute.map(r => (
                <div key={r.name} className="flex items-center justify-between p-4 bg-slate-50 border border-border/30 rounded-3xl hover:border-primary/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-800 tracking-tight">{r.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{r.count} booking sukses</p>
                    </div>
                  </div>
                  <p className="font-black text-primary tracking-tighter">{formatPrice(r.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="font-black text-sm uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Tiket Dukungan Terbaru
            </CardTitle>
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary" onClick={() => navigate('/admin/tickets')}>
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="p-8 pt-6 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {paginatedTickets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Tidak ada tiket untuk ditampilkan</p>
              ) : (
                paginatedTickets.map(t => (
                  <div 
                    key={t.id} 
                    className="p-4 bg-slate-50 border border-border/30 rounded-3xl hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => navigate(`/admin/ticket/${t.id}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full font-black text-[8px] uppercase tracking-widest px-1.5 py-0">
                          {t.ticketNumber}
                        </Badge>
                        <Badge className={cn("rounded-full font-black text-[8px] uppercase tracking-widest px-1.5 py-0 border", statusColors[t.status])}>
                          {t.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-[9px] font-bold">{format(new Date(t.createdAt), 'dd/MM HH:mm')}</span>
                      </div>
                    </div>
                    <h4 className="font-black text-sm text-slate-800 tracking-tight mb-2 group-hover:text-primary transition-colors">{t.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                          {t.reporterName.charAt(0)}
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">{t.reporterName}</span>
                      </div>
                      <Badge variant="outline" className={cn("rounded-full font-black text-[8px] uppercase tracking-tighter px-1.5", priorityColors[t.priority])}>
                        {t.priority}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination
              {...ticketPaginationProps}
              onPageChange={ticketPaginationProps.goToPage}
              onItemsPerPageChange={ticketPaginationProps.setItemsPerPage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
