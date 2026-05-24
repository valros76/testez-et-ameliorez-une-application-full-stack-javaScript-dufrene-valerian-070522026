import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { AuthService } from '../../src/services/auth.service';

vi.mock('../../src/services/auth.service');

describe('AuthController (Integration Tests)', () => {
  it('POST /api/auth/login should return 200 and dynamic token on success', async () => {
    const mockAuthResponse = {
      id: 1,
      email: 'yoga@studio.com',
      firstName: 'Yoga',
      lastName: 'Studio',
      admin: true,
      token: 'generated-jwt-string'
    };

    vi.spyOn(AuthService.prototype, 'login').mockResolvedValue(mockAuthResponse);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'yoga@studio.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token', 'generated-jwt-string');
  });
});