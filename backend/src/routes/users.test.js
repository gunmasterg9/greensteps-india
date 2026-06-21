const request = require('supertest');
const app = require('../index');

describe('Users Profile API Endpoints', () => {
  const mockToken = 'Bearer mock-token-userprofile@greensteps.in|Profile-Citizen';

  test('GET /api/v1/users/profile - should return current user profile', async () => {
    const response = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', mockToken);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('userprofile@greensteps.in');
    expect(response.body.name).toBe('Profile-Citizen');
  });

  test('PUT /api/v1/users/profile - should update user details successfully', async () => {
    const response = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', mockToken)
      .send({
        name: 'Updated-Profile-Citizen',
        state: 'Maharashtra',
        city: 'Mumbai',
        carbonScore: 1800,
        greenPoints: 250
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/updated successfully/i);
    expect(response.body.user.name).toBe('Updated-Profile-Citizen');
    expect(response.body.user.state).toBe('Maharashtra');
    expect(response.body.user.city).toBe('Mumbai');
    expect(response.body.user.carbonScore).toBe(1800);
    expect(response.body.user.greenPoints).toBe(250);
  });
});
