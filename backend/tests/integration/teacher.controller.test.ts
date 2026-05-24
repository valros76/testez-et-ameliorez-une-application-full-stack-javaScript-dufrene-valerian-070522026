import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { TeacherService } from '../../src/services/teacher.service';

vi.mock('../../src/services/teacher.service');
vi.mock('../../src/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.userId = 1;
    next();
  }
}));

describe('TeacherController (Integration Tests)', () => {
  it('GET /api/teacher should return all teachers', async () => {
    const mockTeachers = [{ id: 1, firstName: 'Jane', lastName: 'Smith' }];
    vi.spyOn(TeacherService.prototype, 'getAllTeachers').mockResolvedValue(mockTeachers as any);

    const response = await request(app)
      .get('/api/teacher')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(200);
    expect(response.body[0].firstName).toBe('Jane');
  });

  it('GET /api/teacher/:id should return a specific teacher', async () => {
    const mockTeacher = { id: 1, firstName: 'Jane', lastName: 'Smith' };
    vi.spyOn(TeacherService.prototype, 'getTeacherById').mockResolvedValue(mockTeacher as any);

    const response = await request(app)
      .get('/api/teacher/1')
      .set('Authorization', 'Bearer fake-jwt-token');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
  });
});