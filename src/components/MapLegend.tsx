/**
 * Map Legend Component
 * Menampilkan keterangan icons dan status di peta
 */

import { Card, CardContent } from '@/components/ui/card';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MapLegendProps {
  variant?: 'compact' | 'expanded';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export const MapLegend = ({ 
  variant = 'compact',
  position = 'bottom-left',
  className
}: MapLegendProps) => {
  const [isExpanded, setIsExpanded] = useState(variant === 'expanded');

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const driverStatuses = [
    { emoji: '🚐', label: 'Driver Moving', color: '#10b981' },
    { emoji: '⏹️', label: 'Driver Stopped', color: '#f59e0b' },
    { emoji: '📵', label: 'Driver Offline', color: '#6b7280' },
  ];

  const routePoints = [
    { emoji: '🏁', label: 'Origin (Start)', color: '#10b981' },
    { emoji: '🎯', label: 'Destination (End)', color: '#ef4444' },
    { emoji: '📍', label: 'Intermediate', color: '#3b82f6' },
  ];

  const routeStatuses = [
    { label: 'Scheduled', color: '#94a3b8', dash: true },
    { label: 'Boarding', color: '#f59e0b' },
    { label: 'Departed', color: '#10b981' },
    { label: 'Arrived', color: '#3b82f6' },
  ];

  return (
    <Card className={cn(
      'absolute z-20 shadow-lg transition-all duration-300',
      positionClasses[position],
      className,
      !isExpanded && 'cursor-pointer'
    )}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full hover:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            <h3 className="font-bold text-foreground">Legenda Peta</h3>
          </div>
          {variant === 'compact' && (
            isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="space-y-4 text-xs">
            {/* Driver Status Section */}
            <div>
              <h4 className="font-bold text-foreground mb-2 flex items-center gap-1">
                <span>🚗</span> Status Driver
              </h4>
              <div className="space-y-1">
                {driverStatuses.map((status, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm border-2 border-primary/20"
                      style={{ backgroundColor: `${status.color}15` }}
                    >
                      {status.emoji}
                    </div>
                    <span className="text-muted-foreground">{status.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Points Section */}
            <div className="border-t pt-3">
              <h4 className="font-bold text-foreground mb-2 flex items-center gap-1">
                <span>📍</span> Titik Rute
              </h4>
              <div className="space-y-1">
                {routePoints.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${point.color}, ${point.color}dd)`
                      }}
                    >
                      {point.emoji}
                    </div>
                    <span className="text-muted-foreground">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Status Section */}
            <div className="border-t pt-3">
              <h4 className="font-bold text-foreground mb-2 flex items-center gap-1">
                <span>📋</span> Status Rute
              </h4>
              <div className="space-y-1">
                {routeStatuses.map((status, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-8 h-1"
                      style={{
                        backgroundColor: status.color,
                        borderRadius: '2px',
                        backgroundImage: status.dash ? 'repeating-linear-gradient(to right, currentColor 0, currentColor 10px, transparent 10px, transparent 15px)' : 'none'
                      }}
                    />
                    <span className="text-muted-foreground">{status.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="border-t pt-3 text-muted-foreground">
              <div className="flex gap-1">
                <span>💡</span>
                <p>
                  Klik pada driver atau titik untuk melihat informasi detail. Garis menghubungkan titik menunjukkan rute perjalanan.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapLegend;
