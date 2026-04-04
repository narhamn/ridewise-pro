import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import { PickupPoint } from '@/types/shuttle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface PickupPointMapProps {
  pickupPoints: PickupPoint[];
  selectedId?: string;
  center?: LatLngExpression;
  zoom?: number;
}

// Custom icons for different rayons
const createRayonIcon = (rayon: string) => {
  const rayonColors: Record<string, string> = {
    A: '#3b82f6', // blue
    B: '#8b5cf6', // purple
    C: '#f59e0b', // amber
    D: '#ef4444', // red
  };

  return `
    <svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C8.48 0 4 4.48 4 10c0 8 10 30 10 30s10-22 10-30c0-5.52-4.48-10-10-10z" fill="${rayonColors[rayon]}" stroke="white" stroke-width="1.5"/>
      <text x="14" y="13" font-size="10" font-weight="bold" fill="white" text-anchor="middle">${rayon}</text>
    </svg>
  `;
};

const rayonColors: Record<string, string> = {
  A: '#3b82f6',
  B: '#8b5cf6',
  C: '#f59e0b',
  D: '#ef4444',
};

// Separate component for markers to avoid context issues
interface MarkersProps {
  pickupPoints: PickupPoint[];
  selectedId?: string;
}

const PickupPointMarkers = ({ pickupPoints, selectedId }: MarkersProps) => {
  return (
    <>
      {pickupPoints
        .filter(p => p.isActive)
        .map(pp => (
          <Marker
            key={pp.id}
            position={[pp.lat, pp.lng]}
            icon={
              new Icon({
                iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(createRayonIcon(pp.rayon))}`,
                iconSize: [28, 40],
                iconAnchor: [14, 40],
                popupAnchor: [0, -40],
              })
            }
            opacity={selectedId === pp.id ? 1 : 0.8}
          >
            <Popup className="custom-popup">
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-sm">{pp.name}</h3>
                  <p className="text-xs text-muted-foreground">{pp.code}</p>
                </div>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="font-medium">Rayon:</span> {pp.rayon}
                  </div>
                  <div>
                    <span className="font-medium">Kota:</span> {pp.city}
                  </div>
                  <div>
                    <span className="font-medium">Alamat:</span> {pp.address}
                  </div>
                  <div>
                    <span className="font-medium">Kontak:</span> {pp.phone}
                  </div>
                  <div>
                    <span className="font-medium">Koordinat:</span> {pp.lat.toFixed(4)}, {pp.lng.toFixed(4)}
                  </div>
                  {pp.facilities && pp.facilities.length > 0 && (
                    <div>
                      <span className="font-medium">Fasilitas:</span> {pp.facilities.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      {pickupPoints
        .filter(p => p.isActive && p.id === selectedId)
        .map(pp => (
          <Circle
            key={`circle-${pp.id}`}
            center={[pp.lat, pp.lng]}
            radius={5000}
            pathOptions={{
              color: rayonColors[pp.rayon],
              weight: 2,
              opacity: 0.2,
              fillOpacity: 0.05,
            }}
          />
        ))}
    </>
  );
};

const PickupPointMap = ({ pickupPoints, selectedId, center = [3.5952, 98.6722], zoom = 11 }: PickupPointMapProps) => {
  const mapRef = useRef<L.Map>(null);

  // Focus on selected marker when it changes
  useEffect(() => {
    if (selectedId && mapRef.current) {
      const selectedPoint = pickupPoints.find(p => p.id === selectedId);
      if (selectedPoint) {
        mapRef.current.setView([selectedPoint.lat, selectedPoint.lng], 15, { animate: true });
      }
    }
  }, [selectedId, pickupPoints]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Peta Titik Jemput
        </CardTitle>
        <CardDescription>
          Visualisasi lokasi semua titik jemput berdasarkan rayon
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="grid grid-cols-4 gap-4 p-3 bg-muted rounded-lg">
            {['A', 'B', 'C', 'D'].map(rayon => (
              <div key={rayon} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: rayonColors[rayon] }}
                />
                <span className="text-sm">
                  Rayon {rayon} ({pickupPoints.filter(p => p.rayon === rayon && p.isActive).length})
                </span>
              </div>
            ))}
          </div>

          {/* Map Container */}
          <div className="rounded-lg overflow-hidden border h-96">
            <MapContainer
              center={center as LatLngExpression}
              zoom={zoom}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <PickupPointMarkers pickupPoints={pickupPoints} selectedId={selectedId} />
            </MapContainer>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900">{pickupPoints.filter(p => p.rayon === 'A' && p.isActive).length}</div>
              <div className="text-xs text-blue-700">Rayon A</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-900">{pickupPoints.filter(p => p.rayon === 'B' && p.isActive).length}</div>
              <div className="text-xs text-purple-700">Rayon B</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="font-medium text-amber-900">{pickupPoints.filter(p => p.rayon === 'C' && p.isActive).length}</div>
              <div className="text-xs text-amber-700">Rayon C</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="font-medium text-red-900">{pickupPoints.filter(p => p.rayon === 'D' && p.isActive).length}</div>
              <div className="text-xs text-red-700">Rayon D</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PickupPointMap;
