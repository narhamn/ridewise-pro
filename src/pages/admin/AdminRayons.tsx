import { useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Rayon } from '@/types/shuttle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { Zap, MapPin, Banknote, Edit, Grid, TrendingUp } from 'lucide-react';
import { exportRayonsToCSV, exportRayonsToPDF } from '@/lib/export';

const AdminRayons = () => {
  const shuttle = useShuttle();
  const [editingRayon, setEditingRayon] = useState<Rayon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Rayon>>({});

  const rayonColors: Record<string, { bg: string; text: string; icon: string }> = {
    A: { bg: 'bg-blue-50', text: 'text-blue-900', icon: '🏙️' },
    B: { bg: 'bg-purple-50', text: 'text-purple-900', icon: '🚗' },
    C: { bg: 'bg-amber-50', text: 'text-amber-900', icon: '🛣️' },
    D: { bg: 'bg-red-50', text: 'text-red-900', icon: '🌄' },
  };

  const handleEdit = (rayon: Rayon) => {
    setEditingRayon(rayon);
    setFormData({
      pricePerMeter: rayon.pricePerMeter,
      description: rayon.description,
      coverage: rayon.coverage,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingRayon) return;

    shuttle.updateRayonInfo(editingRayon.code, {
      ...formData,
      pricePerMeter: parseFloat(String(formData.pricePerMeter)) || editingRayon.pricePerMeter,
    } as Partial<Rayon>);

    toast({
      title: 'Berhasil',
      description: `Rayon ${editingRayon.code} berhasil diperbarui`,
    });

    setIsDialogOpen(false);
    setEditingRayon(null);
  };

  const getTotalPickupPoints = (code: string) => {
    return shuttle.pickupPoints.filter(p => p.rayon === code && p.isActive).length;
  };

  const getTotalPickupPointsAll = (code: string) => {
    return shuttle.pickupPoints.filter(p => p.rayon === code).length;
  };

  const handleExportCSV = () => {
    exportRayonsToCSV(shuttle.rayons);
    toast({
      title: 'Berhasil',
      description: 'Data rayon berhasil diexport ke CSV',
    });
  };

  const handleExportPDF = () => {
    exportRayonsToPDF(shuttle.rayons);
    toast({
      title: 'Berhasil',
      description: 'Data rayon berhasil diexport ke PDF',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Manajemen Rayon
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola zone/rayon dan tier harga untuk rute perjalanan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            📊 CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            📄 PDF
          </Button>
        </div>
      </div>

      {/* Rayon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shuttle.rayons.map(rayon => {
          const color = rayonColors[rayon.code];
          const activePickupPoints = getTotalPickupPoints(rayon.code);
          const allPickupPoints = getTotalPickupPointsAll(rayon.code);

          return (
            <Card key={rayon.id} className={`${color.bg} border-2`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{color.icon}</div>
                    <div>
                      <CardTitle className={color.text}>
                        Rayon {rayon.code}
                      </CardTitle>
                      <CardDescription>{rayon.label}</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(rayon)}
                    className={color.text}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Description */}
                <div>
                  <p className={`text-sm ${color.text}`}>
                    {rayon.description}
                  </p>
                </div>

                {/* Coverage */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Wilayah Cakupan</p>
                  <p className={`text-sm ${color.text}`}>{rayon.coverage}</p>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                  <Banknote className={`h-5 w-5 ${color.text}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Tarif Per Meter</p>
                    <p className={`text-lg font-bold ${color.text}`}>
                      Rp {rayon.pricePerMeter}
                    </p>
                  </div>
                </div>

                {/* Pickup Points Count */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">Titik Jemput Aktif</p>
                    <p className={`text-2xl font-bold ${color.text}`}>
                      {activePickupPoints}
                    </p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Titik Jemput</p>
                    <p className={`text-2xl font-bold ${color.text}`}>
                      {allPickupPoints}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <Badge variant={rayon.isActive ? 'default' : 'secondary'}>
                    {rayon.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rayon Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistik Rayon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Distribution */}
            <div>
              <h3 className="font-semibold mb-3">Distribusi Titik Jemput</h3>
              <div className="space-y-3">
                {shuttle.rayons.map(rayon => {
                  const count = getTotalPickupPoints(rayon.code);
                  const percentage = (count / shuttle.pickupPoints.filter(p => p.isActive).length) * 100 || 0;

                  return (
                    <div key={rayon.code}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          Rayon {rayon.code}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count} titik ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            { A: 'bg-blue-500', B: 'bg-purple-500', C: 'bg-amber-500', D: 'bg-red-500' }[rayon.code]
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Table */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Tarif Per Rayon</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Rayon</th>
                      <th className="text-left py-2">Label</th>
                      <th className="text-right py-2">Tarif/Meter</th>
                      <th className="text-right py-2">Tarif 100km</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shuttle.rayons.map(rayon => (
                      <tr key={rayon.code} className="border-b hover:bg-muted/50">
                        <td className="py-2 font-mono font-bold">{rayon.code}</td>
                        <td className="py-2">{rayon.label}</td>
                        <td className="text-right py-2 font-mono">Rp {rayon.pricePerMeter}</td>
                        <td className="text-right py-2 font-mono">
                          Rp {(rayon.pricePerMeter * 100000).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Rayon {editingRayon?.code}</DialogTitle>
            <DialogDescription>Perbarui informasi rayon dan tarif</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverage">Wilayah Cakupan</Label>
              <Textarea
                id="coverage"
                value={formData.coverage || ''}
                onChange={e => setFormData(prev => ({ ...prev, coverage: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Tarif Per Meter (Rp)</Label>
              <Input
                id="price"
                type="number"
                step="0.1"
                value={formData.pricePerMeter || ''}
                onChange={e => setFormData(prev => ({ ...prev, pricePerMeter: parseFloat(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">
                Estimasi untuk 100km: Rp {((parseFloat(String(formData.pricePerMeter)) || 0) * 100000).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>Simpan Perubahan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRayons;
