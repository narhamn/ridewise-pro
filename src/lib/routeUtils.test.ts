import { describe, it, expect } from 'vitest';
import { 
  calculateDistanceBetweenPoints, 
  calculateTotalRouteDistance, 
  isValidCoordinate,
  pointsToGeoJSON 
} from './routeUtils';

describe('Route Utils', () => {
  describe('calculateDistanceBetweenPoints', () => {
    it('should calculate distance correctly between two points', () => {
      // Medan to Binjai approx
      const medan = { lat: 3.5952, lng: 98.6722 };
      const binjai = { lat: 3.6033, lng: 98.4855 };
      const distance = calculateDistanceBetweenPoints(medan.lat, medan.lng, binjai.lat, binjai.lng);
      
      // Approximately 20.7 km
      expect(distance).toBeGreaterThan(20000);
      expect(distance).toBeLessThan(22000);
    });

    it('should return 0 for same point', () => {
      expect(calculateDistanceBetweenPoints(3.5, 98.5, 3.5, 98.5)).toBe(0);
    });
  });

  describe('calculateTotalRouteDistance', () => {
    it('should sum distances correctly', () => {
      const points = [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 1 }, // ~111km
        { lat: 1, lng: 1 }, // ~111km
      ];
      const total = calculateTotalRouteDistance(points);
      expect(total).toBeGreaterThan(220000);
    });

    it('should return 0 for less than 2 points', () => {
      expect(calculateTotalRouteDistance([])).toBe(0);
      expect(calculateTotalRouteDistance([{ lat: 0, lng: 0 }])).toBe(0);
    });
  });

  describe('isValidCoordinate', () => {
    it('should validate coordinates within range', () => {
      expect(isValidCoordinate(3.5, 98.5)).toBe(true);
      expect(isValidCoordinate(1.0, 98.5)).toBe(false); // Too south
      expect(isValidCoordinate(3.5, 101.0)).toBe(false); // Too east
    });
  });

  describe('pointsToGeoJSON', () => {
    it('should create a valid GeoJSON Feature', () => {
      const points = [
        { lat: 3.5, lng: 98.5 },
        { lat: 3.6, lng: 98.6 },
      ];
      const geojson = pointsToGeoJSON(points);
      expect(geojson.type).toBe('Feature');
      expect(geojson.geometry.type).toBe('LineString');
      expect(geojson.geometry.coordinates).toHaveLength(2);
      expect(geojson.geometry.coordinates[0]).toEqual([98.5, 3.5]); // [lng, lat]
    });
  });
});
