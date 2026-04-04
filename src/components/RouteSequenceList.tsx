import { useState, useRef } from 'react';
import { RouteSequence, PickupPoint } from '@/types/shuttle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { GripVertical, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { formatRouteDistance, formatRouteTime, formatRouteCost } from '@/lib/routeOptimization';

interface RouteSequenceListProps {
  sequences: RouteSequence[];
  pickupPoints: PickupPoint[];
  onReorder: (newSequences: RouteSequence[]) => void;
  onRemoveSequence: (sequenceId: string) => void;
  onAddSequence: () => void;
  isLoading?: boolean;
}

export const RouteSequenceList = ({
  sequences,
  pickupPoints,
  onReorder,
  onRemoveSequence,
  onAddSequence,
  isLoading = false,
}: RouteSequenceListProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSequences = [...sequences];
    [newSequences[draggedIndex], newSequences[index]] = [
      newSequences[index],
      newSequences[draggedIndex],
    ];

    // Update sequence order numbers
    newSequences.forEach((seq, idx) => {
      seq.sequenceOrder = idx + 1;
    });

    onReorder(newSequences);
    setDraggedIndex(index);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Move sequence up
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSequences = [...sequences];
    [newSequences[index - 1], newSequences[index]] = [
      newSequences[index],
      newSequences[index - 1],
    ];
    newSequences.forEach((seq, idx) => {
      seq.sequenceOrder = idx + 1;
    });
    onReorder(newSequences);
  };

  // Move sequence down
  const moveDown = (index: number) => {
    if (index === sequences.length - 1) return;
    const newSequences = [...sequences];
    [newSequences[index], newSequences[index + 1]] = [
      newSequences[index + 1],
      newSequences[index],
    ];
    newSequences.forEach((seq, idx) => {
      seq.sequenceOrder = idx + 1;
    });
    onReorder(newSequences);
  };

  const getPickupPointName = (pointId: string) => {
    return pickupPoints.find(p => p.id === pointId)?.name || 'Unknown';
  };

  const getRayonBadgeColor = (pointId: string) => {
    const point = pickupPoints.find(p => p.id === pointId);
    if (!point) return 'secondary';

    const colors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      A: 'default',
      B: 'secondary',
      C: 'outline',
      D: 'destructive',
    };
    return colors[point.rayon] || 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Urutan Titik Jemput ({sequences.length})</CardTitle>
            <CardDescription>
              Drag to reorder stops or use buttons. Total rute: {formatRouteDistance(
                sequences.length > 0 ? sequences[sequences.length - 1].cumulativeDistance : 0
              )} dalam {formatRouteTime(
                sequences.length > 0 ? sequences[sequences.length - 1].cumulativeTime : 0
              )}
            </CardDescription>
          </div>
          <Button onClick={onAddSequence} disabled={isLoading} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Tambah Stop
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {sequences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Belum ada stop dalam rute</p>
              <p className="text-xs mt-1">Klik "Tambah Stop" untuk memulai</p>
            </div>
          ) : (
            sequences.map((seq, idx) => {
              const pointName = getPickupPointName(seq.pickupPointId);
              const badgeColor = getRayonBadgeColor(seq.pickupPointId);

              return (
                <div
                  key={seq.id}
                  ref={dragRef}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    draggedIndex === idx
                      ? 'opacity-50 bg-muted'
                      : 'hover:bg-muted/50'
                  } ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="flex-shrink-0">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Stop Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>

                  {/* Stop Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{pointName}</span>
                      <Badge variant={badgeColor} className="flex-shrink-0">
                        Rayon
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-x-2">
                      <span>Dari stop sebelumnya: {formatRouteDistance(seq.estimatedDistanceFromPrevious)}</span>
                      <span>•</span>
                      <span>{formatRouteTime(seq.estimatedTimeFromPrevious)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium">Kumulatif:</span> {formatRouteDistance(seq.cumulativeDistance)} dalam{' '}
                      {formatRouteTime(seq.cumulativeTime)} • {formatRouteCost(seq.price)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {idx > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveUp(idx)}
                        disabled={isLoading}
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    )}

                    {idx < sequences.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveDown(idx)}
                        disabled={isLoading}
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={isLoading || sequences.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Hapus Stop?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Anda yakin ingin menghapus {pointName} dari rute ini? Aksi ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onRemoveSequence(seq.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Hapus
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Statistics */}
        {sequences.length > 0 && (
          <div className="mt-6 pt-6 border-t grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Total Jarak</p>
              <p className="text-lg font-bold">
                {formatRouteDistance(sequences[sequences.length - 1].cumulativeDistance)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Waktu Tempuh</p>
              <p className="text-lg font-bold">
                {formatRouteTime(sequences[sequences.length - 1].cumulativeTime)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Total Biaya</p>
              <p className="text-lg font-bold">
                {formatRouteCost(sequences[sequences.length - 1].price)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Jumlah Stop</p>
              <p className="text-lg font-bold">{sequences.length}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
