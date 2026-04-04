import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  History as HistoryIcon, 
  Paperclip, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TicketStatus, TicketPriority } from '@/types/shuttle';

const AdminTicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { tickets, updateTicketStatus, addTicketComment, currentUser } = useShuttle();
  
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ticket = tickets.find(t => t.id === ticketId);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      if (!ticket) {
        setError('Tiket tidak ditemukan atau Anda tidak memiliki akses.');
      }
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [ticket]);

  // Authorization check
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="bg-rose-100 p-4 rounded-full">
          <Lock className="h-10 w-10 text-rose-600" />
        </div>
        <h2 className="text-xl font-black">Akses Ditolak</h2>
        <p className="text-muted-foreground">Hanya administrator yang dapat mengakses halaman ini.</p>
        <Button onClick={() => navigate('/admin/login')}>Kembali ke Login</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="font-black text-sm uppercase tracking-widest text-muted-foreground">Memuat Data Tiket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-black">{error}</h2>
        <Button onClick={() => navigate(-1)}>Kembali</Button>
      </div>
    );
  }

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addTicketComment(ticket.id, comment);
    setComment('');
  };

  const priorityColors: Record<TicketPriority, string> = {
    low: 'bg-slate-100 text-slate-600 border-slate-200',
    medium: 'bg-blue-50 text-blue-600 border-blue-200',
    high: 'bg-amber-50 text-amber-600 border-amber-200',
    critical: 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse',
  };

  const statusColors: Record<TicketStatus, string> = {
    open: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    in_progress: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    resolved: 'bg-primary text-primary-foreground border-transparent',
    closed: 'bg-slate-200 text-slate-700 border-transparent',
  };

  return (
    <div className="p-5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="rounded-full font-black text-[10px] uppercase tracking-widest px-2 py-0">
                {ticket.ticketNumber}
              </Badge>
              <Badge className={cn("rounded-full font-black text-[10px] uppercase tracking-widest px-2 py-0 border", statusColors[ticket.status])}>
                {ticket.status.replace('_', ' ')}
              </Badge>
            </div>
            <h2 className="text-2xl font-black tracking-tighter leading-none">{ticket.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={ticket.status} 
            onValueChange={(val) => updateTicketStatus(ticket.id, val as TicketStatus)}
          >
            <SelectTrigger className="w-40 h-10 rounded-xl font-black text-xs uppercase tracking-widest border-border/50 bg-card">
              <SelectValue placeholder="Ubah Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-2xl">
              <SelectItem value="open" className="font-bold text-xs">OPEN</SelectItem>
              <SelectItem value="in_progress" className="font-bold text-xs">IN PROGRESS</SelectItem>
              <SelectItem value="resolved" className="font-bold text-xs text-primary">RESOLVED</SelectItem>
              <SelectItem value="closed" className="font-bold text-xs text-muted-foreground">CLOSED</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-xl font-black text-xs uppercase tracking-widest h-10 border-border/50">
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Detail & Comments */}
        <div className="xl:col-span-2 space-y-8">
          {/* Main Info */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Deskripsi Tiket
                </h3>
                <Badge variant="outline" className={cn("rounded-full font-black text-[9px] uppercase tracking-tighter px-2", priorityColors[ticket.priority])}>
                  Priority: {ticket.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="bg-muted/30 p-6 rounded-3xl border border-border/40">
                <p className="text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
              
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Lampiran</p>
                  <div className="flex flex-wrap gap-3">
                    {ticket.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-border/40 p-3 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group">
                        <Paperclip className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-bold text-slate-600">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/40">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1">Kategori</p>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{ticket.category.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1">Dibuat</p>
                  <p className="text-xs font-black text-slate-800">{format(new Date(ticket.createdAt), 'dd MMM yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1">Update Terakhir</p>
                  <p className="text-xs font-black text-slate-800">{format(new Date(ticket.updatedAt), 'dd MMM yyyy HH:mm')}</p>
                </div>
                <div className="flex justify-end items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Aktif</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <section className="space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground/80 px-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Komentar & Balasan ({ticket.comments.length})
            </h3>
            
            <div className="space-y-4">
              {ticket.comments.length === 0 ? (
                <div className="bg-muted/20 rounded-[2rem] p-8 text-center border-2 border-dashed border-border/40">
                  <p className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">Belum ada komentar</p>
                </div>
              ) : (
                ticket.comments.map(c => (
                  <div 
                    key={c.id} 
                    className={cn(
                      "flex gap-4 p-4 rounded-3xl transition-all hover:bg-white/50",
                      c.senderRole === 'admin' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center font-black",
                      c.senderRole === 'admin' ? "bg-primary text-white" : "bg-muted text-slate-500"
                    )}>
                      {c.senderName.charAt(0)}
                    </div>
                    <div className={cn(
                      "flex flex-col space-y-1 max-w-[80%]",
                      c.senderRole === 'admin' ? "items-end" : "items-start"
                    )}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800">{c.senderName}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{format(new Date(c.timestamp), 'HH:mm')}</span>
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl text-sm font-medium shadow-sm",
                        c.senderRole === 'admin' ? "bg-primary/5 text-slate-700 rounded-tr-none border border-primary/10" : "bg-white text-slate-700 rounded-tl-none border border-border/40"
                      )}>
                        {c.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white mt-8 ring-1 ring-border/30">
              <CardContent className="p-4">
                <Textarea 
                  placeholder="Ketik balasan untuk pelapor..." 
                  className="min-h-[100px] border-none focus-visible:ring-0 text-sm font-medium resize-none bg-transparent"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-primary">
                    <Paperclip className="h-4 w-4 mr-2" />
                    <span className="text-[10px] font-black uppercase">Lampirkan File</span>
                  </Button>
                  <Button 
                    size="sm" 
                    className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6 shadow-lg shadow-primary/20"
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                  >
                    <Send className="h-3.5 w-3.5 mr-2" />
                    Kirim Balasan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Right Column: Reporter & History */}
        <div className="space-y-8">
          {/* Reporter Info */}
          <section className="space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground/80 px-2 flex items-center gap-2">
              <User className="h-3.5 w-3.5" /> Informasi Pelapor
            </h3>
            <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xl font-black">
                    {ticket.reporterName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-lg tracking-tight leading-none mb-1">{ticket.reporterName}</p>
                    <Badge variant="outline" className="rounded-full text-[9px] font-black uppercase bg-slate-50 text-slate-500 border-slate-200">
                      User ID: {ticket.reporterId}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">{ticket.reporterEmail}</p>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">{ticket.reporterPhone}</p>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <Button variant="ghost" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 h-10">
                  Lihat Profil Lengkap
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Ticket History */}
          <section className="space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground/80 px-2 flex items-center gap-2">
              <HistoryIcon className="h-3.5 w-3.5" /> Riwayat Status
            </h3>
            <div className="relative pl-4 space-y-6 before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/40">
              {ticket.history.slice().reverse().map((h, idx) => (
                <div key={h.id} className="relative flex items-start gap-4 group">
                  <div className={cn(
                    "relative z-10 w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center transition-all",
                    idx === 0 ? "border-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]" : "border-border"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", idx === 0 ? "bg-primary" : "bg-muted-foreground/30")} />
                  </div>
                  <div className="flex-1 -mt-0.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <Badge variant="outline" className={cn("rounded-full font-black text-[8px] uppercase tracking-tighter px-1.5", idx === 0 ? "bg-primary/5 text-primary border-primary/20" : "text-muted-foreground")}>
                        {h.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-[9px] font-bold text-muted-foreground">{format(new Date(h.timestamp), 'dd/MM HH:mm')}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-800">Oleh: {h.changedBy}</p>
                    {h.note && <p className="text-[10px] text-muted-foreground mt-1 italic leading-tight">"{h.note}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketDetail;
