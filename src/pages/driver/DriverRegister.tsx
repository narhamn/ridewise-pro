import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Car, 
  FileText, 
  Camera, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Scan
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Data Diri', icon: User },
  { id: 2, title: 'Kendaraan', icon: Car },
  { id: 3, title: 'Dokumen', icon: FileText },
  { id: 4, title: 'Verifikasi', icon: ShieldCheck },
];

const DriverRegister = () => {
  const navigate = useNavigate();
  const { submitDriverRegistration } = useShuttle();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrScanning, setOcrScanning] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    ktpNumber: '',
    simNumber: '',
    address: '',
    vehicleDetails: {
      plateNumber: '',
      brandModel: '',
      year: 2023,
      color: '',
    },
    documents: [
      { type: 'KTP' as const, file: null as File | null, status: 'pending' as const },
      { type: 'SIM' as const, file: null as File | null, status: 'pending' as const },
      { type: 'STNK' as const, file: null as File | null, status: 'pending' as const },
      { type: 'FOTO_DIRI' as const, file: null as File | null, status: 'pending' as const },
    ]
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFileUpload = (type: string) => {
    // Simulate OCR scanning
    setOcrScanning(type);
    setTimeout(() => {
      setOcrScanning(null);
      toast.success(`OCR: Berhasil memindai data dari ${type}`);
      // In a real app, this would populate fields from OCR
      if (type === 'KTP') {
        setFormData(prev => ({ ...prev, ktpNumber: '1201' + Math.floor(Math.random() * 1000000000000) }));
      }
    }, 2000);
  };

  const handleSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const { documents, fullName, simNumber, ...rest } = formData;
      submitDriverRegistration({
        ...rest,
        name: fullName,
        licenseNumber: simNumber,
        vehicleDetails: {
          ...rest.vehicleDetails,
          verificationStatus: 'pending'
        },
        documents: documents.map((d, i) => ({
          id: `doc-${i}`,
          type: d.type as any,
          status: 'pending',
          fileUrl: 'simulated-url',
          manipulationScore: Math.random() * 0.1 // Simulated low manipulation score
        }))
      });
      setIsProcessing(false);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Gabung PYU GO</h1>
          <p className="text-muted-foreground font-medium">Mulai perjalanan karir Anda sebagai mitra driver profesional.</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 border-slate-50",
                  isActive ? "bg-primary text-white scale-110 shadow-xl shadow-primary/20" : 
                  isCompleted ? "bg-emerald-500 text-white" : "bg-white text-slate-300"
                )}>
                  {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  isActive ? "text-primary" : "text-slate-400"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap (Sesuai KTP)</Label>
                    <Input 
                      placeholder="Masukkan nama lengkap" 
                      className="h-12 rounded-xl border-slate-100 font-bold"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Aktif</Label>
                    <Input 
                      placeholder="driver@email.com" 
                      className="h-12 rounded-xl border-slate-100 font-bold"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nomor Telepon</Label>
                    <Input 
                      placeholder="0812xxxx" 
                      className="h-12 rounded-xl border-slate-100 font-bold"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alamat Tinggal</Label>
                    <Input 
                      placeholder="Jl. Merdeka No..." 
                      className="h-12 rounded-xl border-slate-100 font-bold"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plat Nomor Kendaraan</Label>
                    <Input 
                      placeholder="BK 1234 XX" 
                      className="h-12 rounded-xl border-slate-100 font-bold uppercase"
                      value={formData.vehicleDetails.plateNumber}
                      onChange={e => setFormData({...formData, vehicleDetails: {...formData.vehicleDetails, plateNumber: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merk & Model</Label>
                    <Input 
                      placeholder="Toyota Hiace" 
                      className="h-12 rounded-xl border-slate-100 font-bold"
                      value={formData.vehicleDetails.brandModel}
                      onChange={e => setFormData({...formData, vehicleDetails: {...formData.vehicleDetails, brandModel: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tahun Kendaraan</Label>
                    <Input 
                      type="number" 
                      className="h-12 rounded-xl border-slate-100 font-bold"
                      value={formData.vehicleDetails.year}
                      onChange={e => setFormData({...formData, vehicleDetails: {...formData.vehicleDetails, year: parseInt(e.target.value)}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Warna</Label>
                    <Input 
                      placeholder="Putih" 
                      className="h-12 rounded-xl border-slate-100 font-bold"
                      value={formData.vehicleDetails.color}
                      onChange={e => setFormData({...formData, vehicleDetails: {...formData.vehicleDetails, color: e.target.value}})}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.documents.map(doc => (
                    <div key={doc.type} className="p-4 border border-slate-100 rounded-3xl space-y-4 hover:border-primary/30 transition-all bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                            <Upload className="h-5 w-5" />
                          </div>
                          <span className="font-black text-sm uppercase tracking-widest">{doc.type.replace('_', ' ')}</span>
                        </div>
                        {ocrScanning === doc.type ? (
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => handleFileUpload(doc.type)}>
                            <Scan className="h-5 w-5 text-slate-400" />
                          </Button>
                        )}
                      </div>
                      <div className="h-32 bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-2 group cursor-pointer hover:border-primary/30 transition-all">
                        <Camera className="h-8 w-8 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Klik untuk Upload</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center space-y-6 py-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200">
                  <ShieldCheck className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tighter">Konfirmasi Data</h2>
                  <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
                    Pastikan semua data yang Anda masukkan sudah benar. Proses verifikasi biasanya memakan waktu 1-3 hari kerja.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-3xl p-6 text-left space-y-4 border border-slate-100 max-w-lg mx-auto">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama</span>
                    <span className="text-sm font-black">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kendaraan</span>
                    <span className="text-sm font-black">{formData.vehicleDetails.plateNumber} - {formData.vehicleDetails.brandModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dokumen</span>
                    <span className="text-sm font-black">4 Dokumen Terlampir</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between">
            <Button 
              variant="ghost" 
              onClick={prevStep} 
              disabled={currentStep === 1 || isProcessing}
              className="rounded-xl font-black uppercase tracking-widest text-xs h-12 px-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
            </Button>
            {currentStep === steps.length ? (
              <Button 
                onClick={handleSubmit} 
                disabled={isProcessing}
                className="rounded-xl font-black uppercase tracking-widest text-xs h-12 px-8 shadow-lg shadow-primary/20"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Kirim Pendaftaran
              </Button>
            ) : (
              <Button 
                onClick={nextStep} 
                className="rounded-xl font-black uppercase tracking-widest text-xs h-12 px-8 shadow-lg shadow-primary/20"
              >
                Lanjut <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Info Footer */}
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="h-4 w-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">Sistem Verifikasi Aman & Terenkripsi</p>
        </div>
      </div>
    </div>
  );
};

export default DriverRegister;
