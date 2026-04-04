import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/data/dummy';
import { ArrowRight, TrendingUp, TrendingDown, Wallet as WalletIcon } from 'lucide-react';

const DriverWallet = () => {
  const navigate = useNavigate();
  const { currentUser, wallets, transactions } = useShuttle();

  const driverWallet = wallets.find(w => w.driverId === currentUser?.id);
  const driverTransactions = transactions
    .filter(t => t.driverId === currentUser?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'top-up': return <TrendingUp className="h-5 w-5 text-success" />;
      case 'payout': 
      case 'withdrawal': return <TrendingDown className="h-5 w-5 text-destructive" />;
      case 'commission': return <WalletIcon className="h-5 w-5 text-blue-500" />;
      default: return <WalletIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Saldo Anda</span>
            <WalletIcon className="h-6 w-6" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{formatRupiah(driverWallet?.balance || 0)}</p>
          <div className="flex gap-2 mt-4">
            <Button className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90" onClick={() => navigate('/driver/wallet/top-up')}>
              Top Up
            </Button>
            <Button variant="outline" className="flex-1 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/driver/wallet/withdraw')}>
              Tarik Saldo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {driverTransactions.length > 0 ? (
            driverTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(tx.type)}
                  <div className="flex flex-col">
                    <p className="font-semibold capitalize">{tx.type.replace('-', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    {tx.reference && <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{tx.reference}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'payout' || tx.type === 'withdrawal' ? 'text-destructive' : 'text-success'}`}>
                    {tx.type === 'payout' || tx.type === 'withdrawal' ? '' : '+'} {formatRupiah(tx.amount)}
                  </p>
                  <Badge 
                    variant={
                      tx.status === 'completed' ? 'success' : 
                      tx.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }
                    className="capitalize text-[10px] px-1.5 py-0 h-4"
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">Belum ada transaksi.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverWallet;
