import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { UserService } from '../../src/services/user.service';

vi.mock('../../src/services/user.service');
vi.mock('../../src/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.userId = 1;
    next();
  }
}));

describe('UserController (Integration Tests)', () => {
  it('GET /api/user/:id should return 200 and user data', async () => {
    const mockUser = {
      id: 1,
      email: 'yoga@studio.com',
      firstName: 'Yoga',
      lastName: 'Studio',
      password: 'hashedPassword',
      admin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    vi.spyOn(UserService.prototype, 'getUserById').mockResolvedValue(mockUser);

    const response = await request(app)
      .get('/api/user/1')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('email', 'yoga@studio.com');
  });

  it('DELETE /api/user/:id should return 200 on success', async () => {
    vi.spyOn(UserService.prototype, 'deleteUser').mockResolvedValue(undefined);

    const response = await request(app)
      .delete('/api/user/1')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'User deleted successfully');
  });

  it('POST /api/user/promote-admin should return 200 and updated user', async () => {
    const mockUser = {
      id: 1,
      email: 'yoga@studio.com',
      firstName: 'Yoga',
      lastName: 'Studio',
      password: 'hashedPassword',
      admin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    vi.spyOn(UserService.prototype, 'promoteToAdmin').mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/user/promote-admin')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(200);
    expect(response.body.admin).toBe(true);
  });
});