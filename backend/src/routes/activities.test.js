const request = require('supertest');
const app = require('../index');

describe('Activities API Endpoints', () => {
  const mockToken = 'Bearer mock-token-activity@greensteps.in|Activity-Citizen';

  test('GET /api/v1/activities - should return pre-populated mock activities on first load', async () => {
    const response = await request(app)
      .get('/api/v1/activities')
      .set('Authorization', mockToken);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Should have activities created by ensureMockActivities
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('category');
    expect(response.body[0]).toHaveProperty('co2Emission');
  });

  test('POST /api/v1/activities - should successfully log a new green transport activity and earn points', async () => {
    const response = await request(app)
      .post('/api/v1/activities')
      .set('Authorization', mockToken)
      .send({
        category: 'transport',
        value: 10,
        unit: 'km',
        subtype: 'metro' // green transport gets 25 green points bonus
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toMatch(/logged successfully/i);
    expect(response.body.greenPointsEarned).toBe(25);
    expect(response.body.activity.category).toBe('transport');
    expect(response.body.activity.value).toBe(10);
    expect(response.body.activity.unit).toBe('km');
    // 10 km * 0.015 kg/km (metro factor) = 0.15 kg CO2
    expect(response.body.activity.co2Emission).toBe(0.15);
  });

  test('POST /api/v1/activities - should fail if category or value or unit is missing', async () => {
    const response = await request(app)
      .post('/api/v1/activities')
      .set('Authorization', mockToken)
      .send({
        category: 'transport'
        // missing value & unit
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/provide category, value, and unit/i);
  });
});
