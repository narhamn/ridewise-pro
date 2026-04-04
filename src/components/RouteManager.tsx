import { useState, useMemo } from 'react';
import { formatDistanceStrict } from 'date-fns';
import { Route, RoutePoint } from '@/types/shuttle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MapPin, Navigation2, DollarSign, Route as RouteIcon, ChevronDown, ChevronUp, Eye, Trash2, Edit } from 'lucide-react';
import RouteMapEditor from './RouteMapEditor';
import { cn } from '@/lib/utils';

interface RouteManagerProps {
  routes: Route[];
  routePoints: RoutePoint[];
  onSaveRoute: (route: Route, points: RoutePoint[]) => void;
  onUpdateRoute: (routeId: string, route: Route, points: RoutePoint[]) => void;
  onDeleteRoute: (routeId: string) => void;
  onSavePoint: (point: RoutePoint) => void;
  onUpdatePoint: (pointId: string, point: RoutePoint) => void;
  onDeletePoint: (pointId: string) => void;
}

const RouteManager = ({
  routes,
  routePoints,
  onSaveRoute,
  onUpdateRoute,
  onDeleteRoute,
  onSavePoint,
  onUpdatePoint,
  onDeletePoint,
}: RouteManagerProps) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(
    routes.length > 0 ? routes[0].id : null
  );
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(selectedRouteId);

  const selectedRoute = useMemo(
    () => routes.find(r => r.id === selectedRouteId),
    [routes, selectedRouteId]
  );

  const selectedRoutePointsList = useMemo(
    () => routePoints
      .filter(p => p.routeId === selectedRouteId)
      .sort((a, b) => a.order - b.order),
    [routePoints, selectedRouteId]
  );

  // Calculate route statistics
  const routeStats = useMemo(() => {
    if (!selectedRoute || selectedRoutePointsList.length === 0) {
      return { totalDistance: 0, totalPrice: 0, pointCount: 0, avgPricePerKm: 0 };
    }

    const totalDistance = selectedRoutePointsList.reduce((sum, p) => sum + (p.cumulativeDistance || 0), 0);
    const totalPrice = selectedRoutePointsList[selectedRoutePointsList.length - 1]?.cumulativeDistance || 0;
    const lastPoint = selectedRoutePointsList[selectedRoutePointsList.length - 1];
    const pricePerKm = totalDistance > 0 ? (lastPoint?.price || 0) / (totalDistance / 1000) : 0;

    return {
      totalDistance,
      totalPrice: lastPoint?.price || 0,
      pointCount: selectedRoutePointsList.length,
      avgPricePerKm: pricePerKm,
    };
  }, [selectedRoute, selectedRoutePointsList]);

  const rayonColorMap: Record<string, { bg: string; text: string; border: string }> = {
    'A': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'B': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'C': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'D': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  };

  const getRayonColors = (rayon: string) => rayonColorMap[rayon] || rayonColorMap['A'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <RouteIcon className="h-6 w-6 text-slate-900" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Rute</h1>
          </div>
          <p className="text-sm text-slate-600">Kelola rute perjalanan, titik jemput, dan harga</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 max-w-7xl mx-auto">
        {/* Sidebar - Routes List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Daftar Rute ({routes.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="px-4 py-2 space-y-2">
                  {routes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">Belum ada rute</p>
                    </div>
                  ) : (
                    routes.map((route) => {
                      const points = routePoints.filter(p => p.routeId === route.id);
                      const colors = getRayonColors(route.rayon);
                      const isSelected = selectedRouteId === route.id;
                      const isExpanded = expandedRouteId === route.id;

                      return (
                        <div key={route.id} className={cn(
                          'rounded-lg border transition-all duration-200',
                          isSelected
                            ? `${colors.border} ${colors.bg} border-2`
                            : 'border-slate-200 hover:border-slate-300'
                        )}>
                          <button
                            onClick={() => {
                              setSelectedRouteId(route.id);
                              setExpandedRouteId(isExpanded ? null : route.id);
                            }}
                            className="w-full p-3 flex items-start justify-between hover:bg-slate-50/50 rounded-lg transition-colors"
                          >
                            <div className="text-left flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-sm text-slate-900 truncate">{route.name}</h3>
                                <Badge variant="outline" className={`text-xs font-mono ${colors.text}`}>
                                  {route.rayon}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 truncate">{route.origin} → {route.destination}</p>
                              <p className="text-xs text-slate-500 mt-1">{points.length} titik</p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0 ml-2" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0 ml-2" />
                            )}
                          </button>

                          {isExpanded && (
                            <>
                              <Separator className="my-2" />
                              <div className="px-3 pb-3 space-y-3">
                                {/* Route Details */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">Rp per meter</span>
                                    <span className="text-xs font-semibold text-slate-900">{route.pricePerMeter}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">Kondisi jalan</span>
                                    <span className="text-xs font-semibold text-slate-900">{route.roadConditionMultiplier}x</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">Tipe kendaraan</span>
                                    <span className="text-xs font-semibold text-slate-900">{route.vehicleTypeMultiplier}x</span>
                                  </div>
                                </div>

                                {/* Points List */}
                                {points.length > 0 && (
                                  <div className="bg-slate-50 -mx-3 px-3 py-2 rounded border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-700 mb-2">Titik Jemput</p>
                                    <div className="space-y-1">
                                      {points.slice(0, 3).map((point, idx) => (
                                        <div key={point.id} className="flex items-center gap-2 text-xs">
                                          <div className="w-5 h-5 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {point.order}
                                          </div>
                                          <span className="truncate text-slate-700 flex-1">{point.code}</span>
                                        </div>
                                      ))}
                                      {points.length > 3 && (
                                        <p className="text-xs text-slate-500 px-2">+{points.length - 3} lainnya</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 h-8 text-xs"
                                    onClick={() => {/* Handle edit */}}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => onDeleteRoute(route.id)}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Hapus
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Map and Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Map Card */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
              {selectedRoute ? (
                <RouteMapEditor
                  routes={[selectedRoute]}
                  routePoints={selectedRoutePointsList}
                  onSaveRoute={onSaveRoute}
                  onUpdateRoute={onUpdateRoute}
                  onDeleteRoute={onDeleteRoute}
                  onSavePoint={onSavePoint}
                  onUpdatePoint={onUpdatePoint}
                  onDeletePoint={onDeletePoint}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-slate-600">Pilih rute untuk menampilkan peta</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Route Information Tabs */}
          {selectedRoute && (
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{selectedRoute.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                    <TabsTrigger value="points">Titik ({selectedRoutePointsList.length})</TabsTrigger>
                    <TabsTrigger value="pricing">Harga</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Total Distance */}
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Navigation2 className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-blue-700 font-semibold">Jarak</span>
                        </div>
                        <div className="text-lg font-bold text-blue-900">
                          {(routeStats.totalDistance / 1000).toFixed(1)} km
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs text-emerald-700 font-semibold">Total</span>
                        </div>
                        <div className="text-lg font-bold text-emerald-900">
                          Rp {routeStats.totalPrice.toLocaleString()}
                        </div>
                      </div>

                      {/* Points Count */}
                      <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <span className="text-xs text-purple-700 font-semibold">Titik</span>
                        </div>
                        <div className="text-lg font-bold text-purple-900">
                          {routeStats.pointCount}
                        </div>
                      </div>

                      {/* Avg Price per KM */}
                      <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                        <div className="flex items-center gap-2 mb-1">
                          <RouteIcon className="h-4 w-4 text-rose-600" />
                          <span className="text-xs text-rose-700 font-semibold">Per km</span>
                        </div>
                        <div className="text-lg font-bold text-rose-900">
                          Rp {routeStats.avgPricePerKm.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>

                    {/* Route Info */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Asal</p>
                        <p className="text-sm font-semibold text-slate-900">{selectedRoute.origin}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Tujuan</p>
                        <p className="text-sm font-semibold text-slate-900">{selectedRoute.destination}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Rayon</p>
                        <Badge variant="outline">{selectedRoute.rayon}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Harga per meter</p>
                        <p className="text-sm font-semibold text-slate-900">Rp {selectedRoute.pricePerMeter}</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Points Tab */}
                  <TabsContent value="points">
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3 pr-4">
                        {selectedRoutePointsList.length === 0 ? (
                          <div className="text-center py-8">
                            <MapPin className="h-8 w-8 mx-auto text-slate-400 mb-2 opacity-50" />
                            <p className="text-sm text-slate-600">Tidak ada titik jemput</p>
                          </div>
                        ) : (
                          selectedRoutePointsList.map((point) => (
                            <div
                              key={point.id}
                              className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {point.order}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm text-slate-900">{point.code}</p>
                                    <p className="text-xs text-slate-600">{point.name}</p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  Rp {point.price.toLocaleString()}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-slate-600">
                                  <span className="text-slate-500">Lat: </span>
                                  <span className="font-mono text-slate-700">{point.lat.toFixed(6)}</span>
                                </div>
                                <div className="text-slate-600">
                                  <span className="text-slate-500">Lng: </span>
                                  <span className="font-mono text-slate-700">{point.lng.toFixed(6)}</span>
                                </div>
                              </div>
                              {point.distanceFromPrevious > 0 && (
                                <div className="mt-2 text-xs text-slate-600">
                                  <span className="text-slate-500">Dari point sebelumnya: </span>
                                  <span className="font-semibold">{(point.distanceFromPrevious / 1000).toFixed(1)} km</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Pricing Tab */}
                  <TabsContent value="pricing" className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Pengali Kondisi Jalan</p>
                            <p className="text-lg font-bold text-slate-900">{selectedRoute.roadConditionMultiplier}x</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Pengali Tipe Kendaraan</p>
                            <p className="text-lg font-bold text-slate-900">{selectedRoute.vehicleTypeMultiplier}x</p>
                          </div>
                        </div>
                      </div>

                      {/* Price progression */}
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                          <h4 className="font-semibold text-sm text-slate-900">Perkembangan Harga</h4>
                        </div>
                        <div className="divide-y divide-slate-200">
                          {selectedRoutePointsList.map((point, idx) => (
                            <div key={point.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {point.order}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{point.code}</p>
                                  <p className="text-xs text-slate-500">
                                    {(point.distanceFromPrevious / 1000).toFixed(1)} km dari sebelumnya
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">Rp {point.price.toLocaleString()}</p>
                                {point.cumulativeDistance > 0 && (
                                  <p className="text-xs text-slate-500">{(point.cumulativeDistance / 1000).toFixed(1)} km</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteManager;
