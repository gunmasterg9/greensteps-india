const request = require('supertest');
const app = require('../index');

describe('Carbon Calculation API Endpoint', () => {
  test('POST /api/v1/carbon/calculate - should calculate carbon footprint correctly with typical inputs', async () => {
    const response = await request(app)
      .post('/api/v1/carbon/calculate')
      .send({
        electricity: { value: 100 }, // 100 * 0.82 * 12 = 984
        lpg: { value: 1 }, // 1 * 14.2 * 2.98 * 12 = 507.792
        transport: { value: 200, subtype: 'twoWheeler' }, // 200 * 0.06 * 12 = 144
        food: { subtype: 'vegetarian' }, // 1.2 * 365 = 438
        shopping: { value: 2 }, // 2 * 0.5 * 12 = 12
        waste: { value: 5, subtype: 'landfill' } // 5 * 0.6 * 52 = 156
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('dailyCO2');
    expect(response.body).toHaveProperty('monthlyCO2');
    expect(response.body).toHaveProperty('annualCO2');
    expect(response.body.units).toBe('kg CO2');

    // Expected annual carbon calculation: 984 + 507.792 + 144 + 438 + 12 + 156 = 2241.792 ~ 2241.79
    expect(response.body.annualCO2).toBeCloseTo(2241.79, 1);
  });

  test('POST /api/v1/carbon/calculate - should handle missing optional inputs and use defaults', async () => {
    const response = await request(app)
      .post('/api/v1/carbon/calculate')
      .send({
        // Empty body - food defaults to vegetarian (438)
      });

    expect(response.status).toBe(200);
    expect(response.body.annualCO2).toBe(438); // only default vegetarian diet
  });

  test('POST /api/v1/carbon/calculate - should handle zero/null inputs correctly', async () => {
    const response = await request(app)
      .post('/api/v1/carbon/calculate')
      .send({
        electricity: { value: 0 },
        food: { subtype: 'vegan' } // 0.7 * 365 = 255.5
      });

    expect(response.status).toBe(200);
    expect(response.body.annualCO2).toBe(255.5);
  });
});
