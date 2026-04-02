import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, Shield, Settings2 } from 'lucide-react';
import { PaymentConfig } from '@/types/shuttle';

const AdminPaymentSettings = () => {
  const [config, setConfig] = useState<PaymentConfig>({
    provider: 'midtrans',
    serverKey: '',
    clientKey: '',
    environment: 'sandbox',
    enabled: false,
  });

  const handleSave = () => {
    toast.success('Konfigurasi payment berhasil disimpan! (Simulasi)');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6" /> Payment Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Konfigurasi payment gateway untuk menerima pembayaran</p>
      </div>

      {/* Status Card */}
      <Card className={config.enabled ? 'border-success' : 'border-warning'}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className={`h-8 w-8 ${config.enabled ? 'text-success' : 'text-warning'}`} />
            <div>
              <p className="font-medium">Payment Gateway</p>
              <p className="text-sm text-muted-foreground">{config.enabled ? 'Aktif dan menerima pembayaran' : 'Nonaktif'}</p>
            </div>
          </div>
          <Switch checked={config.enabled} onCheckedChange={v => setConfig(prev => ({ ...prev, enabled: v }))} />
        </CardContent>
      </Card>

      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Settings2 className="h-5 w-5" /> Provider</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(['midtrans', 'xendit'] as const).map(p => (
              <Card
                key={p}
                className={`cursor-pointer transition-all ${config.provider === p ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                onClick={() => setConfig(prev => ({ ...prev, provider: p }))}
              >
                <CardContent className="p-4 text-center">
                  <p className="font-bold text-lg capitalize">{p}</p>
                  <p className="text-xs text-muted-foreground">{p === 'midtrans' ? 'by GoTo Financial' : 'by Xendit'}</p>
                  {config.provider === p && <Badge className="mt-2 bg-primary text-primary-foreground">Aktif</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Server Key</Label>
            <Input
              type="password"
              placeholder={`${config.provider === 'midtrans' ? 'SB-Mid-server-...' : 'xnd_development_...'}`}
              value={config.serverKey}
              onChange={e => setConfig(prev => ({ ...prev, serverKey: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground mt-1">Jangan bagikan ke siapapun</p>
          </div>
          <div>
            <Label>Client Key</Label>
            <Input
              type="password"
              placeholder={`${config.provider === 'midtrans' ? 'SB-Mid-client-...' : 'xnd_public_development_...'}`}
              value={config.clientKey}
              onChange={e => setConfig(prev => ({ ...prev, clientKey: e.target.value }))}
            />
          </div>
          <div>
            <Label>Environment</Label>
            <Select value={config.environment} onValueChange={(v: 'sandbox' | 'production') => setConfig(prev => ({ ...prev, environment: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">🧪 Sandbox (Testing)</SelectItem>
                <SelectItem value="production">🚀 Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Metode Pembayaran</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Transfer Bank', desc: 'BCA, Mandiri, BNI, BRI', enabled: true },
              { name: 'E-Wallet', desc: 'GoPay, OVO, Dana, ShopeePay', enabled: true },
              { name: 'QRIS', desc: 'Scan QR Code', enabled: true },
            ].map(m => (
              <div key={m.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                <Switch defaultChecked={m.enabled} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSave}>Simpan Konfigurasi</Button>
    </div>
  );
};

export default AdminPaymentSettings;
