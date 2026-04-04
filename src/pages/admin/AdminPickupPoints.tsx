import { useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { PickupPoint } from '@/types/shuttle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import PickupPointForm from '@/components/PickupPointForm';
import PickupPointTable from '@/components/PickupPointTable';
import PickupPointMap from '@/components/PickupPointMap';
import ActivityLogViewer from '@/components/ActivityLogViewer';
import { Plus, MapPin, LayoutGrid, Activity } from 'lucide-react';

const AdminPickupPoints = () => {
  const shuttle = useShuttle();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const editingPickupPoint = editingId ? shuttle.pickupPoints.find(p => p.id === editingId) : null;
  const deletePickupPoint = deleteId ? shuttle.pickupPoints.find(p => p.id === deleteId) : null;

  const handleAddNew = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (pickupPoint: PickupPoint) => {
    setEditingId(pickupPoint.id);
    setIsFormOpen(true);
    setSelectedMapId(pickupPoint.id);
  };

  const handleFormSubmit = (data: Omit<PickupPoint, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingId) {
      // Update
      shuttle.updatePickupPoint(editingId, data);
      toast({
        title: 'Berhasil',
        description: `Titik jemput "${data.name}" berhasil diperbarui`,
      });
    } else {
      // Create
      const newPickupPoint = shuttle.addPickupPoint(data);
      toast({
        title: 'Berhasil',
        description: `Titik jemput "${newPickupPoint.name}" berhasil ditambahkan`,
      });
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;

    const pickupPoint = shuttle.pickupPoints.find(p => p.id === deleteId);
    if (pickupPoint) {
      shuttle.deletePickupPoint(deleteId);
      toast({
        title: 'Berhasil',
        description: `Titik jemput "${pickupPoint.name}" berhasil dihapus`,
      });
    }

    setDeleteId(null);
  };

  const handleToggleStatus = (pickupPointId: string) => {
    const pickupPoint = shuttle.pickupPoints.find(p => p.id === pickupPointId);
    if (pickupPoint) {
      shuttle.togglePickupPointStatus(pickupPointId);
      const newStatus = !pickupPoint.isActive;
      toast({
        title: 'Berhasil',
        description: `Titik jemput "${pickupPoint.name}" ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      });
    }
  };

  const pickupPointLogs = shuttle.getActivityLogs('pickup_point');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Manajemen Titik Jemput
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola lokasi titik jemput, rayon, dan rute perjalanan
          </p>
        </div>
        <Button onClick={handleAddNew} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Tambah Titik Jemput
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Titik Jemput</p>
            <p className="text-3xl font-bold">{shuttle.pickupPoints.length}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Titik Aktif</p>
            <p className="text-3xl font-bold text-green-600">
              {shuttle.pickupPoints.filter(p => p.isActive).length}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Titik Tidak Aktif</p>
            <p className="text-3xl font-bold text-red-600">
              {shuttle.pickupPoints.filter(p => !p.isActive).length}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Rayon</p>
            <p className="text-3xl font-bold">4</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Daftar
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <MapPin className="h-4 w-4" />
            Peta
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Activity className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          <PickupPointTable
            pickupPoints={shuttle.pickupPoints}
            rayons={shuttle.rayons}
            onEdit={handleEdit}
            onDelete={pp => setDeleteId(pp.id)}
            onToggleStatus={handleToggleStatus}
          />
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map" className="space-y-4">
          <PickupPointMap
            pickupPoints={shuttle.pickupPoints}
            selectedId={selectedMapId}
          />
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <ActivityLogViewer logs={pickupPointLogs} />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Titik Jemput' : 'Tambah Titik Jemput Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Perbarui informasi titik jemput'
                : 'Isi formulir untuk menambahkan titik jemput baru ke sistem'}
            </DialogDescription>
          </DialogHeader>
          <PickupPointForm
            pickupPoint={editingPickupPoint}
            allPickupPoints={shuttle.pickupPoints}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingId(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Titik Jemput?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menghapus titik jemput "{deletePickupPoint?.name}". Tindakan ini tidak dapat dibatalkan dan akan dihapus dari semua rute dan jadwal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-destructive/10 p-3 rounded-lg text-sm text-destructive">
            ⚠️ Memastikan tidak ada booking atau jadwal aktif yang menggunakan titik jemput ini sebelum menghapus.
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPickupPoints;
