import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export class SessionRepository {
  async findAll() {
    return prisma.session.findMany({
      include: {
        teacher: true,
        participants: {
          include: { user: true },
        },
      },
    });
  }

  async findById(id: number) {
    return prisma.session.findUnique({
      where: { id },
      include: {
        teacher: true,
        participants: {
          include: { user: true },
        },
      },
    });
  }

  async create(data: Prisma.SessionUncheckedCreateInput) {
    return prisma.session.create({
      data,
      include: {
        teacher: true,
        participants: true,
      },
    });
  }

  async update(id: number, data: Prisma.SessionUncheckedUpdateInput) {
    return prisma.session.update({
      where: { id },
      data,
      include: {
        teacher: true,
        participants: {
          include: { user: true },
        },
      },
    });
  }

  async delete(id: number) {
    return prisma.session.delete({ where: { id } });
  }

  async findParticipation(sessionId: number, userId: number) {
    return prisma.sessionParticipation.findUnique({
      where: {
        sessionId_userId: { sessionId, userId },
      },
    });
  }

  async createParticipation(sessionId: number, userId: number) {
    return prisma.sessionParticipation.create({
      data: { sessionId, userId },
    });
  }

  async deleteParticipation(sessionId: number, userId: number) {
    return prisma.sessionParticipation.delete({
      where: {
        sessionId_userId: { sessionId, userId },
      },
    });
  }
}