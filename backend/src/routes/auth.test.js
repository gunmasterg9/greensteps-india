const request = require('supertest');
const app = require('../index');

describe('Auth API Endpoints', () => {
  const mockToken = 'Bearer mock-token-test@greensteps.in|Test-Citizen';

  test('GET /api/v1/auth/me - should deny access without token', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/No token/i);
  });

  test('GET /api/v1/auth/me - should allow access and return user profile with valid mock token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', mockToken);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('test@greensteps.in');
    expect(response.body.user.name).toBe('Test-Citizen');
  });

  test('POST /api/v1/auth/login - should sync user profile and return user with token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .set('Authorization', mockToken);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.message).toMatch(/successful/i);
  });
});
