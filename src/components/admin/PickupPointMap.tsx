import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Badge } from '@/components/ui/badge';
import { MAP_LAYERS } from '@/components/map/MapController';

const COLORS = [
  '#2563eb',
  '#10b981',
  '#f97316',
  '#8b5cf6',
  '#ef4444',
  '#0f766e',
  '#1d4ed8',
  '#d97706',
];

const getRouteColor = (index: number) => COLORS[index % COLORS.length];

const PickupPointMap = () => {
  const { routes, rayons, routePoints } = useShuttle();

  const groupedRoutes = useMemo(() => {
    return routes.reduce<Record<string, typeof routePoints>>((acc, route, index) => {
      acc[route.id] = routePoints
        .filter((point) => point.routeId === route.id)
        .sort((a, b) => a.order - b.order);
      return acc;
    }, {});
  }, [routes, routePoints]);

  const routeColorMap = useMemo(() => {
    return routes.reduce<Record<string, string>>((acc, route, index) => {
      acc[route.id] = getRouteColor(index);
      return acc;
    }, {});
  }, [routes]);

  const center: [number, number] = [3.5952, 98.6722];

  return (
    <div className="h-full">
      <div className="h-[520px]">
        <MapContainer center={center} zoom={10} scrollWheelZoom className="h-full w-full">
          <TileLayer
            url={MAP_LAYERS.osm.url}
            attribution={MAP_LAYERS.osm.attribution}
          />
          {routes.map((route) => {
            const routePointsByRoute = groupedRoutes[route.id] || [];
            if (routePointsByRoute.length < 2) return null;
            return (
              <Polyline
                key={`poly-${route.id}`}
                positions={routePointsByRoute.map((point) => [point.lat, point.lng] as [number, number])}
                pathOptions={{ color: routeColorMap[route.id], weight: 4, opacity: 0.7 }}
              />
            );
          })}

          {routePoints.map((point) => {
            const route = routes.find((route) => route.id === point.routeId);
            const rayon = rayons.find((rayon) => rayon.id === point.rayonId);
            const color = route ? routeColorMap[route.id] : '#0f172a';

            return (
              <CircleMarker
                key={point.id}
                center={[point.lat, point.lng]}
                radius={8}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
              >
                <Tooltip>{point.name}</Tooltip>
                <Popup>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">{point.name}</p>
                    <p className="text-xs text-muted-foreground">{point.code}</p>
                    <p>{route?.name || 'Rute tidak tersedia'}</p>
                    <p>{rayon?.name || 'Rayon tidak tersedia'}</p>
                    <p className="text-[11px] text-muted-foreground">Status: {point.status}</p>
                    <p className="text-[11px] text-muted-foreground">{point.address || 'Alamat tidak tersedia'}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <div className="border-t p-4 bg-slate-50">
        <div className="grid grid-cols-2 gap-3">
          {routes.slice(0, 6).map((route) => (
            <div key={route.id} className="rounded-lg border p-3 bg-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{rayons.find((r) => r.id === route.rayonId)?.name || 'Rayon'}</p>
                  <p className="font-semibold text-sm">{route.name}</p>
                </div>
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: routeColorMap[route.id] }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">{(groupedRoutes[route.id] || []).length} titik jemput</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PickupPointMap;
