import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RouteEditorMap from './RouteEditorMap';
import { ShuttleProvider } from '@/contexts/ShuttleContext';
import { Route } from '@/types/shuttle';

// Mock Leaflet as it requires a real DOM with specific APIs
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn().mockReturnValue({
      setView: vi.fn().mockReturnThis(),
      on: vi.fn(),
      remove: vi.fn(),
      addLayer: vi.fn(),
      removeLayer: vi.fn(),
      fitBounds: vi.fn(),
      attributionControl: {
        removeAttribution: vi.fn(),
        addAttribution: vi.fn(),
      },
      eachLayer: vi.fn(),
    }),
    tileLayer: vi.fn().mockReturnValue({
      addTo: vi.fn().mockReturnThis(),
      on: vi.fn(),
      setUrl: vi.fn(),
      options: { attribution: '' },
    }),
    polyline: vi.fn().mockReturnValue({
      addTo: vi.fn().mockReturnThis(),
      getBounds: vi.fn(),
    }),
    marker: vi.fn().mockReturnValue({
      addTo: vi.fn().mockReturnThis(),
      on: vi.fn(),
      bindPopup: vi.fn().mockReturnThis(),
    }),
    divIcon: vi.fn(),
  },
}));

// Mock ShuttleContext
vi.mock('@/contexts/ShuttleContext', async () => {
  const actual = await vi.importActual('@/contexts/ShuttleContext');
  return {
    ...actual,
    useShuttle: () => ({
      routePoints: [],
      mapLayer: 'osm',
      schedules: [],
      drivers: [],
      vehicles: [],
      setMapLayer: vi.fn(),
    }),
  };
});

describe('RouteEditorMap Component', () => {
  const mockRoute: Route = {
    id: 'r1',
    name: 'Medan - Binjai',
    rayon: 'A',
    origin: 'Medan',
    destination: 'Binjai',
    distanceMeters: 20000,
    pricePerMeter: 1500,
    price: 30000,
  };

  it('renders "Pilih Rute" overlay when no route is selected', () => {
    render(<RouteEditorMap route={null} />);
    expect(screen.getByText(/Pilih Rute/i)).toBeInTheDocument();
    expect(screen.getByText(/Pilih rute dari tabel di bawah/i)).toBeInTheDocument();
  });

  it('renders route details and edit mode when a route is selected', () => {
    render(<RouteEditorMap route={mockRoute} />);
    expect(screen.getByText(/Mode Edit/i)).toBeInTheDocument();
    expect(screen.getByText(mockRoute.name)).toBeInTheDocument();
    expect(screen.getByText(/Simpan Titik/i)).toBeInTheDocument();
  });

  it('shows reset button when route is selected', () => {
    render(<RouteEditorMap route={mockRoute} />);
    expect(screen.getByText(/Reset/i)).toBeInTheDocument();
  });
});
