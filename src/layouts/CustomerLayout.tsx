import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Clock, Ticket, User, LogOut } from 'lucide-react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { NotificationCenter } from '@/components/NotificationCenter';

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useShuttle();

  const tabs = [
    { path: '/customer', icon: Home, label: 'Beranda' },
    { path: '/customer/history', icon: Clock, label: 'Riwayat' },
    { path: '/customer/tickets', icon: Ticket, label: 'Tiket' },
    { path: '/customer/profile', icon: User, label: 'Profil' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto shadow-xl ring-1 ring-border/50">
      <header className="bg-card border-b border-border/50 p-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-card/80">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <span className="text-xl">🚐</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Ridewise</h1>
        </div>
        <div className="flex items-center gap-1">
          <NotificationCenter role="customer" variant="default" />
          <button 
            onClick={() => { logout(); navigate('/'); }} 
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card/95 backdrop-blur-md border-t border-border/50 z-20 pb-safe">
        <div className="flex justify-around items-center px-4 py-3">
          {tabs.map(tab => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
              >
                <tab.icon className={`h-5 w-5 transition-all ${active ? 'fill-primary/10 stroke-[2.5px]' : 'stroke-[2px]'}`} />
                <span className={`text-[10px] font-bold tracking-wide uppercase ${active ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
                {active && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default CustomerLayout;
