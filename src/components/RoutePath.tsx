import { useMemo, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { RouteSequence, PickupPoint } from '@/types/shuttle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Edit, Check, X } from 'lucide-react';
import { formatRouteDistance, formatRouteTime } from '@/lib/routeOptimization';
import 'leaflet/dist/leaflet.css';

interface RoutePathProps {
  sequences: RouteSequence[];
  pickupPoints: PickupPoint[];
  center?: LatLngExpression;
  zoom?: number;
  enableEditing?: boolean;
  onRouteUpdate?: (waypoints: LatLngExpression[]) => void;
}

// Create marker icons for sequence order
const createSequenceIcon = (order: number) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;utf8,
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C9.37 0 4 5.37 4 12c0 10 12 28 12 28s12-18 12-28c0-6.63-5.37-12-12-12z" fill="%233b82f6" stroke="white" stroke-width="2"/>
        <text x="16" y="16" font-size="12" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${order}</text>
      </svg>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    className: 'route-marker-icon',
  });
};

// Create destination marker
const createDestinationIcon = () => {
  return new Icon({
    iconUrl: `data:image/svg+xml;utf8,
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C9.37 0 4 5.37 4 12c0 10 12 28 12 28s12-18 12-28c0-6.63-5.37-12-12-12z" fill="%2310b981" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="12" r="4" fill="white"/>
      </svg>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    className: 'route-destination-icon',
  });
};

// Separate component for route stop markers
interface RouteStopsProps {
  coordinates: PickupPoint[];
  sequences: RouteSequence[];
}

const RouteStopMarkers = ({ coordinates, sequences }: RouteStopsProps) => {
  return (
    <>
      {coordinates.map((point, idx) => {
        const isStart = idx === 0;
        const isEnd = idx === coordinates.length - 1;
        const seq = sequences[idx];

        if (!seq) return null;

        return (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={isEnd ? createDestinationIcon() : createSequenceIcon(idx + 1)}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm">{point.name}</div>
                <div className="text-muted-foreground">{point.address}</div>
                <div className="pt-2 space-y-0.5 border-t">
                  <div>
                    <span className="font-medium">Stop:</span> #{idx + 1}
                  </div>
                  {!isStart && (
                    <>
                      <div>
                        <span className="font-medium">Dari stop sebelumnya:</span>{' '}
                        {formatRouteDistance(seq.estimatedDistanceFromPrevious)} ({formatRouteTime(seq.estimatedTimeFromPrevious)})
                      </div>
                      <div>
                        <span className="font-medium">Kumulatif:</span>{' '}
                        {formatRouteDistance(seq.cumulativeDistance)} ({formatRouteTime(seq.cumulativeTime)})
                      </div>
                    </>
                  )}
                  <div>
                    <span className="font-medium">Rayon:</span> {point.rayon}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
      {coordinates.map((point, idx) => {
        if (idx !== 0) return null; // Only show circle for start point
        return (
          <Circle
            key={`circle-${point.id}`}
            center={[point.lat, point.lng]}
            radius={5000}
            color="#3b82f6"
            weight={1}
            opacity={0.2}
            fill
            fillOpacity={0.05}
          />
        );
      })}
    </>
  );
};

// Routing Control Component for editing routes
const RouteEditor = ({
  waypoints,
  onRouteChange
}: {
  waypoints: LatLngExpression[],
  onRouteChange?: (waypoints: LatLngExpression[]) => void
}) => {
  const map = useMap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!routingControlRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      routingControlRef.current = (L as any).Routing.control({
        waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
        routeWhileDragging: true,
        draggableWaypoints: true,
        addWaypoints: true,
        createMarker: function(i, wp, nWps) {
          return L.marker(wp.latLng, {
            draggable: true,
            icon: new Icon({
              iconUrl: `data:image/svg+xml;utf8,
                <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 0C9.37 0 4 5.37 4 12c0 10 12 28 12 28s12-18 12-28c0-6.63-5.37-12-12-12z" fill="%23ef4444" stroke="white" stroke-width="2"/>
                  <text x="16" y="16" font-size="12" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${i + 1}</text>
                </svg>
              `,
              iconSize: [32, 40],
              iconAnchor: [16, 40],
              popupAnchor: [0, -40],
            })
          });
        }
      }).addTo(map);

      // Listen for route changes
      if (routingControlRef.current && onRouteChange) {
        routingControlRef.current.on('routesfound', (e) => {
          const route = e.routes[0];
          const newWaypoints = route.waypoints.map(wp => [wp.latLng.lat, wp.latLng.lng] as LatLngExpression);
          onRouteChange(newWaypoints);
        });
      }
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, waypoints, onRouteChange]);

  // Update waypoints when props change
  useEffect(() => {
    if (routingControlRef.current) {
      routingControlRef.current.setWaypoints(waypoints.map(wp => L.latLng(wp[0], wp[1])));
    }
  }, [waypoints]);

  return null;
};

export const RoutePath = ({
  sequences,
  pickupPoints,
  center = [3.5952, 98.6722],
  zoom = 11,
  enableEditing = false,
  onRouteUpdate,
}: RoutePathProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedWaypoints, setEditedWaypoints] = useState<LatLngExpression[]>([]);

  // Initialize edited waypoints
  useEffect(() => {
    if (sequences.length > 0 && editedWaypoints.length === 0) {
      const waypoints = sequences
        .map(seq => {
          const point = pickupPoints.find(p => p.id === seq.pickupPointId);
          return point ? [point.lat, point.lng] as LatLngExpression : null;
        })
        .filter(Boolean) as LatLngExpression[];
      setEditedWaypoints(waypoints);
    }
  }, [sequences, pickupPoints, editedWaypoints.length]);

  // Handle route changes from routing machine
  const handleRouteChange = (waypoints: LatLngExpression[]) => {
    setEditedWaypoints(waypoints);
  };

  // Handle save edited route
  const handleSaveRoute = () => {
    if (onRouteUpdate && editedWaypoints.length > 0) {
      onRouteUpdate(editedWaypoints);
    }
    setIsEditing(false);
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    const waypoints = sequences
      .map(seq => {
        const point = pickupPoints.find(p => p.id === seq.pickupPointId);
        return point ? [point.lat, point.lng] as LatLngExpression : null;
      })
      .filter(Boolean) as LatLngExpression[];
    setEditedWaypoints(waypoints);
    setIsEditing(false);
  };

  // Calculate route coordinates and polyline
  const routeData = useMemo(() => {
    if (sequences.length === 0 && !isEditing) {
      return {
        coordinates: [],
        polylinePoints: [],
        bounds: center,
      };
    }

    // Use edited waypoints if editing, otherwise use sequence data
    const polylinePoints = isEditing ? editedWaypoints : sequences
      .map(seq => {
        const point = pickupPoints.find(p => p.id === seq.pickupPointId);
        return point ? [point.lat, point.lng] as LatLngExpression : null;
      })
      .filter(Boolean) as LatLngExpression[];

    // Create coordinate objects for display
    const coordinates = isEditing
      ? editedWaypoints.map((wp, idx) => ({
          id: `wp-${idx}`,
          lat: wp[0],
          lng: wp[1],
          name: `Waypoint ${idx + 1}`,
          address: `${wp[0].toFixed(4)}, ${wp[1].toFixed(4)}`,
          rayon: 'A', // Default
          sequenceOrder: idx + 1,
        }))
      : sequences
        .map(seq => {
          const point = pickupPoints.find(p => p.id === seq.pickupPointId);
          return point ? { ...point, sequenceOrder: seq.sequenceOrder } : null;
        })
        .filter(Boolean) as (PickupPoint & { sequenceOrder: number })[];

    // Calculate bounds center
    const bounds =
      polylinePoints.length > 0
        ? [
            polylinePoints.reduce((sum, p) => sum + p[0], 0) / polylinePoints.length,
            polylinePoints.reduce((sum, p) => sum + p[1], 0) / polylinePoints.length,
          ]
        : center;

    return {
      coordinates,
      polylinePoints,
      bounds,
    };
  }, [sequences, pickupPoints, isEditing, editedWaypoints, center]);

  if (sequences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Peta Rute
          </CardTitle>
          <CardDescription>Visualisasi rute perjalanan akan ditampilkan di sini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border h-96 flex items-center justify-center bg-muted">
            <div className="text-center">
              <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">Belum ada stop dalam rute</p>
              <p className="text-xs text-muted-foreground mt-1">Tambahkan stop untuk melihat visualisasi rute</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Peta Rute ({isEditing ? editedWaypoints.length : sequences.length} stop)
              {isEditing && <Badge variant="secondary" className="ml-2">Editing</Badge>}
            </CardTitle>
            <CardDescription>
              {!isEditing && sequences.length > 0 && (
                <>Total: {formatRouteDistance(routeData.coordinates.reduce((max, _, i) => {
                  const seq = sequences.find(s => s.sequenceOrder === i + 1);
                  return seq && (seq.cumulativeDistance > max || max === 0) ? seq.cumulativeDistance : max;
                }, 0))} dalam {formatRouteTime(routeData.coordinates.reduce((max, _, i) => {
                  const seq = sequences.find(s => s.sequenceOrder === i + 1);
                  return seq && (seq.cumulativeTime > max || max === 0) ? seq.cumulativeTime : max;
                }, 0))}</>
              )}
              {isEditing && "Click on map to add waypoints, drag markers to adjust route"}
            </CardDescription>
          </div>

          {enableEditing && sequences.length > 0 && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveRoute}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save Route
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Route
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs">Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-300" />
              <span className="text-xs">Stops</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs">End</span>
            </div>
            <div className="h-1 flex-1 border-t-2 border-dashed border-gray-400" />
            <span className="text-xs text-muted-foreground">Route Path</span>
          </div>

          {/* Map Container */}
          <div className="rounded-lg overflow-hidden border h-96">
            <MapContainer
              center={routeData.bounds as LatLngExpression}
              zoom={zoom}
              style={{ height: '100%', width: '100%' }}
              doubleClickZoom={!isEditing} // Disable double click zoom when editing
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Add routing control when editing */}
              {isEditing && editedWaypoints.length > 0 && (
                <RouteEditor
                  waypoints={editedWaypoints}
                  onRouteChange={handleRouteChange}
                />
              )}

              {/* Draw polyline for route path when not editing */}
              {!isEditing && routeData.polylinePoints.length > 1 && (
                <Polyline
                  positions={routeData.polylinePoints}
                  color="#3b82f6"
                  weight={3}
                  opacity={0.7}
                  dashArray="5, 5"
                />
              )}

              {/* Render markers for each stop when not editing */}
              {!isEditing && <RouteStopMarkers coordinates={routeData.coordinates} sequences={sequences} />}
            </MapContainer>
          </div>

          {/* Stop Details */}
          {!isEditing && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Detail Stop Rute</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {routeData.coordinates.map((point, idx) => {
                  const seq = sequences[idx];
                  if (!seq) return null;

                  const isStart = idx === 0;
                  const isEnd = idx === routeData.coordinates.length - 1;

                  return (
                    <div key={point.id} className="p-2 rounded border bg-muted/50 text-xs">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{point.name}</div>
                          <div className="text-muted-foreground truncate">{point.address}</div>
                          <div className="mt-1 space-y-0.5 text-xs">
                            {!isStart && (
                              <>
                                <div>Dari sebelumnya: {formatRouteDistance(seq.estimatedDistanceFromPrevious)} ({formatRouteTime(seq.estimatedTimeFromPrevious)})</div>
                                <div>Kumulatif: {formatRouteDistance(seq.cumulativeDistance)} ({formatRouteTime(seq.cumulativeTime)})</div>
                              </>
                            )}
                            {isEnd && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Destinasi
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Editing Instructions */}
          {isEditing && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Panduan Editing Rute</h4>
              <div className="p-3 bg-blue-50 rounded-lg text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>Klik pada peta untuk menambah waypoint baru</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>Drag marker merah untuk memindahkan posisi waypoint</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>Rute akan otomatis dihitung ulang menggunakan OpenStreetMap</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>Klik "Save Route" untuk menyimpan perubahan</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
