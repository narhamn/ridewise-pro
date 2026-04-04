import { useState } from 'react';
import { RouteSequence, PickupPoint } from '@/types/shuttle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RouteSequenceEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pickupPoints: PickupPoint[];
  currentSequences: RouteSequence[];
  onAddSequence: (pointId: string) => void;
  isLoading?: boolean;
}

export const RouteSequenceEditor = ({
  open,
  onOpenChange,
  pickupPoints,
  currentSequences,
  onAddSequence,
  isLoading = false,
}: RouteSequenceEditorProps) => {
  const [searchText, setSearchText] = useState('');
  const [filterRayon, setFilterRayon] = useState<'all' | 'A' | 'B' | 'C' | 'D'>('all');

  // Get selected points
  const selectedPointIds = new Set(currentSequences.map(s => s.pickupPointId));

  // Filter available points
  const availablePoints = pickupPoints.filter(p => {
    if (selectedPointIds.has(p.id)) return false; // Exclude already selected
    if (!p.isActive) return false; // Exclude inactive points

    const matchesSearch = searchText.toLowerCase() === '' ||
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.code.toLowerCase().includes(searchText.toLowerCase()) ||
      p.address.toLowerCase().includes(searchText.toLowerCase());

    const matchesRayon = filterRayon === 'all' || p.rayon === filterRayon;

    return matchesSearch && matchesRayon;
  });

  const rayonColors: Record<string, string> = {
    A: '#3b82f6',
    B: '#8b5cf6',
    C: '#f59e0b',
    D: '#ef4444',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Titik Jemput ke Rute</DialogTitle>
          <DialogDescription>
            Pilih titik jemput yang ingin ditambahkan ke rute. {availablePoints.length} titik tersedia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, kode, atau alamat..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-8"
                disabled={isLoading}
              />
            </div>

            <Select value={filterRayon} onValueChange={(v: string) => setFilterRayon(v as "A" | "B" | "C" | "D" | "all")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter Rayon" />
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

          {/* Available Points Grid */}
          <div className="space-y-2">
            {availablePoints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {selectedPointIds.size === pickupPoints.length
                    ? 'Semua titik jemput sudah ditambahkan ke rute'
                    : 'Tidak ada titik jemput yang cocok dengan filter'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {availablePoints.map(point => (
                  <div key={point.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{point.name}</div>
                        <div className="text-xs text-muted-foreground">{point.code}</div>
                      </div>
                      <Badge
                        style={{
                          backgroundColor: rayonColors[point.rayon],
                          color: 'white',
                        }}
                      >
                        {point.rayon}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {point.address}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs">
                        {point.contactPerson &&
                          <span>{point.contactPerson} • </span>
                        }
                        {point.phone}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddSequence(point.id)}
                        disabled={isLoading}
                      >
                        Pilih
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedPointIds.size === 0
                  ? 'Belum ada stop dalam rute'
                  : `${selectedPointIds.size} stop dalam rute`}
              </span>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
