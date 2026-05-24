import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { SessionService } from '../../src/services/session.service';

vi.mock('../../src/services/session.service');
vi.mock('../../src/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.userId = 1;
    next();
  }
}));

describe('SessionController (Integration Tests)', () => {
  it('GET /api/session should return a list of formatted sessions', async () => {
    const mockSessions = [
      {
        id: 1,
        name: 'Ashtanga Morning',
        date: new Date().toISOString(),
        description: 'Dynamic flow',
        teacher: { id: 1, firstName: 'John', lastName: 'Doe' },
        users: [2, 3],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    vi.spyOn(SessionService.prototype, 'getAllSessions').mockResolvedValue(mockSessions as any);

    const response = await request(app)
      .get('/api/session')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].name).toBe('Ashtanga Morning');
  });

  it('GET /api/session/:id should return a specific session', async () => {
    const mockSession = {
      id: 1,
      name: 'Ashtanga Morning',
      date: new Date().toISOString(),
      description: 'Dynamic flow',
      teacher: { id: 1, firstName: 'John', lastName: 'Doe' },
      users: [2, 3],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vi.spyOn(SessionService.prototype, 'getSessionById').mockResolvedValue(mockSession as any);

    const response = await request(app)
      .get('/api/session/1')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
  });

  it('POST /api/session should create a session and return 201', async () => {
    const mockSession = { id: 1, name: 'Hatha' };
    vi.spyOn(SessionService.prototype, 'createSession').mockResolvedValue(mockSession as any);

    const response = await request(app)
      .post('/api/session')
      .send({ name: 'Hatha', date: '2026-05-24', description: 'Zen', teacherId: 1 })
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(201);
  });

  it('PUT /api/session/:id should update and return 200', async () => {
    const mockSession = { id: 1, name: 'Hatha Updated' };
    vi.spyOn(SessionService.prototype, 'updateSession').mockResolvedValue(mockSession as any);

    const response = await request(app)
      .put('/api/session/1')
      .send({ name: 'Hatha Updated' })
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(200);
  });

  it('DELETE /api/session/:id should return 200', async () => {
    vi.spyOn(SessionService.prototype, 'deleteSession').mockResolvedValue(undefined);

    const response = await request(app)
      .delete('/api/session/1')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(200);
  });

  it('POST /api/session/:id/participate/:userId should return 200 on success', async () => {
    vi.spyOn(SessionService.prototype, 'participate').mockResolvedValue(undefined);

    const response = await request(app)
      .post('/api/session/1/participate/2')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(200);
  });

  it('DELETE /api/session/:id/participate/:userId should return 200 on success', async () => {
    vi.spyOn(SessionService.prototype, 'unparticipate').mockResolvedValue(undefined);

    const response = await request(app)
      .delete('/api/session/1/participate/2')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(200);
  });
});