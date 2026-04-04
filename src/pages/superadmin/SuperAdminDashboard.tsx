import { useState } from 'react';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Settings, 
  Activity, 
  BarChart3, 
  Wallet, 
  AlertTriangle, 
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/data/dummy';

const data = [
  { name: '00:00', bookings: 12, revenue: 450000 },
  { name: '04:00', bookings: 8, revenue: 320000 },
  { name: '08:00', bookings: 45, revenue: 1850000 },
  { name: '12:00', bookings: 38, revenue: 1540000 },
  { name: '16:00', bookings: 52, revenue: 2100000 },
  { name: '20:00', bookings: 30, revenue: 1200000 },
];

const driverStatusData = [
  { name: 'Available', value: 45, color: '#10b981' },
  { name: 'On Trip', value: 30, color: '#3b82f6' },
  { name: 'Offline', value: 25, color: '#64748b' },
];

const SuperAdminDashboard = () => {
  const { systemConfig, auditLogs, bookings, drivers } = useShuttle();

  const totalRevenue = bookings.reduce((acc, b) => acc + b.price, 0);
  const activeDrivers = drivers.filter(d => d.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Pemantauan sistem global dan pengaturan bisnis tingkat tinggi.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            System Health: OK
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            v2.0.4-enterprise
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">{formatRupiah(totalRevenue)}</h3>
                <div className="flex items-center mt-2 text-xs text-success">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>12.5% vs last month</span>
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <h3 className="text-2xl font-bold mt-1">{bookings.length}</h3>
                <div className="flex items-center mt-2 text-xs text-success">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>8.2% vs last month</span>
                </div>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Drivers</p>
                <h3 className="text-2xl font-bold mt-1">{activeDrivers}</h3>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  <span>Live: 12 on-trip</span>
                </div>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Fee (Avg)</p>
                <h3 className="text-2xl font-bold mt-1">{systemConfig.platformFeePercentage}%</h3>
                <div className="flex items-center mt-2 text-xs text-orange-600">
                  <Settings className="h-3 w-3 mr-1" />
                  <span>Current Business Rule</span>
                </div>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Wallet className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Revenue & Booking Trends</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Day</Button>
                <Button variant="outline" size="sm" className="bg-primary/5">Week</Button>
                <Button variant="ghost" size="sm">Month</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Driver Status Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={driverStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {driverStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {driverStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Logs & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Global Audit Trail
              </CardTitle>
              <Button variant="link" size="sm" className="text-primary">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(auditLogs || []).slice(0, 5).map((log) => (
                <div key={log.id} className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="bg-slate-100 p-2 rounded-full h-fit mt-1">
                    <ShieldAlert className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-bold">{log.action || 'Unknown Action'}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      <span className="font-medium text-slate-900">{log.userName || 'System'}</span>: {log.details || 'No details available'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-900">Failed Midtrans Callback</p>
                  <p className="text-xs text-orange-700 mt-1">
                    Booking #B1209 failed to sync payment status. Manual check required.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 bg-white border-orange-200 text-orange-700 hover:bg-orange-50">
                    Fix Now
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-900">High Refund Rate Detected</p>
                  <p className="text-xs text-red-700 mt-1">
                    Refund rate increased by 15% in Rayon A today.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
