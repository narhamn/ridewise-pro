import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MapPin, Navigation, CalendarDays, Users, Bus, Link2, BookOpen, FileText, LogOut, Map, BarChart3, CreditCard } from 'lucide-react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { NotificationCenter } from '@/components/NotificationCenter';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Tracking', url: '/admin/tracking', icon: Map },
  { title: 'Rute', url: '/admin/routes', icon: Navigation },
  
  { title: 'Jadwal', url: '/admin/schedules', icon: CalendarDays },
  { title: 'Driver', url: '/admin/drivers', icon: Users },
  { title: 'Kendaraan & Driver', url: '/admin/vehicles', icon: Bus },
  { title: 'Booking', url: '/admin/bookings', icon: BookOpen },
  { title: 'Laporan', url: '/admin/reports', icon: FileText },
  { title: 'Payment', url: '/admin/payment-settings', icon: CreditCard },
];

const AdminSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Menu Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useShuttle();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="font-semibold text-lg">Admin Panel</span>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter role="admin" />
              <span className="text-sm text-muted-foreground">{currentUser?.name}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
