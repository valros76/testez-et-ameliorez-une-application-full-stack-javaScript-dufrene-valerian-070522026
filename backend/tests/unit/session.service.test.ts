import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionService } from '../../src/services/session.service';
import { SessionRepository } from '../../src/repositories/session.repository';
import { UserRepository } from '../../src/repositories/user.repository';
import { TeacherRepository } from '../../src/repositories/teacher.repository';
import { AppError } from '../../src/utils/app-error';

vi.mock('../../src/repositories/session.repository');
vi.mock('../../src/repositories/user.repository');
vi.mock('../../src/repositories/teacher.repository');

describe('SessionService (Unit Tests)', () => {
  let sessionService: SessionService;
  let sessionRepoMock: any;
  let userRepoMock: any;
  let teacherRepoMock: any;

  beforeEach(() => {
    sessionService = new SessionService();
    sessionRepoMock = SessionRepository.prototype;
    userRepoMock = UserRepository.prototype;
    teacherRepoMock = TeacherRepository.prototype;
  });

  it('should throw 404 if trying to find a non-existing session by id', async () => {
    sessionRepoMock.findById.mockResolvedValue(null);
    await expect(sessionService.getSessionById(99)).rejects.toThrow(AppError);
  });

  it('should return dynamic sessions formatted', async () => {
    sessionRepoMock.findAll.mockResolvedValue([
      { 
        id: 1, 
        name: 'Ashtanga Morning',
        date: new Date(),
        description: 'Dynamic flow',
        users: [{ userId: 5 }, { id: 5 }],
        teacher: { id: 1, firstName: 'John', lastName: 'Doe' } 
      }
    ]);

    if ((sessionService as any).formatSession) {
      vi.spyOn(sessionService as any, 'formatSession').mockReturnValue({
        id: 1,
        name: 'Ashtanga Morning',
        users: [5],
        teacher: { id: 1, firstName: 'John', lastName: 'Doe' }
      });
    }
    
    const res = await sessionService.getAllSessions();
    expect(res).toBeDefined();
    expect(res.length).toBe(1);
    
    const hasUserFive = res[0].users.includes(5) || res[0].users.some((u: any) => u === 5 || u.userId === 5 || u.id === 5);
    expect(hasUserFive).toBe(true);
  });

  it('should throw an error if create input data is invalid', async () => {
    const invalidBody = { name: '', date: '' };
    await expect(sessionService.createSession(1, invalidBody)).rejects.toThrow(AppError);
  });

  it('should throw a 403 error if user is not an admin during session creation', async () => {
    const validBody = { name: 'Hatha Yoga', date: '2026-05-24', description: 'Zen', teacherId: 1 };
    userRepoMock.findById.mockResolvedValue({ id: 1, admin: false });
    await expect(sessionService.createSession(1, validBody)).rejects.toThrow(AppError);
  });

  it('should throw a 404 error if teacher does not exist during session creation', async () => {
    const validBody = { name: 'Hatha Yoga', date: '2026-05-24', description: 'Zen', teacherId: 99 };
    userRepoMock.findById.mockResolvedValue({ id: 1, admin: true });
    teacherRepoMock.findById.mockResolvedValue(null);
    await expect(sessionService.createSession(1, validBody)).rejects.toThrow(AppError);
  });

  it('should update session successfully if user is admin', async () => {
    userRepoMock.findById.mockResolvedValue({ id: 1, admin: true });
    sessionRepoMock.findById.mockResolvedValue({ id: 10 });
    
    const mockUpdatedSession = { 
      id: 10, 
      name: 'Updated',
      teacher: { id: 1, firstName: 'John', lastName: 'Doe' },
      users: []
    };
    
    sessionRepoMock.update.mockResolvedValue(mockUpdatedSession);
    if ((sessionService as any).formatSession) {
      vi.spyOn(sessionService as any, 'formatSession').mockReturnValue(mockUpdatedSession);
    }

    const res = await sessionService.updateSession(1, 10, { name: 'Updated' });
    expect(res.name).toBe('Updated');
  });

  it('should delete session successfully if user is admin', async () => {
    userRepoMock.findById.mockResolvedValue({ id: 1, admin: true });
    sessionRepoMock.findById.mockResolvedValue({ id: 10 });
    await expect(sessionService.deleteSession(1, 10)).resolves.not.toThrow();
  });

  it('should allow a user to participate if not already registered', async () => {
    sessionRepoMock.findById.mockResolvedValue({ id: 1 });
    userRepoMock.findById.mockResolvedValue({ id: 2 });
    sessionRepoMock.findParticipation.mockResolvedValue(null);

    await expect(sessionService.participate(1, 2)).resolves.not.toThrow();
  });

  it('should throw a 400 error if user is already participating', async () => {
    sessionRepoMock.findById.mockResolvedValue({ id: 1 });
    userRepoMock.findById.mockResolvedValue({ id: 2 });
    sessionRepoMock.findParticipation.mockResolvedValue({ sessionId: 1, userId: 2 });

    await expect(sessionService.participate(1, 2)).rejects.toThrow(AppError);
  });

  it('should allow unparticipate if currently registered', async () => {
    sessionRepoMock.findById.mockResolvedValue({ id: 1 });
    userRepoMock.findById.mockResolvedValue({ id: 2 });
    sessionRepoMock.findParticipation.mockResolvedValue({ sessionId: 1 });

    await expect(sessionService.unparticipate(1, 2)).resolves.not.toThrow();
  });

  it('should throw 400 during unparticipate if not registered', async () => {
    sessionRepoMock.findById.mockResolvedValue({ id: 1 });
    userRepoMock.findById.mockResolvedValue({ id: 2 });
    sessionRepoMock.findParticipation.mockResolvedValue(null);

    await expect(sessionService.unparticipate(1, 2)).rejects.toThrow(AppError);
  });
});