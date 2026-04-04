import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Phone, 
  FileText, 
  LogOut, 
  Shield, 
  ChevronRight,
  Star,
  Bus,
  Award,
  Mail,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Camera,
  Upload,
  Lock,
  Smartphone,
  History as HistoryIcon,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DRIVER_TYPOGRAPHY, DRIVER_LAYOUT } from '@/lib/driver-ui';
import { format } from 'date-fns';

const DriverProfile = () => {
  const { currentUser, logout, drivers, updateDriverProfile } = useShuttle();
  const navigate = useNavigate();
  const [isSaving, setIsProcessing] = useState(false);

  const driverData = drivers.find(d => d.id === currentUser?.id);

  const [personalInfo, setPersonalInfo] = useState({
    name: driverData?.name || '',
    email: driverData?.email || '',
    phoneNumber: driverData?.phoneNumber || '',
    birthDate: driverData?.birthDate || '',
    address: driverData?.address || '',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Berhasil keluar dari aplikasi');
  };

  const handleUpdateProfile = () => {
    if (!driverData) return;
    setIsProcessing(true);
    setTimeout(() => {
      updateDriverProfile(driverData.id, personalInfo);
      setIsProcessing(false);
    }, 1000);
  };

  if (!driverData) return <div className="p-4">Loading...</div>;

  return (
    <div className={cn("p-4 pb-24 space-y-6 animate-in fade-in duration-700")}>
      {/* Profile Header */}
      <Card className="border-none bg-white shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
        <div className="bg-slate-900 h-24 relative" />
        <CardContent className="px-6 pb-6 text-center -mt-12 relative z-10">
          <div className="relative mx-auto h-24 w-24 rounded-[2rem] bg-white p-1.5 shadow-xl group">
            <div className="h-full w-full rounded-[1.5rem] bg-primary flex items-center justify-center border-4 border-white shadow-inner overflow-hidden">
              {driverData.profileImage ? (
                <img src={driverData.profileImage} alt={driverData.name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-primary hover:scale-110 transition-transform">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{driverData.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-100 font-black px-2.5 py-1 uppercase tracking-widest text-[10px] flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {driverData.rating}
              </Badge>
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-black px-2.5 py-1 uppercase tracking-widest text-[10px] flex items-center gap-1">
                <Award className="h-3 w-3" />
                {driverData.totalTrips} Trip
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-4 h-14 bg-white/50 backdrop-blur-md rounded-2xl p-1 gap-1 border border-slate-100">
          <TabsTrigger value="personal" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="vehicle" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bus className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="docs" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        {/* 1. Personal Info */}
        <TabsContent value="personal" className="mt-6 space-y-4">
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardHeader>
              <CardTitle className={cn(DRIVER_TYPOGRAPHY.caption, "flex items-center gap-2")}>
                <User className="h-4 w-4 text-primary" /> Informasi Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap</Label>
                <Input 
                  value={personalInfo.name} 
                  onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                  className="rounded-xl border-slate-100 focus:ring-primary/20 h-12 font-bold"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</Label>
                  <Input 
                    value={personalInfo.email} 
                    disabled
                    className="rounded-xl bg-slate-50 border-slate-100 h-12 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nomor Telepon</Label>
                  <Input 
                    value={personalInfo.phoneNumber} 
                    onChange={(e) => setPersonalInfo({...personalInfo, phoneNumber: e.target.value})}
                    className="rounded-xl border-slate-100 h-12 font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal Lahir</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="date"
                    value={personalInfo.birthDate} 
                    onChange={(e) => setPersonalInfo({...personalInfo, birthDate: e.target.value})}
                    className="pl-10 rounded-xl border-slate-100 h-12 font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alamat Lengkap</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea 
                    value={personalInfo.address} 
                    onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                    className="w-full min-h-[100px] pl-10 pt-3 rounded-xl border border-slate-100 focus:ring-primary/20 focus:outline-none font-bold text-sm"
                  />
                </div>
              </div>
              <Button 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                onClick={handleUpdateProfile}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Vehicle Info */}
        <TabsContent value="vehicle" className="mt-6 space-y-4">
          {driverData.vehicleDetails ? (
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
              <div className="h-48 bg-slate-100 relative group">
                {driverData.vehicleDetails.image ? (
                  <img src={driverData.vehicleDetails.image} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <Bus className="h-12 w-12 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Foto Kendaraan</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge className={cn(
                    "rounded-full font-black text-[9px] uppercase px-3 py-1 border-none shadow-lg",
                    driverData.vehicleDetails.verificationStatus === 'verified' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                  )}>
                    {driverData.vehicleDetails.verificationStatus}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{driverData.vehicleDetails.brandModel}</h3>
                    <p className="text-sm font-bold text-primary tracking-tight">{driverData.vehicleDetails.plateNumber}</p>
                  </div>
                  <Badge variant="outline" className="rounded-xl border-slate-100 bg-slate-50 text-slate-500 font-black uppercase px-2 py-1">
                    {driverData.vehicleDetails.year}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Warna</p>
                    <p className="text-sm font-black text-slate-700">{driverData.vehicleDetails.color}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Pajak</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-sm font-black text-slate-700">Aktif</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nomor Rangka (VIN)</p>
                    <p className="text-xs font-mono font-bold text-slate-600 bg-slate-50 p-2 rounded-lg">{driverData.vehicleDetails.vin}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nomor Mesin</p>
                    <p className="text-xs font-mono font-bold text-slate-600 bg-slate-50 p-2 rounded-lg">{driverData.vehicleDetails.engineNumber}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full h-12 rounded-xl border-slate-100 text-primary font-black uppercase tracking-widest text-[10px]">
                  Ajukan Perubahan Data
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl shadow-sm">
              <Bus className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Belum ada data kendaraan</p>
            </div>
          )}
        </TabsContent>

        {/* 3. Documents */}
        <TabsContent value="docs" className="mt-6 space-y-4">
          <div className="grid gap-3">
            {driverData.documents?.map(doc => (
              <Card key={doc.id} className="border-none shadow-sm rounded-2xl bg-white group hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                      doc.status === 'approved' ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
                    )}>
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-800">{doc.type}</p>
                        <Badge className={cn(
                          "rounded-full text-[8px] uppercase tracking-widest px-2 py-0 border-none",
                          doc.status === 'approved' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                        )}>
                          {doc.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                        Berlaku hingga: {format(new Date(doc.expiryDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 group-hover:text-primary transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {/* Upload Action */}
            <button className="w-full p-6 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center gap-2 text-slate-300 hover:border-primary hover:text-primary transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                <Upload className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Unggah Dokumen Baru</span>
            </button>
          </div>
        </TabsContent>

        {/* 4. Security */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardHeader>
              <CardTitle className={cn(DRIVER_TYPOGRAPHY.caption, "flex items-center gap-2")}>
                <Shield className="h-4 w-4 text-primary" /> Keamanan Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm text-slate-700">Ubah Kata Sandi</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Terakhir diubah 3 bulan lalu</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </button>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm text-slate-700">Otentikasi 2 Faktor</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Keamanan ekstra untuk akun Anda</p>
                  </div>
                </div>
                <div className={cn(
                  "w-12 h-6 rounded-full relative transition-colors cursor-pointer",
                  driverData.security?.twoFactorEnabled ? "bg-primary" : "bg-slate-200"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    driverData.security?.twoFactorEnabled ? "left-7" : "left-1"
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Login History */}
          <section className="space-y-4">
            <h3 className={cn(DRIVER_TYPOGRAPHY.caption, "px-2 flex items-center gap-2")}>
              <HistoryIcon className="h-4 w-4 text-slate-400" /> Riwayat Login Terakhir
            </h3>
            <div className="space-y-3">
              {driverData.security?.loginHistory.map(log => (
                <div key={log.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-slate-700">{log.device}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{log.location} • {format(new Date(log.timestamp), 'dd MMM, HH:mm')}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full text-[8px] font-black uppercase text-emerald-500 border-emerald-100 bg-emerald-50">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <div className="pt-4">
        <Button 
          variant="destructive" 
          className="w-full h-14 rounded-[1.25rem] gap-3 font-black uppercase tracking-widest shadow-lg shadow-rose-100 transition-all active:scale-95"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Keluar Aplikasi
        </Button>
      </div>

      <div className="flex flex-col items-center gap-1 py-4">
        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">
          PYU GO Driver v1.2.0
        </p>
        <p className="text-[9px] text-slate-200 font-bold">Sumatera Utara, Indonesia</p>
      </div>
    </div>
  );
};

export default DriverProfile;
