import { useState } from 'react';
import { Power, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Driver } from '@/types/shuttle';

interface DriverStatusCardProps {
  driver: Driver;
  onToggle: (newStatus: 'online' | 'offline') => Promise<boolean>;
}

export const DriverStatusCard = ({ driver, onToggle }: DriverStatusCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const isOnline = driver.status === 'online';

  const handleToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const newStatus = isOnline ? 'offline' : 'online';
      await onToggle(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedTime = driver.lastStatusChange 
    ? `${format(new Date(driver.lastStatusChange), 'HH:mm')} WIB`
    : '--:-- WIB';

  return (
    <Card className={cn(
      "w-full transition-all duration-300 ease-in-out border-l-4 overflow-hidden",
      isOnline ? "border-l-success bg-success/5" : "border-l-destructive bg-destructive/5",
      "min-w-[320px] max-w-[1440px] mx-auto" // Mobile-first & Desktop max
    )}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors duration-300",
              isOnline ? "bg-success animate-pulse" : "bg-destructive"
            )} />
            <span className="text-[14px] font-bold text-foreground">
              {isOnline ? 'Driver Aktif' : 'Driver Tidak Aktif'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Terakhir: {formattedTime}</span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleToggle}
          disabled={isUpdating}
          className={cn(
            "relative h-10 px-4 rounded-full transition-all duration-300 gap-2 overflow-hidden",
            isOnline 
              ? "bg-success hover:bg-success/90 text-white" 
              : "bg-destructive hover:bg-destructive/90 text-white",
            isUpdating && "opacity-80"
          )}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Power className="h-4 w-4" />
          )}
          <span className="font-semibold uppercase tracking-wider text-[12px]">
            {isUpdating ? 'Memproses...' : (isOnline ? 'Go Offline' : 'Go Online')}
          </span>
          
          {/* Ripple/Overlay Effect on active */}
          <div className={cn(
            "absolute inset-0 bg-white/10 opacity-0 active:opacity-100 transition-opacity",
            isUpdating && "hidden"
          )} />
        </Button>
      </CardContent>
    </Card>
  );
};
