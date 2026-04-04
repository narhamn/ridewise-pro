import { useQuery } from '@tanstack/react-query';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRupiah } from '@/data/dummy';
import { Wallet as WalletIcon, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WalletBalance = () => {
  const { currentUser, wallets, transactions } = useShuttle();
  const navigate = useNavigate();

  // Simulasi endpoint GET /api/driver/wallet/balance
  const { 
    data: balance, 
    isLoading: isLoadingBalance, 
    error: errorBalance, 
    refetch: refetchBalance 
  } = useQuery({
    queryKey: ['wallet-balance', currentUser?.id],
    queryFn: async () => {
      // Simulasi delay jaringan
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const wallet = wallets.find(w => w.driverId === currentUser?.id);
      if (!wallet && currentUser?.id) {
        // Jika tidak ditemukan, kembalikan 0 (bisa juga throw error tergantung kebijakan API)
        return 0;
      }
      return wallet?.balance || 0;
    },
    enabled: !!currentUser?.id,
    retry: 1,
  });

  // Simulasi endpoint GET /api/driver/wallet/transactions
  const { 
    data: recentTransactions, 
    isLoading: isLoadingTx, 
    error: errorTx, 
    refetch: refetchTx 
  } = useQuery({
    queryKey: ['wallet-transactions', currentUser?.id],
    queryFn: async () => {
      // Simulasi delay jaringan
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return transactions
        .filter(t => t.driverId === currentUser?.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
    },
    enabled: !!currentUser?.id,
    retry: 1,
  });

  const handleRetry = () => {
    refetchBalance();
    refetchTx();
  };

  if (isLoadingBalance || isLoadingTx) {
    return (
      <Card className="w-full bg-primary/5 border-primary/10">
        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-primary/10" />
              <Skeleton className="h-10 w-40 bg-primary/10" />
            </div>
            <Skeleton className="h-9 w-24 rounded-full bg-primary/10" />
          </div>
          <div className="pt-4 border-t border-primary/10 space-y-2">
            <Skeleton className="h-3 w-32 bg-primary/10" />
            <Skeleton className="h-4 w-full bg-primary/10" />
            <Skeleton className="h-4 w-full bg-primary/10" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (errorBalance || errorTx) {
    return (
      <Card className="w-full border-destructive/20 bg-destructive/5">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-destructive opacity-80" />
          <div className="space-y-1">
            <p className="font-semibold text-destructive">Gagal Memuat Saldo</p>
            <p className="text-xs text-muted-foreground">Terjadi kendala koneksi ke server</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2 h-8 text-xs">
            <RefreshCw className="h-3 w-3 mr-2" /> Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <p className="text-xs font-medium opacity-80 flex items-center gap-1.5 uppercase tracking-wider">
              <WalletIcon className="h-3.5 w-3.5" /> Saldo Dompet
            </p>
            <h3 className="text-3xl font-bold tracking-tight">
              {formatRupiah(balance || 0)}
            </h3>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-full shadow-md font-semibold px-4 hover:scale-105 transition-transform"
            onClick={() => navigate('/driver/wallet/top-up')}
          >
            Top Up
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Transaksi Terakhir</p>
            <Button 
              variant="link" 
              className="h-auto p-0 text-[10px] text-white/90 hover:text-white font-bold uppercase tracking-tighter"
              onClick={() => navigate('/driver/wallet')}
            >
              Semua <ArrowRight className="h-2.5 w-2.5 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-2.5">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center text-xs py-0.5 group">
                  <div className="flex flex-col">
                    <span className="font-medium opacity-90 truncate max-w-[140px]">
                      {tx.type === 'top-up' ? 'Top Up Saldo' : tx.type === 'commission' ? 'Komisi Trip' : tx.type === 'payout' ? 'Penarikan' : 'Biaya Layanan'}
                    </span>
                    <span className="text-[9px] opacity-60 font-mono tracking-tighter uppercase">{tx.date}</span>
                  </div>
                  <span className={`font-bold text-sm ${tx.type === 'payout' || tx.type === 'fee' ? 'text-red-200' : 'text-green-300'}`}>
                    {tx.type === 'payout' || tx.type === 'fee' ? '-' : '+'} {formatRupiah(tx.amount).replace('Rp', '').trim()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] opacity-60 italic">Belum ada aktivitas transaksi</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
