import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { UserRole } from '@/types/shuttle';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { currentUser, loading } = useShuttle();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Memuat Sesi...</p>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to appropriate login page based on target path
    let loginPath = '/login';
    if (location.pathname.startsWith('/admin')) loginPath = '/admin/login';
    if (location.pathname.startsWith('/driver')) loginPath = '/driver/login';
    
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Role not authorized
    toast.error('Anda tidak memiliki izin untuk mengakses halaman ini.');
    
    // Redirect to home dashboard based on actual role
    const homePaths: Record<UserRole, string> = {
      admin: '/admin',
      driver: '/driver',
      customer: '/customer'
    };
    
    return <Navigate to={homePaths[currentUser.role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import { toast } from 'sonner';
