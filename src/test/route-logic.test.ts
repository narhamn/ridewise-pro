import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance, isValidRouteData } from '../lib/utils';
import { calculateFinalPrice } from '../lib/pricing';

describe('Route Logic', () => {
  describe('Haversine Distance Calculation', () => {
    it('should calculate accurate distance between two points', () => {
      // Coordinates for Medan (Hermes) and Kualanamu Airport
      const lat1 = 3.5952;
      const lon1 = 98.6722;
      const lat2 = 3.6422;
      const lon2 = 98.8853;

      const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
      
      // Expected distance is around 24-25 km (direct line)
      // The dummy data uses 38km (likely road distance), but Haversine is direct line.
      expect(distance).toBeGreaterThan(20);
      expect(distance).toBeLessThan(30);
    });

    it('should return 0 for the same point', () => {
      const lat = 3.5952;
      const lon = 98.6722;
      expect(calculateHaversineDistance(lat, lon, lat, lon)).toBe(0);
    });

    it('should handle large distances correctly', () => {
      // Medan to Jakarta
      const lat1 = 3.5952;
      const lon1 = 98.6722;
      const lat2 = -6.2088;
      const lon2 = 106.8456;
      
      const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(1400);
      expect(distance).toBeLessThan(1500);
    });
  });

  describe('Route Data Validation', () => {
    it('should validate correct coordinates', () => {
      expect(isValidRouteData(3.5, 98.6, 3.6, 98.8)).toBe(true);
    });

    it('should invalidate out of range latitudes', () => {
      expect(isValidRouteData(91, 98.6, 3.6, 98.8)).toBe(false);
      expect(isValidRouteData(-91, 98.6, 3.6, 98.8)).toBe(false);
    });

    it('should invalidate out of range longitudes', () => {
      expect(isValidRouteData(3.5, 181, 3.6, 98.8)).toBe(false);
      expect(isValidRouteData(3.5, -181, 3.6, 98.8)).toBe(false);
    });
  });

  describe('Pricing Logic (Manual Verification)', () => {
    it('should calculate price correctly with multipliers', () => {
      const distance = 10000; // 10km
      const ppm = 2; // Rp 2/meter
      const roadFactor = 1.2; // Bad road
      const vehicleFactor = 1.5; // Luxury vehicle

      const { finalPrice } = calculateFinalPrice(distance, ppm, {
        multipliers: { roadCondition: roadFactor, vehicleType: vehicleFactor }
      });
      
      // 10000 * 2 * 1.2 * 1.5 = 36000
      expect(finalPrice).toBe(36000);
    });

    it('should handle zero distance', () => {
      const { finalPrice } = calculateFinalPrice(0, 2);
      expect(finalPrice).toBe(0);
    });
  });
});
