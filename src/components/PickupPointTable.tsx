import { PickupPoint, Rayon } from '@/types/shuttle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, MapPin, Search, Download } from 'lucide-react';
import { useState } from 'react';
import { filterPickupPoints, PickupPointFilter } from '@/lib/validation';
import { exportPickupPointsToCSV, exportPickupPointsToPDF } from '@/lib/export';

interface PickupPointTableProps {
  pickupPoints: PickupPoint[];
  rayons?: Rayon[];
  onEdit: (pickupPoint: PickupPoint) => void;
  onDelete: (pickupPoint: PickupPoint) => void;
  onToggleStatus: (pickupPointId: string) => void;
}

const rayonColors: Record<string, string> = {
  A: 'bg-primary',
  B: 'bg-secondary',
  C: 'bg-warning',
  D: 'bg-destructive',
};

const PickupPointTable = ({ pickupPoints, rayons = [], onEdit, onDelete, onToggleStatus }: PickupPointTableProps) => {
  const [filters, setFilters] = useState<PickupPointFilter>({
    rayon: undefined,
    isActive: undefined,
    searchText: '',
  });

  const [sortBy, setSortBy] = useState<'name' | 'rayon' | 'city'>('name');

  const filteredPoints = filterPickupPoints(pickupPoints, filters);

  const sortedPoints = [...filteredPoints].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'rayon') return a.rayon.localeCompare(b.rayon);
    if (sortBy === 'city') return a.city.localeCompare(b.city);
    return 0;
  });

  const handleExportCSV = () => {
    exportPickupPointsToCSV(sortedPoints);
  };

  const handleExportPDF = () => {
    exportPickupPointsToPDF(sortedPoints);
  };

  const getRayonLabel = (code: string): string => {
    const rayon = rayons.find(r => r.code === code);
    return rayon ? rayon.label : `Rayon ${code}`;
  };

  const activeCount = sortedPoints.filter(p => p.isActive).length;
  const inactiveCount = sortedPoints.filter(p => !p.isActive).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Daftar Titik Jemput
              </CardTitle>
              <CardDescription>
                Total: {sortedPoints.length} | Aktif: {activeCount} | Tidak Aktif: {inactiveCount}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-sm">Filter & Pencarian</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nama, kode, alamat..."
                    value={filters.searchText || ''}
                    onChange={e => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Rayon Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Rayon</label>
                <Select value={filters.rayon || 'all'} onValueChange={v => setFilters(prev => ({ ...prev, rayon: v === 'all' ? undefined : v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Rayon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Rayon</SelectItem>
                    <SelectItem value="A">Rayon A</SelectItem>
                    <SelectItem value="B">Rayon B</SelectItem>
                    <SelectItem value="C">Rayon C</SelectItem>
                    <SelectItem value="D">Rayon D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.isActive === undefined ? 'all-status' : filters.isActive ? 'active' : 'inactive'} onValueChange={v => setFilters(prev => ({
                  ...prev,
                  isActive: v === 'all-status' ? undefined : v === 'active',
                }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-status">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Urutkan Berdasarkan</label>
                <Select value={sortBy} onValueChange={v => setSortBy(v as 'name' | 'rayon' | 'city')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nama</SelectItem>
                    <SelectItem value="rayon">Rayon</SelectItem>
                    <SelectItem value="city">Kota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {sortedPoints.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Tidak ada titik jemput yang cocok dengan filter</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Rayon</TableHead>
                    <TableHead>Kota</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead className="w-16">Kontak</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="text-right w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPoints.map(pp => (
                    <TableRow key={pp.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{pp.code}</TableCell>
                      <TableCell className="font-medium">{pp.name}</TableCell>
                      <TableCell>
                        <Badge className={`${rayonColors[pp.rayon]} text-white`}>
                          {pp.rayon}
                        </Badge>
                      </TableCell>
                      <TableCell>{pp.city}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{pp.address}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{pp.contactPerson}</div>
                          <div className="text-xs text-muted-foreground">{pp.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={pp.isActive ? 'default' : 'secondary'}>
                            {pp.isActive ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(pp)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(pp)}
                            title="Hapus"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PickupPointTable;
