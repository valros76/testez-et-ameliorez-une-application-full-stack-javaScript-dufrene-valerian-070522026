import { describe, it, expect, vi } from 'vitest';
import { UserRepository } from '../../src/repositories/user.repository';
import { TeacherRepository } from '../../src/repositories/teacher.repository';
import { SessionRepository } from '../../src/repositories/session.repository';

vi.mock('../../src/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, email: 'test@test.com' }),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      delete: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 })
    },
    teacher: {
      findUnique: vi.fn().mockResolvedValue({ id: 1 }),
      findMany: vi.fn().mockResolvedValue([])
    },
    session: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, users: [] }),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      delete: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null)
    },
    sessionParticipation: {
      findUnique: vi.fn().mockResolvedValue({ sessionId: 1, userId: 1 }),
      create: vi.fn().mockResolvedValue({ sessionId: 1, userId: 1 }),
      delete: vi.fn().mockResolvedValue({ sessionId: 1, userId: 1 })
    }
  }
}));

describe('Repositories Full Line Coverage', () => {
  it('should cover all UserRepository methods', async () => {
    const repo = new UserRepository();
    await repo.findByEmail('test@test.com');
    await repo.findById(1);
    await repo.create({ email: 't@t.com', password: '123', firstName: 'a', lastName: 'b', admin: false });
  });

  it('should cover all TeacherRepository methods', async () => {
    const repo = new TeacherRepository();
    await repo.findAll();
    await repo.findById(1);
  });

  it('should cover all SessionRepository methods', async () => {
    const repo = new SessionRepository();
    await repo.findAll();
    await repo.findById(1);
    await repo.create({ name: 'Yoga', date: new Date(), description: 'Zen', teacherId: 1 });
    await repo.update(1, { name: 'Yoga Plus' });
    await repo.findParticipation(1, 1);
    await repo.delete(1);
    await repo.deleteParticipation(1, 1);
  });
});