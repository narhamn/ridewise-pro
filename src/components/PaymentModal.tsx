import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupiah } from '@/data/dummy';
import { PaymentMethod } from '@/types/shuttle';
import { CreditCard, Wallet, QrCode, CheckCircle, Loader2 } from 'lucide-react';

const methods: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { id: 'bank_transfer', label: 'Transfer Bank', icon: CreditCard, desc: 'BCA, Mandiri, BNI, BRI' },
  { id: 'ewallet', label: 'E-Wallet', icon: Wallet, desc: 'GoPay, OVO, Dana, ShopeePay' },
  { id: 'qris', label: 'QRIS', icon: QrCode, desc: 'Scan QR untuk bayar' },
];

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  onConfirm: (method: PaymentMethod) => void;
}

export const PaymentModal = ({ open, onClose, amount, onConfirm }: PaymentModalProps) => {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (step === 'processing') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep('success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setStep('select');
      setCountdown(10);
    }
  }, [open]);

  const handlePay = () => {
    if (!selected) return;
    setStep('processing');
  };

  const handleDone = () => {
    if (selected) onConfirm(selected);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' && 'Pilih Metode Pembayaran'}
            {step === 'processing' && 'Memproses Pembayaran'}
            {step === 'success' && 'Pembayaran Berhasil'}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-3">
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Total Pembayaran</p>
              <p className="text-2xl font-bold text-primary">{formatRupiah(amount)}</p>
            </div>
            {methods.map(m => (
              <Card
                key={m.id}
                className={`cursor-pointer transition-all ${selected === m.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                onClick={() => setSelected(m.id)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <m.icon className={`h-6 w-6 ${selected === m.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  {selected === m.id && <Badge className="bg-primary text-primary-foreground">Dipilih</Badge>}
                </CardContent>
              </Card>
            ))}
            <Button className="w-full" size="lg" disabled={!selected} onClick={handlePay}>
              Bayar Sekarang
            </Button>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
            <p className="text-sm text-muted-foreground">Menunggu pembayaran...</p>
            <p className="text-4xl font-bold text-primary">{countdown}s</p>
            <p className="text-xs text-muted-foreground">(Simulasi — pembayaran otomatis berhasil)</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-success mx-auto" />
            <p className="font-bold text-lg">Pembayaran Berhasil!</p>
            <p className="text-sm text-muted-foreground">{formatRupiah(amount)} via {methods.find(m => m.id === selected)?.label}</p>
            <Button className="w-full" size="lg" onClick={handleDone}>Lihat Tiket</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
