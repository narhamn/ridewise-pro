import { useState, useEffect } from "react";
import { useShuttle } from "@/contexts/ShuttleContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Wallet, 
  Percent, 
  Navigation, 
  History, 
  Save, 
  RefreshCcw, 
  ArrowRight,
  Calculator,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatRupiah } from "@/data/dummy";
import { Separator } from "@/components/ui/separator";

const BusinessConfigPage = () => {
  const { systemConfig, updateSystemConfig, addAuditLog, currentUser } = useShuttle();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    platformFeePercentage: 10,
    driverCommissionPercentage: 80,
    basePricePerKm: 5000,
  });

  useEffect(() => {
    if (systemConfig) {
      setForm({
        platformFeePercentage: systemConfig.platformFeePercentage,
        driverCommissionPercentage: systemConfig.driverCommissionPercentage,
        basePricePerKm: systemConfig.basePricePerKm,
      });
    }
  }, [systemConfig]);

  const handleSave = async (key: keyof typeof form, label: string) => {
    const value = form[key];
    
    // Validations
    if (key.includes('Percentage') && (value < 0 || value > 100)) {
      toast.error(`${label} harus antara 0-100%`);
      return;
    }
    if (key === 'basePricePerKm' && value < 0) {
      toast.error(`${label} tidak boleh negatif`);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const oldValue = (systemConfig as any)[key];
      updateSystemConfig({ [key]: value });
      
      addAuditLog(
        'Update Business Config', 
        `User ${currentUser?.name} changed ${label} from ${oldValue} to ${value}`
      );
      
      toast.success(`${label} berhasil diperbarui`);
    } catch (error) {
      toast.error(`Gagal memperbarui ${label}`);
    } finally {
      setLoading(false);
    }
  };

  // Preview Calculations
  const testDistance = 10; // 10km
  const totalPrice = testDistance * form.basePricePerKm;
  const platformEarnings = (totalPrice * form.platformFeePercentage) / 100;
  const driverEarnings = (totalPrice * form.driverCommissionPercentage) / 100;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Bisnis</h1>
          <p className="text-muted-foreground text-sm">Kelola parameter keuangan, komisi, dan harga dasar platform.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-slate-50 font-mono text-[10px] py-1">
            Last Updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Settings */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Parameter Keuangan
              </CardTitle>
              <CardDescription>Pengaturan biaya platform dan komisi mitra driver.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                    Platform Fee Trip (%)
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        className="pl-9 h-11" 
                        value={form.platformFeePercentage}
                        onChange={e => setForm({...form, platformFeePercentage: Number(e.target.value)})}
                      />
                    </div>
                    <Button 
                      variant="secondary" 
                      className="h-11 px-4"
                      onClick={() => handleSave('platformFeePercentage', 'Platform Fee')}
                      disabled={loading}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                    Komisi Driver (%)
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        className="pl-9 h-11" 
                        value={form.driverCommissionPercentage}
                        onChange={e => setForm({...form, driverCommissionPercentage: Number(e.target.value)})}
                      />
                    </div>
                    <Button 
                      variant="secondary" 
                      className="h-11 px-4"
                      onClick={() => handleSave('driverCommissionPercentage', 'Komisi Driver')}
                      disabled={loading}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                  Harga Dasar per KM (IDR)
                </Label>
                <div className="flex gap-2 max-w-md">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                    <Input 
                      type="number" 
                      className="pl-10 h-11" 
                      value={form.basePricePerKm}
                      onChange={e => setForm({...form, basePricePerKm: Number(e.target.value)})}
                    />
                  </div>
                  <Button 
                    variant="secondary" 
                    className="h-11 px-4"
                    onClick={() => handleSave('basePricePerKm', 'Harga Dasar KM')}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                {form.basePricePerKm < 3000 && (
                  <div className="flex items-center gap-2 text-[10px] text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                    <AlertCircle className="h-3 w-3" />
                    Peringatan: Harga di bawah biaya operasional standar (Rp 3.000)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Audit History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                History Perubahan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-lg border bg-slate-50/50">
                    <div className="p-2 bg-white rounded-full border shadow-sm h-fit mt-1">
                      <RefreshCcw className="h-3 w-3 text-slate-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-bold">Pembaruan Harga Dasar</p>
                        <span className="text-[10px] text-muted-foreground">2 jam yang lalu</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        User <span className="font-medium text-slate-900">Super Admin</span> mengubah harga per KM dari <span className="line-through">Rp 4.500</span> menjadi <span className="font-bold text-success">Rp 5.000</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Preview */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 opacity-80" />
                Simulasi Real-time
              </CardTitle>
              <CardDescription className="text-primary-foreground/70">Estimasi pendapatan untuk trip 10 KM.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold opacity-60">Total Harga User</p>
                <p className="text-3xl font-black">{formatRupiah(totalPrice)}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-xs font-medium">Platform (Fee)</span>
                  </div>
                  <span className="text-sm font-bold">{formatRupiah(platformEarnings)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium">Mitra Driver</span>
                  </div>
                  <span className="text-sm font-bold">{formatRupiah(driverEarnings)}</span>
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-xl space-y-2">
                <div className="flex justify-between text-[10px] opacity-70">
                  <span>Gross Margin</span>
                  <span>{form.platformFeePercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-500" 
                    style={{ width: `${form.platformFeePercentage}%` }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-orange-50/30">
            <CardContent className="p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-orange-900">Perubahan Global</p>
                <p className="text-[10px] text-orange-800 leading-relaxed">
                  Perubahan pada parameter ini akan berdampak langsung pada seluruh perhitungan trip aktif di sistem.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessConfigPage;
