import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Navigation, User, Menu } from 'lucide-react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { NotificationCenter } from '@/components/NotificationCenter';
import { cn } from '@/lib/utils';
import { DRIVER_LAYOUT } from '@/lib/driver-ui';

const DriverLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useShuttle();

  const tabs = [
    { path: '/driver', icon: LayoutDashboard, label: 'Home' },
    { path: '/driver/trips', icon: List, label: 'Trip' },
    { path: '/driver/tracking', icon: Navigation, label: 'GPS' },
    { path: '/driver/profile', icon: User, label: 'Profil' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-slate-200">
      <header className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-xl italic">RW</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">Ridewise</h1>
            <p className="text-[10px] text-muted-foreground font-bold mt-0.5 uppercase tracking-widest">{currentUser?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <NotificationCenter role="driver" variant="default" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-3 z-30">
        <div className="flex justify-between items-center">
          {tabs.map(tab => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300 relative group",
                isActive(tab.path) ? "text-primary scale-110" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                isActive(tab.path) ? "bg-primary/10" : "group-hover:bg-slate-50"
              )}>
                <tab.icon className={cn("h-6 w-6", isActive(tab.path) ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tighter",
                isActive(tab.path) ? "opacity-100" : "opacity-0"
              )}>
                {tab.label}
              </span>
              {isActive(tab.path) && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default DriverLayout;
