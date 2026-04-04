import { ActivityLog } from '@/types/shuttle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ActivityLogViewerProps {
  logs: ActivityLog[];
}

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  activate: 'bg-emerald-100 text-emerald-800',
  deactivate: 'bg-slate-100 text-slate-800',
};

const entityTypeLabels: Record<string, string> = {
  pickup_point: 'Titik Jemput',
  rayon: 'Rayon',
  route_sequence: 'Urutan Rute',
  schedule: 'Jadwal',
  booking: 'Booking',
};

const ActivityLogViewer = ({ logs }: ActivityLogViewerProps) => {
  const [searchText, setSearchText] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all-types');
  const [actionFilter, setActionFilter] = useState<string>('all-actions');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

  const filteredAndSortedLogs = useMemo(() => {
    let filtered = [...logs];

    // Apply filters
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        log =>
          log.entityName.toLowerCase().includes(search) ||
          log.userName.toLowerCase().includes(search) ||
          log.entityId.toLowerCase().includes(search)
      );
    }

    if (entityTypeFilter && entityTypeFilter !== 'all-types') {
      filtered = filtered.filter(log => log.entityType === entityTypeFilter);
    }

    if (actionFilter && actionFilter !== 'all-actions') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortBy === 'recent' ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  }, [logs, searchText, entityTypeFilter, actionFilter, sortBy]);

  const formatChangeValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '(kosong)';
    }
    if (typeof value === 'boolean') {
      return value ? 'Ya' : 'Tidak';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Log Aktivitas & Audit Trail
        </CardTitle>
        <CardDescription>
          Catatan lengkap semua perubahan data dalam sistem
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter & Pencarian
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nama, user, ID..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Entity Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe Entitas</label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">Semua Tipe</SelectItem>
                  <SelectItem value="pickup_point">Titik Jemput</SelectItem>
                  <SelectItem value="rayon">Rayon</SelectItem>
                  <SelectItem value="route_sequence">Urutan Rute</SelectItem>
                  <SelectItem value="schedule">Jadwal</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aksi</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Aksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-actions">Semua Aksi</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="activate">Activate</SelectItem>
                  <SelectItem value="deactivate">Deactivate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Urutkan</label>
              <Select value={sortBy} onValueChange={v => setSortBy(v as 'recent' | 'oldest')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Terbaru</SelectItem>
                  <SelectItem value="oldest">Tertua</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          {filteredAndSortedLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Tidak ada log aktivitas yang cocok dengan filter</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Tipe Entitas</TableHead>
                  <TableHead>Nama Entitas</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Perubahan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedLogs.map(log => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge className={actionColors[log.action] || 'bg-gray-100'}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {entityTypeLabels[log.entityType] || log.entityType}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate">{log.entityName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{log.entityId}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{log.userName}</div>
                      {log.ipAddress && (
                        <div className="text-xs text-muted-foreground font-mono">{log.ipAddress}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {Object.keys(log.changes).length === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <details className="cursor-pointer">
                          <summary className="text-xs font-mono hover:underline">
                            {Object.keys(log.changes).length} perubahan
                          </summary>
                          <div className="mt-2 space-y-1 text-xs bg-muted p-2 rounded">
                            {Object.entries(log.changes).map(([field, change]) => (
                              <div key={field} className="font-mono">
                                <div className="font-semibold text-foreground">{field}:</div>
                                <div className="text-muted-foreground ml-2">
                                  {formatChangeValue(change.oldValue)} → {formatChangeValue(change.newValue)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Statistics */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-sm mb-3">Statistik</h3>
          <div className="grid grid-cols-5 gap-3 text-sm">
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="font-bold text-green-900">{logs.filter(l => l.action === 'create').length}</div>
              <div className="text-xs text-green-700">Create</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="font-bold text-blue-900">{logs.filter(l => l.action === 'update').length}</div>
              <div className="text-xs text-blue-700">Update</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <div className="font-bold text-red-900">{logs.filter(l => l.action === 'delete').length}</div>
              <div className="text-xs text-red-700">Delete</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-center">
              <div className="font-bold text-emerald-900">{logs.filter(l => l.action === 'activate').length}</div>
              <div className="text-xs text-emerald-700">Activate</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <div className="font-bold text-slate-900">{logs.filter(l => l.action === 'deactivate').length}</div>
              <div className="text-xs text-slate-700">Deactivate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLogViewer;
