import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { UserRole } from '@/types/shuttle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const typeIcons: Record<string, string> = {
  booking: '🎫',
  payment: '💳',
  trip: '🚐',
  system: '⚙️',
};

export const NotificationCenter = ({ role, variant = 'default' }: { role: UserRole; variant?: 'default' | 'light' }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const count = unreadCount(role);
  const roleNotifs = notifications.filter(n => n.role === role).slice(0, 20);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-primary/20 transition-colors">
          <Bell className={`h-5 w-5 ${variant === 'light' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifikasi</h4>
          {count > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => markAllAsRead(role)}>
              <CheckCheck className="h-3 w-3 mr-1" /> Baca semua
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {roleNotifs.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Tidak ada notifikasi</p>
          ) : (
            roleNotifs.map(n => (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b last:border-0 transition-colors hover:bg-muted/50 ${!n.read ? 'bg-primary/5' : ''}`}
              >
                <div className="flex gap-2">
                  <span className="text-lg">{typeIcons[n.type] || '📢'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
