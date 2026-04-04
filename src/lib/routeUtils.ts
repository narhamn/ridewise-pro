/**
 * Menghitung jarak antara dua titik koordinat dalam meter menggunakan formula Haversine.
 */
export const calculateDistanceBetweenPoints = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Menghitung total jarak rute berdasarkan daftar titik.
 */
export const calculateTotalRouteDistance = (points: { lat: number; lng: number }[]): number => {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += calculateDistanceBetweenPoints(
      points[i].lat,
      points[i].lng,
      points[i + 1].lat,
      points[i + 1].lng
    );
  }
  return total;
};

/**
 * Konversi daftar titik rute ke format GeoJSON LineString yang valid.
 */
export const pointsToGeoJSON = (points: { lat: number; lng: number }[]) => {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: points.map(p => [p.lng, p.lat]) // GeoJSON menggunakan [lng, lat]
    },
    properties: {
      totalDistance: calculateTotalRouteDistance(points)
    }
  };
};

/**
 * Validasi koordinat apakah berada dalam area operasional yang diizinkan.
 */
export const isValidCoordinate = (lat: number, lng: number): boolean => {
  // Area Sumatera Utara / Medan approx
  return lat >= 2.0 && lat <= 5.0 && lng >= 97.0 && lng <= 100.0;
};
