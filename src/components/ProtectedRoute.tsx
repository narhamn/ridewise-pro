import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useDriverAuth } from '@/contexts/DriverAuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { UserRole } from '@/types/shuttle';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const customerAuth = useCustomerAuth();
  const driverAuth = useDriverAuth();
  const adminAuth = useAdminAuth();
  const location = useLocation();

  // Determine which auth state to use based on the path or allowedRoles
  const isCustomerPath = location.pathname.startsWith('/customer');
  const isDriverPath = location.pathname.startsWith('/driver');
  const isAdminPath = location.pathname.startsWith('/admin');

  let currentUser = null;
  let loading = false;

  if (isAdminPath) {
    currentUser = adminAuth.admin;
    loading = adminAuth.loading;
  } else if (isDriverPath) {
    currentUser = driverAuth.driver;
    loading = driverAuth.loading;
  } else if (isCustomerPath) {
    currentUser = customerAuth.customer;
    loading = customerAuth.loading;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Memuat Sesi...</p>
      </div>
    );
  }

  if (!currentUser) {
    let loginPath = '/customer/login';
    if (isAdminPath) loginPath = '/admin/login';
    if (isDriverPath) loginPath = '/driver/login';
    
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    toast.error('Akses ditolak. Peran Anda tidak sesuai.');
    
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
