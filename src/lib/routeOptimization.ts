import { RouteSequence, PickupPoint, Rayon } from '@/types/shuttle';
import { calculateDistance } from './validation';

/**
 * Calculate route statistics (total distance, time, cost)
 */
export const calculateRouteStats = (
  sequences: RouteSequence[],
  rayons: Rayon[]
) => {
  if (sequences.length === 0) {
    return {
      totalDistance: 0,
      totalTime: 0,
      totalCost: 0,
      averageSpeedKmh: 0,
      stopsCount: sequences.length,
    };
  }

  const lastSequence = sequences[sequences.length - 1];
  const totalDistance = lastSequence.cumulativeDistance;
  const totalTime = lastSequence.cumulativeTime;
  const totalCost = lastSequence.price;

  // Estimate average speed: 40 km/h for city routes
  const averageSpeedKmh = totalTime > 0 ? (totalDistance / 1000) / (totalTime / 60) : 0;

  return {
    totalDistance,
    totalTime,
    totalCost,
    averageSpeedKmh: Math.round(averageSpeedKmh * 10) / 10,
    stopsCount: sequences.length,
  };
};

/**
 * Estimate time between two points based on distance
 * Assumes 40 km/h average speed for city routes
 */
export const estimateTravelTime = (distanceMeters: number): number => {
  // 40 km/h = 11.11 m/s = 0.67 meters per minute
  // Plus 2 minutes per stop for pickup/dropoff
  const minutesTraveling = distanceMeters / 667;
  const minutesStop = 2;
  return Math.round(minutesTraveling + minutesStop);
};

/**
 * Calculate price between two points based on rayon pricing and distance
 */
export const calculateSegmentPrice = (
  distanceMeters: number,
  rayonPricePerMeter: number = 2.0
): number => {
  return Math.round(distanceMeters * rayonPricePerMeter);
};

/**
 * Validate route sequence for logical errors
 */
export const validateRouteSequence = (sequences: RouteSequence[]): string[] => {
  const errors: string[] = [];

  if (sequences.length === 0) {
    errors.push('Rute harus memiliki minimal 1 titik jemput');
  }

  // Check for duplicate pickup points
  const pointIds = sequences.map(s => s.pickupPointId);
  const uniqueIds = new Set(pointIds);
  if (pointIds.length !== uniqueIds.size) {
    errors.push('Rute tidak boleh memiliki titik jemput duplikat');
  }

  // Check sequence order is continuous
  for (let i = 0; i < sequences.length; i++) {
    if (sequences[i].sequenceOrder !== i + 1) {
      errors.push(`Urutan sequence tidak konsisten pada posisi ${i + 1}`);
    }
  }

  // Check for invalid cumulative values
  sequences.forEach((seq, idx) => {
    if (idx > 0) {
      const prevSeq = sequences[idx - 1];
      if (seq.cumulativeDistance < prevSeq.cumulativeDistance) {
        errors.push(`Jarak kumulatif tidak valid pada stop ${idx + 1}`);
      }
      if (seq.cumulativeTime < prevSeq.cumulativeTime) {
        errors.push(`Waktu kumulatif tidak valid pada stop ${idx + 1}`);
      }
    }
  });

  return errors;
};

/**
 * Reorder sequences with new sequence numbers
 */
export const reorderSequences = (
  originalSequences: RouteSequence[],
  newOrder: RouteSequence[]
): RouteSequence[] => {
  return newOrder.map((seq, idx) => ({
    ...seq,
    sequenceOrder: idx + 1,
  }));
};

/**
 * Calculate cumulative values for sequences
 */
export const calculateCumulativeValues = (
  sequences: RouteSequence[]
): RouteSequence[] => {
  return sequences.map((seq, idx) => {
    if (idx === 0) {
      return {
        ...seq,
        cumulativeDistance: seq.estimatedDistanceFromPrevious,
        cumulativeTime: seq.estimatedTimeFromPrevious,
      };
    }

    const prevSeq = sequences[idx - 1];
    return {
      ...seq,
      cumulativeDistance: prevSeq.cumulativeDistance + seq.estimatedDistanceFromPrevious,
      cumulativeTime: prevSeq.cumulativeTime + seq.estimatedTimeFromPrevious,
    };
  });
};

/**
 * Generate route name based on start and end points
 */
export const generateRouteName = (
  sequences: RouteSequence[],
  pickupPoints: PickupPoint[]
): string => {
  if (sequences.length === 0) return 'New Route';

  const firstSeq = sequences[0];
  const lastSeq = sequences[sequences.length - 1];

  const firstPoint = pickupPoints.find(p => p.id === firstSeq.pickupPointId);
  const lastPoint = pickupPoints.find(p => p.id === lastSeq.pickupPointId);

  if (firstPoint && lastPoint) {
    return `${firstPoint.name} → ${lastPoint.name}`;
  }

  return `Route (${sequences.length} stops)`;
};

/**
 * Find optimal route using nearest neighbor algorithm
 * (Simple greedy approach - not true optimization)
 */
export const findNearestNeighborRoute = (
  startPointId: string,
  pickupPoints: PickupPoint[]
): PickupPoint[] => {
  const visited = new Set<string>();
  const route: PickupPoint[] = [];

  let currentPoint = pickupPoints.find(p => p.id === startPointId);
  if (!currentPoint) return [];

  route.push(currentPoint);
  visited.add(startPointId);

  while (route.length < pickupPoints.length) {
    const unvisitedPoints = pickupPoints.filter(p => !visited.has(p.id));
    if (unvisitedPoints.length === 0) break;

    // Find nearest unvisited point
    let nearest = unvisitedPoints[0];
    let minDistance = calculateDistance(
      currentPoint!.lat,
      currentPoint!.lng,
      nearest.lat,
      nearest.lng
    );

    for (let i = 1; i < unvisitedPoints.length; i++) {
      const point = unvisitedPoints[i];
      const dist = calculateDistance(
        currentPoint!.lat,
        currentPoint!.lng,
        point.lat,
        point.lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = point;
      }
    }

    route.push(nearest);
    visited.add(nearest.id);
    currentPoint = nearest;
  }

  return route;
};

/**
 * Create route sequences from ordered pickup points
 */
export const generateSequencesFromPoints = (
  routeId: string,
  orderedPoints: PickupPoint[]
): Omit<RouteSequence, 'id'>[] => {
  return orderedPoints.map((point, idx) => {
    let distFromPrev = 0;
    let timeFromPrev = 0;

    if (idx > 0) {
      const prevPoint = orderedPoints[idx - 1];
      distFromPrev = Math.round(
        calculateDistance(prevPoint.lat, prevPoint.lng, point.lat, point.lng) * 1000
      ); // Convert to meters
      timeFromPrev = estimateTravelTime(distFromPrev);
    }

    const cumulativeDistance = idx === 0
      ? distFromPrev
      : (orderedPoints.slice(0, idx).reduce((sum, p, i) => {
          if (i === 0) return distFromPrev;
          const prev = orderedPoints[i - 1];
          return sum + Math.round(calculateDistance(prev.lat, prev.lng, p.lat, p.lng) * 1000);
        }, 0)) + distFromPrev;

    const cumulativeTime = idx === 0
      ? timeFromPrev
      : (orderedPoints.slice(0, idx).reduce((sum, p, i) => {
          if (i === 0) return timeFromPrev;
          const prev = orderedPoints[i - 1];
          const dist = Math.round(calculateDistance(prev.lat, prev.lng, p.lat, p.lng) * 1000);
          return sum + estimateTravelTime(dist);
        }, 0)) + timeFromPrev;

    return {
      routeId,
      pickupPointId: point.id,
      sequenceOrder: idx + 1,
      estimatedTimeFromPrevious: timeFromPrev,
      estimatedDistanceFromPrevious: distFromPrev,
      cumulativeTime,
      cumulativeDistance,
      price: calculateSegmentPrice(cumulativeDistance, 2.0), // Default 2.0 Rp/meter
    };
  });
};

/**
 * Export route to route format for booking system
 */
export const exportRouteSequencesToRoute = (
  routeId: string,
  sequences: RouteSequence[],
  pickupPoints: PickupPoint[]
) => {
  const stats = calculateRouteStats(sequences, []);
  const routeName = generateRouteName(sequences, pickupPoints);

  return {
    routeId,
    routeName,
    ...stats,
    sequences,
  };
};

/**
 * Format distance for display
 */
export const formatRouteDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters.toLocaleString('id-ID')} m`;
  }
  return `${(meters / 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} km`;
};

/**
 * Format time for display
 */
export const formatRouteTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} menit`;
  }

  if (mins === 0) {
    return `${hours} jam`;
  }

  return `${hours}j ${mins}m`;
};

/**
 * Format currency for display
 */
export const formatRouteCost = (cost: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(cost);
};
