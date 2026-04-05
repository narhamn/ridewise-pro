import { describe, it, expect } from 'vitest';
import { 
  calculateBasePrice, 
  applyMultipliers, 
  calculateDiscount, 
  calculateTax, 
  calculateFinalPrice, 
  formatPrice 
} from './pricing';

describe('Pricing Engine', () => {
  describe('calculateBasePrice', () => {
    it('should calculate base price correctly', () => {
      expect(calculateBasePrice(1000, 2)).toBe(2000);
      expect(calculateBasePrice(0, 10)).toBe(0);
    });

    it('should handle negative values by clamping to 0', () => {
      expect(calculateBasePrice(-1, 1)).toBe(0);
      expect(calculateBasePrice(1, -1)).toBe(0);
    });
  });

  describe('applyMultipliers', () => {
    it('should apply multipliers correctly', () => {
      const price = 1000;
      const multipliers = { roadCondition: 1.2, vehicleType: 1.5, markup: 1.1 };
      
      // 1000 * 1.2 * 1.5 * 1.1 = 1980
      expect(applyMultipliers(price, multipliers)).toBeCloseTo(1980);
    });

    it('should handle missing multipliers', () => {
      expect(applyMultipliers(1000)).toBe(1000);
      expect(applyMultipliers(1000, { roadCondition: 1.2 })).toBe(1200);
    });

    it('should handle zero price', () => {
      expect(applyMultipliers(0, { roadCondition: 1.2 })).toBe(0);
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discount correctly', () => {
      expect(calculateDiscount(10000, 0.1)).toBe(1000);
    });

    it('should clamp invalid discount rates', () => {
      expect(calculateDiscount(10000, -0.1)).toBe(0);
      expect(calculateDiscount(10000, 1.1)).toBe(10000);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax correctly', () => {
      expect(calculateTax(10000, 0.11)).toBe(1100);
    });

    it('should clamp invalid tax rates', () => {
      expect(calculateTax(10000, -0.1)).toBe(0);
      expect(calculateTax(10000, 1.1)).toBe(10000);
    });
  });

  describe('calculateFinalPrice', () => {
    it('should calculate the final price with all factors', () => {
      const distance = 10000; // 10km
      const ppm = 2; // Rp 2/m
      const options = {
        multipliers: { roadCondition: 1.2, vehicleType: 1.5 },
        discountRate: 0.1, // 10% discount
        taxRate: 0.11, // 11% tax
      };

      const result = calculateFinalPrice(distance, ppm, options);

      expect(result.basePrice).toBe(20000);
      expect(result.multiplierEffect).toBe(16000);
      expect(result.discountAmount).toBe(3600);
      expect(result.taxAmount).toBe(3564);
      expect(result.subtotal).toBe(32400);
      expect(result.finalPrice).toBe(35964);
    });

    it('should calculate final price with fixed discount and cap', () => {
      const distance = 10000; // 10km
      const ppm = 2; // Rp 2/m
      const options = {
        discountFixed: 5000,
        discountRate: 0.1, // 10%
        maxDiscount: 6000, // cap at 6000
        taxRate: 0.1,
      };

      // base = 20000
      // discRateAmt = 20000 * 0.1 = 2000
      // totalDiscBeforeCap = 2000 + 5000 = 7000
      // discAfterCap = 6000
      // subtotal = 20000 - 6000 = 14000
      // tax = 14000 * 0.1 = 1400
      // final = 15400

      const result = calculateFinalPrice(distance, ppm, options);
      expect(result.discountAmount).toBe(6000);
      expect(result.finalPrice).toBe(15400);
    });

    it('should not allow discount to exceed total price', () => {
      const result = calculateFinalPrice(1000, 2, { discountFixed: 5000 });
      // price is 2000, discount is 5000 -> discount capped at 2000
      expect(result.discountAmount).toBe(2000);
      expect(result.finalPrice).toBe(0);
    });

    it('should handle zero distance', () => {
      const result = calculateFinalPrice(0, 2);
      expect(result.finalPrice).toBe(0);
    });
  });

  describe('formatPrice', () => {
    it('should format IDR correctly', () => {
      const price = 50000;
      // Depending on locale, could be Rp 50.000 or Rp50.000
      // But we just want to ensure it contains 'Rp' and '50'
      const formatted = formatPrice(price);
      expect(formatted).toContain('Rp');
      expect(formatted).toContain('50');
    });

    it('should format USD correctly', () => {
      const price = 50;
      const formatted = formatPrice(price, 'USD');
      expect(formatted).toContain('$');
      expect(formatted).toContain('50');
    });
  });
});
