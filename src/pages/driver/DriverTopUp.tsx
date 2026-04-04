import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { formatRupiah } from '@/data/dummy';
import { toast } from 'sonner';
import { PaymentMethod } from '@/types/shuttle';

const quickAmounts = [50000, 100000, 250000, 500000];

const DriverTopUp = () => {
  const navigate = useNavigate();
  const { currentUser, addTransaction } = useShuttle();
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [isLoading, setIsLoading] = useState(false);

  const handleTopUp = () => {
    if (amount < 10000) {
      toast.error('Minimal top up adalah Rp 10.000');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      if (!currentUser) {
        toast.error('Sesi berakhir, silakan login kembali');
        navigate('/driver/login');
        return;
      }
      const newTransaction = {
        id: `t${Date.now()}`,
        driverId: currentUser.id,
        amount,
        type: 'top-up' as const,
        status: 'completed' as const,
        date: new Date().toISOString().split('T')[0],
      };
      addTransaction(newTransaction);
      setIsLoading(false);
      toast.success('Top up berhasil!');
      navigate('/driver/wallet');
    }, 1500);
  };

  return (
    <div className="p-4 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Top Up Saldo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Nominal Top Up</Label>
            <Input
              id="amount"
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Masukkan nominal, misal: 50000"
              className="text-lg"
            />
            <div className="flex gap-2 pt-2">
              {quickAmounts.map(qAmount => (
                <Button key={qAmount} variant="outline" size="sm" onClick={() => setAmount(qAmount)}>
                  {formatRupiah(qAmount)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Metode Pembayaran</Label>
            <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)} className="space-y-2">
              <Label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="bank_transfer" />
                <span>Bank Transfer</span>
              </Label>
              <Label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="qris" />
                <span>QRIS</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold">Ringkasan</h4>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Nominal Top Up</span>
              <span className="font-bold">{formatRupiah(amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Biaya Admin</span>
              <span className="font-bold">{formatRupiah(0)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary">{formatRupiah(amount)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg" onClick={handleTopUp} disabled={isLoading || amount < 10000}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            {isLoading ? 'Memproses...' : 'Konfirmasi & Bayar'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DriverTopUp;
