import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useDriverAuth } from '@/contexts/DriverAuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { 
  Bus, 
  Truck, 
  Shield, 
  MapPin, 
  Clock, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Star,
  Users,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LandingPage = () => {
  const navigate = useNavigate();
  const { customer } = useCustomerAuth();
  const { driver } = useDriverAuth();
  const { admin } = useAdminAuth();

  const currentUser = customer || driver || admin;

  const getDashboardPath = () => {
    if (admin) return '/admin';
    if (driver) return '/driver';
    if (customer) return '/customer';
    return '/customer/login';
  };

  const features = [
    {
      title: 'Pemesanan Mudah',
      description: 'Pesan tiket shuttle hanya dalam beberapa klik melalui aplikasi mobile atau web.',
      icon: Smartphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pelacakan Real-time',
      description: 'Pantau lokasi armada Anda secara langsung di peta dengan akurasi tinggi.',
      icon: MapPin,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Keamanan Terjamin',
      description: 'Seluruh driver telah melalui proses verifikasi ketat dan armada rutin diservis.',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Pembayaran Digital',
      description: 'Mendukung berbagai metode pembayaran mulai dari transfer bank hingga e-wallet.',
      icon: CreditCard,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    }
  ];

  const stats = [
    { label: 'Pelanggan Puas', value: '10k+', icon: Users },
    { label: 'Rute Tersedia', value: '100+', icon: Bus },
    { label: 'Driver Ahli', value: '500+', icon: Truck },
    { label: 'Layanan 24/7', value: '24h', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="bg-primary p-1.5 rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">PYU GO</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Fitur</a>
              <a href="#services" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Layanan</a>
              <a href="#about" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Tentang Kami</a>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="font-bold text-slate-700 dark:text-slate-300"
                onClick={() => navigate(currentUser ? getDashboardPath() : '/customer/login')}
              >
                {currentUser ? 'Dashboard' : 'Login'}
              </Button>
              {!currentUser && (
                <Button 
                  className="font-bold rounded-full px-6 shadow-lg shadow-primary/20"
                  onClick={() => navigate('/customer/login')}
                >
                  Daftar
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge className="mb-6 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-700">
            ✨ Solusi Transportasi Masa Depan
          </Badge>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Perjalanan Nyaman,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-blue-600">Sampai Tujuan</span> Dengan Aman
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Platform manajemen shuttle terpadu yang menghubungkan Anda dengan rute terbaik, 
            driver profesional, dan sistem pemesanan yang cerdas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/25" onClick={() => navigate(currentUser ? getDashboardPath() : '/customer/login')}>
              {currentUser ? 'Ke Dashboard' : 'Mulai Perjalanan'} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl text-lg font-bold border-2" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Pelajari Lebih Lanjut
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-4xl mx-auto animate-in fade-in duration-1000 delay-500">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4">Mengapa PYU GO?</h2>
            <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Fitur Cerdas untuk Pengalaman Terbaik
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 group hover:-translate-y-2 transition-all duration-300">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Layanan Kami</h2>
              <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Lebih dari Sekadar Shuttle Antar Kota
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                Kami menyediakan ekosistem transportasi lengkap yang memudahkan mobilitas harian Anda, 
                baik untuk urusan bisnis maupun pribadi.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Rute terjadwal ke berbagai kota besar',
                  'Layanan ride-hailing instan (Naik Sekarang)',
                  'Sewa kendaraan dengan atau tanpa driver',
                  'Pengiriman paket kilat antar kota'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" className="rounded-2xl h-14 px-8 font-bold" onClick={() => navigate('/customer/login')}>
                Coba Layanan Kami
              </Button>
            </div>
            
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800" 
                  alt="Bus Shuttle" 
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.396c.256.12.474.307.636.55.162.243.247.53.247.822v2.182c0 .45-.178.882-.495 1.2s-.75.495-1.2.495h-2.182c-.292 0-.579-.085-.822-.247s-.43-.38-.55-.636l-.396-.83-.83.396c-.256.12-.474.307-.636.55-.162.243-.247.53-.247.822v2.182c0 .45-.178.882-.495 1.2s-.75.495-1.2.495h-2.182c-.292 0-.579-.085-.822-.247s-.43-.38-.55-.636l-.396-.83' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
            Siap untuk Pengalaman Perjalanan Baru?
          </h2>
          <p className="text-xl text-white/80 font-medium mb-12 max-w-2xl mx-auto">
            Gabung bersama ribuan pelanggan lainnya yang telah menikmati kemudahan bertransportasi dengan PYU GO.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-black bg-white text-primary hover:bg-slate-50 shadow-2xl" onClick={() => navigate(currentUser ? getDashboardPath() : '/customer/login')}>
              {currentUser ? 'Kembali ke Aplikasi' : 'Daftar Sekarang'}
            </Button>
            {!currentUser && (
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-black border-2 border-white text-white hover:bg-white/10" onClick={() => navigate('/driver/login')}>
                Portal Driver
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter">PYU GO</span>
              </div>
              <p className="text-slate-400 font-medium max-w-sm">
                Sistem manajemen shuttle terintegrasi untuk solusi transportasi modern yang aman, nyaman, dan terpercaya.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                  <Star className="h-5 w-5 fill-current" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Tautan Cepat</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Beranda</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate(getDashboardPath())}>{currentUser ? 'Dashboard' : 'Login'}</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/driver/register')}>Jadi Driver</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Hubungi Kami</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Kontak</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>0800-123-4567</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Medan, Sumatera Utara</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
            <p>© 2026 PYU GO. Hak Cipta Dilindungi.</p>
            <div className="flex gap-8">
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Kebijakan Privasi</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Syarat & Ketentuan</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
