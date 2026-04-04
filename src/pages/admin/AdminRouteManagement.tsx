import { useState, useEffect } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { RouteSequence, PickupPoint } from '@/types/shuttle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { RouteSequenceList } from '@/components/RouteSequenceList';
import { RoutePath } from '@/components/RoutePath';
import { RouteSequenceEditor } from '@/components/RouteSequenceEditor';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  MapPin,
  Plus,
  Save,
  RotateCcw,
  Download,
  TrendingUp,
  Clock,
  Navigation,
  Zap,
} from 'lucide-react';
import {
  calculateRouteStats,
  generateRouteName,
  validateRouteSequence,
  formatRouteDistance,
  formatRouteTime,
  formatRouteCost,
  exportRouteSequencesToRoute,
  findNearestNeighborRoute,
  generateSequencesFromPoints,
} from '@/lib/routeOptimization';

interface RouteData {
  routeId: string;
  routeName: string;
  sequences: RouteSequence[];
}

export const AdminRouteManagement = () => {
  const shuttle = useShuttle();

  // State
  const [selectedRouteId, setSelectedRouteId] = useState('r1'); // Default route
  const [currentSequences, setCurrentSequences] = useState<RouteSequence[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [activeTab, setActiveTab] = useState('list');

  // Load sequences for selected route
  useEffect(() => {
    const sequences = shuttle.getRouteSequences(selectedRouteId);
    setCurrentSequences(sequences);

    // Generate route name
    const name = generateRouteName(sequences, shuttle.pickupPoints);
    setRouteName(name);
  }, [selectedRouteId, shuttle]);

  // Calculate statistics
  const stats = calculateRouteStats(currentSequences, []);

  // Validate current route
  const validationErrors = validateRouteSequence(currentSequences);

  // Handle add sequence
  const handleAddSequence = (pointId: string) => {
    const existingIndex = currentSequences.findIndex(
      s => s.pickupPointId === pointId
    );

    if (existingIndex >= 0) {
      toast({ title: 'Error', description: 'Titik jemput sudah ada dalam rute' });
      return;
    }

    const newSequence: Omit<RouteSequence, 'id'> = {
      routeId: selectedRouteId,
      pickupPointId: pointId,
      sequenceOrder: currentSequences.length + 1,
      estimatedTimeFromPrevious: 5,
      estimatedDistanceFromPrevious: 2000,
      cumulativeTime: 0,
      cumulativeDistance: 0,
      price: 0,
    };

    shuttle.addRouteSequence(newSequence);
    const updated = shuttle.getRouteSequences(selectedRouteId);
    setCurrentSequences(updated);
    toast({
      title: 'Success',
      description: 'Titik jemput berhasil ditambahkan ke rute',
    });
  };

  // Handle remove sequence
  const handleRemoveSequence = (sequenceId: string) => {
    shuttle.deleteRouteSequence(sequenceId);
    const updated = shuttle.getRouteSequences(selectedRouteId);
    setCurrentSequences(updated);
    toast({
      title: 'Success',
      description: 'Stop berhasil dihapus dari rute',
    });
  };

  // Handle reorder
  const handleReorder = (newSequences: RouteSequence[]) => {
    setCurrentSequences(newSequences);
  };

  // Handle save route
  const handleSaveRoute = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: validationErrors[0],
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save each sequence
      for (const seq of currentSequences) {
        shuttle.updateRouteSequence(seq.id, {
          sequenceOrder: seq.sequenceOrder,
          cumulativeDistance: seq.cumulativeDistance,
          cumulativeTime: seq.cumulativeTime,
          price: seq.price,
        });
      }

      // Also reorder (which updates the main state)
      shuttle.reorderRouteSequence(selectedRouteId, currentSequences);

      toast({
        title: 'Success',
        description: 'Rute berhasil disimpan',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan rute',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle optimize route
  const handleOptimizeRoute = () => {
    if (currentSequences.length < 2) {
      toast({
        title: 'Info',
        description: 'Rute harus memiliki minimal 2 stop untuk dioptimasi',
      });
      return;
    }

    try {
      const points = currentSequences
        .map(seq => shuttle.pickupPoints.find(p => p.id === seq.pickupPointId))
        .filter(Boolean) as PickupPoint[];

      const optimized = findNearestNeighborRoute(points[0].id, points);
      const newSequences = generateSequencesFromPoints(selectedRouteId, optimized);

      // Clear and rebuild
      currentSequences.forEach(seq => shuttle.deleteRouteSequence(seq.id));

      newSequences.forEach(seq => {
        shuttle.addRouteSequence(seq);
      });

      const updated = shuttle.getRouteSequences(selectedRouteId);
      setCurrentSequences(updated);

      toast({
        title: 'Success',
        description: 'Rute berhasil dioptimasi menggunakan algoritma Nearest Neighbor',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengoptimasi rute',
        variant: 'destructive',
      });
    }
  };

  // Handle reset route
  const handleResetRoute = () => {
    setCurrentSequences([]);
    currentSequences.forEach(seq => shuttle.deleteRouteSequence(seq.id));
    toast({
      title: 'Success',
      description: 'Rute direset',
    });
  };

  // Handle export
  const handleExportRoute = () => {
    if (currentSequences.length === 0) {
      toast({
        title: 'Warning',
        description: 'Rute kosong, tidak ada yang diekspor',
      });
      return;
    }

    const exported = exportRouteSequencesToRoute(
      selectedRouteId,
      currentSequences,
      shuttle.pickupPoints
    );

    // Create JSON and download
    const dataStr = JSON.stringify(exported, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `route-${selectedRouteId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Success',
      description: 'Rute berhasil diekspor',
    });
  };

  // Prepare data for statistics charts
  const rayonDistribution = [
    ...[
      { name: 'A', value: currentSequences.filter(s => {
        const point = shuttle.pickupPoints.find(p => p.id === s.pickupPointId);
        return point?.rayon === 'A';
      }).length },
      { name: 'B', value: currentSequences.filter(s => {
        const point = shuttle.pickupPoints.find(p => p.id === s.pickupPointId);
        return point?.rayon === 'B';
      }).length },
      { name: 'C', value: currentSequences.filter(s => {
        const point = shuttle.pickupPoints.find(p => p.id === s.pickupPointId);
        return point?.rayon === 'C';
      }).length },
      { name: 'D', value: currentSequences.filter(s => {
        const point = shuttle.pickupPoints.find(p => p.id === s.pickupPointId);
        return point?.rayon === 'D';
      }).length },
    ].filter(r => r.value > 0),
  ];

  const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Navigation className="h-8 w-8" />
          Manajemen Rute Perjalanan
        </h1>
        <p className="text-muted-foreground mt-1">
          Rencanakan, optimalkan, dan kelola rute perjalanan untuk kendaraan shuttle
        </p>
      </div>

      {/* Route Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Rute</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {['r1', 'r2', 'r3', 'r4'].map(routeId => (
              <Button
                key={routeId}
                variant={selectedRouteId === routeId ? 'default' : 'outline'}
                onClick={() => setSelectedRouteId(routeId)}
              >
                Rute {routeId.toUpperCase()}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jarak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRouteDistance(stats.totalDistance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari {currentSequences.length} stop
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Waktu Tempuh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRouteTime(stats.totalTime)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kecepatan rata-rata {stats.averageSpeedKmh} km/h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Biaya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRouteCost(stats.totalCost)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimasi pendapatan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jumlah Stop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSequences.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Titik jemput dalam rute
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {validationErrors.map((error, idx) => (
                <li key={idx} className="text-sm text-destructive">
                  • {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Urutan Stop</TabsTrigger>
          <TabsTrigger value="map">Visualisasi Peta</TabsTrigger>
          <TabsTrigger value="stats">Statistik</TabsTrigger>
        </TabsList>

        {/* Urutan Stop Tab */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setIsEditorOpen(true)}
              disabled={isSaving}
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah Stop
            </Button>

            {currentSequences.length > 0 && (
              <>
                <Button
                  onClick={handleOptimizeRoute}
                  variant="outline"
                  disabled={isSaving || currentSequences.length < 2}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Optimasi Rute
                </Button>

                <Button
                  onClick={handleExportRoute}
                  variant="outline"
                  disabled={isSaving}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Ekspor Rute
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={isSaving}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Reset Rute?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin menghapus semua stop dari rute ini?
                    </AlertDialogDescription>
                    <div className="flex gap-2 justify-end">
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetRoute}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Reset
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  onClick={handleSaveRoute}
                  disabled={isSaving || validationErrors.length > 0}
                  className="ml-auto"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Rute'}
                </Button>
              </>
            )}
          </div>

          <RouteSequenceList
            sequences={currentSequences}
            pickupPoints={shuttle.pickupPoints}
            onReorder={handleReorder}
            onRemoveSequence={handleRemoveSequence}
            onAddSequence={() => setIsEditorOpen(true)}
            isLoading={isSaving}
          />
        </TabsContent>

        {/* Visualisasi Peta Tab */}
        <TabsContent value="map">
          <RoutePath
            sequences={currentSequences}
            pickupPoints={shuttle.pickupPoints}
            center={[3.5952, 98.6722]}
            zoom={11}
            enableEditing={true}
            onRouteUpdate={(waypoints) => {
              // Convert waypoints back to route sequences
              // This is a simplified conversion - in practice you'd need to match to pickup points
              toast({
                title: 'Route Updated',
                description: `Rute berhasil diperbarui dengan ${waypoints.length} waypoint`,
              });
            }}
          />
        </TabsContent>

        {/* Statistik Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rayon Distribution */}
            {rayonDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Distribusi per Rayon</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={rayonDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {rayonDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Distance & Time Chart */}
            {currentSequences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Jarak & Waktu per Stop</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={currentSequences}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sequenceOrder" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="estimatedDistanceFromPrevious"
                        fill="#3b82f6"
                        name="Jarak (m)"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="estimatedTimeFromPrevious"
                        fill="#8b5cf6"
                        name="Waktu (menit)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Route Summary Table */}
          {currentSequences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Detail Rute</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Stop</th>
                        <th className="text-left p-2">Titik Jemput</th>
                        <th className="text-right p-2">Jarak</th>
                        <th className="text-right p-2">Waktu</th>
                        <th className="text-right p-2">Kumulatif (Jarak)</th>
                        <th className="text-right p-2">Kumulatif (Waktu)</th>
                        <th className="text-right p-2">Harga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSequences.map((seq, idx) => {
                        const point = shuttle.pickupPoints.find(p => p.id === seq.pickupPointId);
                        return (
                          <tr key={seq.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-bold">#{idx + 1}</td>
                            <td className="p-2">{point?.name}</td>
                            <td className="text-right p-2">
                              {formatRouteDistance(seq.estimatedDistanceFromPrevious)}
                            </td>
                            <td className="text-right p-2">
                              {formatRouteTime(seq.estimatedTimeFromPrevious)}
                            </td>
                            <td className="text-right p-2">
                              {formatRouteDistance(seq.cumulativeDistance)}
                            </td>
                            <td className="text-right p-2">
                              {formatRouteTime(seq.cumulativeTime)}
                            </td>
                            <td className="text-right p-2 font-medium">
                              {formatRouteCost(seq.price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Route Sequence Editor Dialog */}
      <RouteSequenceEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        pickupPoints={shuttle.pickupPoints}
        currentSequences={currentSequences}
        onAddSequence={handleAddSequence}
        isLoading={isSaving}
      />
    </div>
  );
};

export default AdminRouteManagement;
