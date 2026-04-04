import { useShuttle } from '@/contexts/ShuttleContext';
import { MapLayerType } from '@/types/shuttle';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Layers, Map as MapIcon, Globe, Moon } from 'lucide-react';

export const MAP_LAYERS: Record<MapLayerType, { name: string, url: string, attribution: string, icon: any }> = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    icon: MapIcon
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community',
    icon: Globe
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    icon: Globe
  },
  dark: {
    name: 'Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    icon: Moon
  }
};

export const MapController = () => {
  const { mapLayer, setMapLayer } = useShuttle();

  const currentLayer = MAP_LAYERS[mapLayer];

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="shadow-md border bg-white/90 backdrop-blur-sm hover:bg-white">
            <Layers className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{currentLayer.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Pilih Jenis Peta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.entries(MAP_LAYERS) as [MapLayerType, typeof MAP_LAYERS['osm']][]).map(([key, config]) => (
            <DropdownMenuItem 
              key={key} 
              onClick={() => setMapLayer(key)}
              className={`flex items-center gap-2 ${mapLayer === key ? 'bg-primary/10 text-primary font-medium' : ''}`}
            >
              <config.icon className="h-4 w-4" />
              {config.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
