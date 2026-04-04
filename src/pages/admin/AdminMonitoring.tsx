import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Server, ShieldCheck, Zap, AlertTriangle, Activity, Database, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

const AdminMonitoring = () => {
  const { transactions, bookings } = useShuttle();
  const [uptime, setUptime] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}j ${m}m ${s}d`;
  };

  const paymentSuccessRate = 98.5;
  const apiResponseTime = 120; // ms
  const serverLoad = 42; // %

  const services = [
    { name: 'Payment Gateway', status: 'online', icon: ShieldCheck },
    { name: 'Notification Service', status: 'online', icon: Zap },
    { name: 'Geolocation API', status: 'online', icon: Globe },
    { name: 'Database Cluster', status: 'online', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Monitoring</h1>
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border-green-200 animate-pulse">
          <span className="h-2 w-2 rounded-full bg-green-600" />
          Sistem Online
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Server className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Uptime</span>
            </div>
            <p className="text-2xl font-bold font-mono">{formatUptime(uptime + 86400 * 5)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">API Response</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">{apiResponseTime}</p>
              <span className="text-xs text-muted-foreground">ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Server Load</span>
              <span className="text-xs font-bold">{serverLoad}%</span>
            </div>
            <Progress value={serverLoad} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Success Rate</span>
              <span className="text-xs font-bold">{paymentSuccessRate}%</span>
            </div>
            <Progress value={paymentSuccessRate} className="h-2 bg-muted [&>div]:bg-success" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Status Layanan Eksternal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map(service => (
              <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-md text-primary">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{service.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Active via Cloud</p>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10 capitalize">
                  {service.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incident Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="mt-1 p-1 bg-warning/10 rounded-full text-warning">
                  <AlertTriangle className="h-3 w-3" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium">Latensi Meningkat</p>
                  <p className="text-[10px] text-muted-foreground">Geolocation API merespon lebih lambat dari biasanya.</p>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase">2 jam yang lalu</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="mt-1 p-1 bg-success/10 rounded-full text-success">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium">Backup Berhasil</p>
                  <p className="text-[10px] text-muted-foreground">Database backup harian selesai tanpa error.</p>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase">12 jam yang lalu</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 9-4.477 9-10S17.523 2 12 2 3 6.477 3 12s3.477 10 9 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default AdminMonitoring;
