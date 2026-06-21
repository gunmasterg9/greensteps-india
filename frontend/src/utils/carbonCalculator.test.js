import { describe, test, expect } from 'vitest';
import { calculateActivityCarbon, calculateBatchCarbon } from './carbonCalculator';

describe('Carbon Calculator Logic (Emission Math)', () => {
  describe('calculateActivityCarbon', () => {
    test('calculates electricity emissions correctly', () => {
      // 100 kWh * 0.82 = 82 kg CO2
      expect(calculateActivityCarbon('electricity', 100)).toBe(82);
    });

    test('calculates LPG emissions correctly', () => {
      // 10 kg * 2.98 = 29.8 kg CO2
      expect(calculateActivityCarbon('lpg', 10)).toBe(29.8);
    });

    test('calculates transport emissions correctly for different vehicle types', () => {
      // 100 km * petrolCar (0.18) = 18
      expect(calculateActivityCarbon('transport', 100, 'petrolCar')).toBe(18);
      // 100 km * ev (0.04) = 4
      expect(calculateActivityCarbon('transport', 100, 'ev')).toBe(4);
      // 100 km * metro (0.015) = 1.5
      expect(calculateActivityCarbon('transport', 100, 'metro')).toBe(1.5);
    });

    test('calculates food emissions correctly for dietary choices', () => {
      expect(calculateActivityCarbon('food', 1, 'highMeat')).toBe(2.5);
      expect(calculateActivityCarbon('food', 1, 'vegetarian')).toBe(1.2);
      expect(calculateActivityCarbon('food', 1, 'vegan')).toBe(0.7);
    });

    test('calculates shopping emissions correctly', () => {
      expect(calculateActivityCarbon('shopping', 5)).toBe(2.5);
    });

    test('calculates waste emissions correctly for disposal treatment types', () => {
      expect(calculateActivityCarbon('waste', 10, 'landfill')).toBe(6);
      expect(calculateActivityCarbon('waste', 10, 'organic')).toBe(4);
      expect(calculateActivityCarbon('waste', 10, 'recyclable')).toBe(1);
    });

    test('returns 0 for unknown category', () => {
      expect(calculateActivityCarbon('unknown', 100)).toBe(0);
    });
  });

  describe('calculateBatchCarbon', () => {
    test('calculates comprehensive annual, monthly and daily carbon footprints correctly', () => {
      const inputs = {
        electricity: { value: 100 }, // 100 * 0.82 * 12 = 984
        lpg: { value: 1 }, // 1 * 14.2 * 2.98 * 12 = 507.792
        transport: { value: 200, subtype: 'twoWheeler' }, // 200 * 0.06 * 12 = 144
        food: { subtype: 'vegan' }, // 0.7 * 365 = 255.5
        shopping: { value: 2 }, // 2 * 0.5 * 12 = 12
        waste: { value: 5, subtype: 'organic' } // 5 * 0.4 * 52 = 104
      };

      const result = calculateBatchCarbon(inputs);

      // Expected annual carbon calculation: 984 + 507.792 + 144 + 255.5 + 12 + 104 = 2007.292 ~ 2007.29
      expect(result.annual).toBeCloseTo(2007.29, 1);
      expect(result.monthly).toBeCloseTo(2007.29 / 12, 1);
      expect(result.daily).toBeCloseTo(2007.29 / 365, 1);
    });
  });
});
