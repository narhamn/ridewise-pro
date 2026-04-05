import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/shuttle';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DriverAuthContextType {
  driver: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const DriverAuthContext = createContext<DriverAuthContextType | undefined>(undefined);

export const DriverAuthProvider = ({ children }: { children: ReactNode }) => {
  const [driver, setDriver] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .eq('role', 'driver')
          .single();
        
        if (profile) setDriver(profile);
        else await supabase.auth.signOut();
      }
      setLoading(false);
    };
    fetchSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .eq('role', 'driver')
          .single();
        
        if (profile) {
          setDriver(profile);
          toast.success(`Selamat datang kembali, Driver ${profile.name}!`);
          return true;
        } else {
          await supabase.auth.signOut();
          toast.error('Akses ditolak. Akun ini bukan akun Driver.');
          return false;
        }
      }
      return false;
    } catch (error: any) {
      toast.error(`Login Driver gagal: ${error.message}`);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setDriver(null);
  };

  return (
    <DriverAuthContext.Provider value={{ driver, loading, login, logout }}>
      {children}
    </DriverAuthContext.Provider>
  );
};

export const useDriverAuth = () => {
  const context = useContext(DriverAuthContext);
  if (!context) throw new Error('useDriverAuth must be used within DriverAuthProvider');
  return context;
};
