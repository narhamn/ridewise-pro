import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '@/data/dummy';
import { toast } from 'sonner';

const bankOptions = [
  { id: 'bca', name: 'Bank Central Asia (BCA)' },
  { id: 'mandiri', name: 'Bank Mandiri' },
  { id: 'bni', name: 'Bank Negara Indonesia (BNI)' },
  { id: 'bri', name: 'Bank Rakyat Indonesia (BRI)' },
];

const DriverWithdraw = () => {
  const navigate = useNavigate();
  const { currentUser, wallets, withdrawBalance } = useShuttle();
  
  const [amount, setAmount] = useState<number>(0);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'summary' | 'success'>('form');
  const [lastTransactionId, setLastTransactionId] = useState('');

  const wallet = wallets.find(w => w.driverId === currentUser?.id);
  const currentBalance = wallet?.balance || 0;

  const handleNext = () => {
    if (amount < 50000) {
      toast.error('Minimal penarikan adalah Rp 50.000');
      return;
    }
    if (amount > currentBalance) {
      toast.error('Saldo tidak mencukupi');
      return;
    }
    if (!bankName || !accountNumber) {
      toast.error('Harap lengkapi data rekening');
      return;
    }
    setStep('summary');
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    const result = await withdrawBalance(amount, bankName, accountNumber);
    setIsLoading(false);

    if (result.success) {
      setLastTransactionId(result.transactionId || '');
      setStep('success');
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  if (step === 'success') {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Pengajuan Berhasil!</h2>
          <p className="text-muted-foreground">Permintaan penarikan Anda sedang diproses oleh admin.</p>
          <p className="text-xs font-mono text-muted-foreground uppercase">ID: {lastTransactionId}</p>
        </div>
        <Card className="w-full">
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Penarikan</span>
              <span className="font-bold text-primary">{formatRupiah(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bank Tujuan</span>
              <span className="font-medium">{bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Rekening</span>
              <span className="font-medium">{accountNumber}</span>
            </div>
          </CardContent>
        </Card>
        <Button className="w-full" onClick={() => navigate('/driver/wallet')}>
          Kembali ke Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => step === 'summary' ? setStep('form') : navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{step === 'form' ? 'Tarik Saldo' : 'Konfirmasi Penarikan'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'form' ? (
            <>
              <div className="bg-primary/5 p-4 rounded-lg flex justify-between items-center border border-primary/10">
                <span className="text-sm font-medium">Saldo Tersedia</span>
                <span className="text-lg font-bold text-primary">{formatRupiah(currentBalance)}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Nominal Penarikan</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">Rp</span>
                  <Input
                    id="amount"
                    type="number"
                    className="pl-10 text-lg font-bold"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimal penarikan Rp 50.000</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Pilih Bank</Label>
                  <Select onValueChange={setBankName} value={bankName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bank tujuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankOptions.map(bank => (
                        <SelectItem key={bank.id} value={bank.name}>{bank.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acc">Nomor Rekening</Label>
                  <Input
                    id="acc"
                    placeholder="Masukkan nomor rekening"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg flex gap-3 border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-700">Pastikan data rekening sudah benar. Kesalahan input dapat menghambat proses pencairan dana.</p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nominal Penarikan</span>
                  <span className="font-bold">{formatRupiah(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Layanan</span>
                  <span className="font-bold text-success">Gratis</span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Dana Diterima</span>
                  <span className="text-xl font-bold text-primary">{formatRupiah(amount)}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm px-1">
                <h4 className="font-semibold">Rekening Tujuan</h4>
                <p className="text-muted-foreground">{bankName}</p>
                <p className="font-mono">{accountNumber}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {step === 'form' ? (
            <Button className="w-full" size="lg" onClick={handleNext} disabled={amount < 50000 || amount > currentBalance}>
              Lanjutkan
            </Button>
          ) : (
            <Button className="w-full" size="lg" onClick={handleWithdraw} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Memproses...' : 'Konfirmasi Penarikan'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default DriverWithdraw;
