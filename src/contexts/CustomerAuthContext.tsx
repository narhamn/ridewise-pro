import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/shuttle';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CustomerAuthContextType {
  customer: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .eq('role', 'customer')
          .single();
        
        if (profile) setCustomer(profile);
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
          .eq('role', 'customer')
          .single();
        
        if (profile) {
          setCustomer(profile);
          toast.success(`Selamat datang, ${profile.name}!`);
          return true;
        } else {
          await supabase.auth.signOut();
          toast.error('Akses ditolak. Akun ini bukan akun Customer.');
          return false;
        }
      }
      return false;
    } catch (error: any) {
      toast.error(`Login Customer gagal: ${error.message}`);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role: 'customer' } }
      });
      if (error) throw error;
      if (data.user) {
        toast.success('Pendaftaran Customer berhasil! Silakan cek email.');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(`Pendaftaran gagal: ${error.message}`);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, signup, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return context;
};
