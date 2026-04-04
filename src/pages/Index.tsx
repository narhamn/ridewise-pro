import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Bus, Truck, Shield, Sparkles, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Customer',
      description: 'Pesan tiket shuttle, pilih rute & kursi',
      icon: Bus,
      path: '/customer/login',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      title: 'Driver',
      description: 'Kelola perjalanan & lihat penumpang',
      icon: Truck,
      path: '/driver/login',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      shadowColor: 'shadow-green-500/25'
    },
    {
      title: 'Admin',
      description: 'Kelola sistem, rute, jadwal & laporan',
      icon: Shield,
      path: '/admin/login',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      shadowColor: 'shadow-purple-500/25'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce delay-1000">
        <Sparkles className="h-6 w-6 text-blue-400 opacity-60" />
      </div>
      <div className="absolute top-40 right-20 animate-bounce delay-2000">
        <Bus className="h-8 w-8 text-green-400 opacity-40" />
      </div>
      <div className="absolute bottom-32 left-20 animate-bounce delay-3000">
        <Truck className="h-6 w-6 text-purple-400 opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="relative mb-6">
            <div className="text-6xl mb-4 animate-pulse">🚐</div>
            <div className="absolute -top-2 -right-2 animate-spin">
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            PYU GO
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in duration-1000 delay-500">
            Sistem Manajemen Shuttle & Rental Mobil Terpadu untuk Pengalaman Transportasi Modern
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500 dark:text-slate-400 animate-in fade-in duration-1000 delay-700">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>24/7 Layanan</span>
            </div>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>100+ Rute</span>
            </div>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Terpercaya</span>
            </div>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid gap-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-900">
          {roles.map((role, index) => (
            <Card
              key={role.title}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 border-0 ${role.shadowColor} hover:shadow-2xl group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{ animationDelay: `${(index + 3) * 200}ms` }}
              onClick={() => navigate(role.path)}
              aria-label={`Masuk sebagai ${role.title} - ${role.description}`}
            >
              {/* Card Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm"></div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <CardContent className="relative flex items-center gap-4 p-6">
                <div className={`${role.color} ${role.hoverColor} text-white p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-6`}>
                  <role.icon className="h-7 w-7" />
                </div>

                <div className="flex-1">
                  <h2 className="font-bold text-xl text-slate-900 dark:text-white mb-1 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">
                    {role.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all duration-300 group-hover:translate-x-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center animate-in fade-in duration-1000 delay-1500">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            © 2026 PYU GO — Sistem Transportasi Terpadu
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
