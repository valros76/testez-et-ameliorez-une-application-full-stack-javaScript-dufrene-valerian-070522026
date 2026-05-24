import { SessionRepository } from '../repositories/session.repository';
import { UserRepository } from '../repositories/user.repository';
import { TeacherRepository } from '../repositories/teacher.repository';
import { AppError } from '../utils/app-error';

export class SessionService {
  private sessionRepository = new SessionRepository();
  private userRepository = new UserRepository();
  private teacherRepository = new TeacherRepository();

  private formatSession(session: any) {
    return {
      id: session.id,
      name: session.name,
      date: session.date,
      description: session.description,
      teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
      },
      users: session.participants ? session.participants.map((p: any) => p.user.id) : [],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  async getAllSessions() {
    const sessions = await this.sessionRepository.findAll();
    return sessions.map(s => this.formatSession(s));
  }

  async getSessionById(id: number) {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new AppError('Session not found', 404);
    }
    return this.formatSession(session);
  }

  async createSession(userId: number | undefined, body: any) {
    const { name, date, description, teacherId } = body;

    if (!name || !date || !description || !teacherId) {
      throw new AppError('All fields are required', 400);
    }

    const user = await this.userRepository.findById(userId || 0);
    if (!user || !user.admin) {
      throw new AppError('Admin access required', 403);
    }

    const teacher = await this.teacherRepository.findById(teacherId);
    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    const session = await this.sessionRepository.create({
      name,
      date: new Date(date),
      description,
      teacherId,
    });

    return this.formatSession(session);
  }

  async updateSession(id: number, userId: number | undefined, body: any) {
    const { name, date, description, teacherId } = body;

    const user = await this.userRepository.findById(userId || 0);
    if (!user || !user.admin) {
      throw new AppError('Admin access required', 403);
    }

    const existingSession = await this.sessionRepository.findById(id);
    if (!existingSession) {
      throw new AppError('Session not found', 404);
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (date) updateData.date = new Date(date);
    if (description) updateData.description = description;
    if (teacherId) {
      const teacher = await this.teacherRepository.findById(teacherId);
      if (!teacher) {
        throw new AppError('Teacher not found', 404);
      }
      updateData.teacherId = teacherId;
    }

    const updated = await this.sessionRepository.update(id, updateData);
    return this.formatSession(updated);
  }

  async deleteSession(id: number, userId: number | undefined) {
    const user = await this.userRepository.findById(userId || 0);
    if (!user || !user.admin) {
      throw new AppError('Admin access required', 403);
    }

    const existingSession = await this.sessionRepository.findById(id);
    if (!existingSession) {
      throw new AppError('Session not found', 404);
    }

    await this.sessionRepository.delete(id);
  }

  async participate(sessionId: number, participantUserId: number) {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const user = await this.userRepository.findById(participantUserId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const existingParticipation = await this.sessionRepository.findParticipation(sessionId, participantUserId);
    if (existingParticipation) {
      throw new AppError('User already participating in this session', 400);
    }

    await this.sessionRepository.createParticipation(sessionId, participantUserId);
  }

  async unparticipate(sessionId: number, participantUserId: number) {
    const participation = await this.sessionRepository.findParticipation(sessionId, participantUserId);
    if (!participation) {
      throw new AppError('Participation not found', 404);
    }

    await this.sessionRepository.deleteParticipation(sessionId, participantUserId);
  }
}