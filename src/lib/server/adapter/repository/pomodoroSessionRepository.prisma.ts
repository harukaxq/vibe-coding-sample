import { PrismaClient } from '@prisma/client';
import type { PomodoroSessionRepository } from '../../shared/port/repository/pomodoroSessionRepository';
import type { PomodoroSession, CreateSessionInput, UpdateSessionInput } from '../../features/pomodoro-session/core/pomodoroSession';

const prisma = new PrismaClient();

export class PomodoroSessionRepositoryPrisma implements PomodoroSessionRepository {
  async create(input: CreateSessionInput): Promise<PomodoroSession> {
    const session = await prisma.pomodoroSession.create({
      data: {
        type: input.type ?? 'work',
        duration: input.duration ?? (input.type === 'break' ? 5 : 25),
        taskId: input.taskId,
        projectId: input.projectId,
        userId: input.userId,
      },
    });
    return session as PomodoroSession;
  }

  async findById(id: string): Promise<PomodoroSession | null> {
    const session = await prisma.pomodoroSession.findUnique({
      where: { id },
    });
    return session as PomodoroSession | null;
  }

  async findByUserId(userId: string, limit?: number): Promise<PomodoroSession[]> {
    const sessions = await prisma.pomodoroSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
    return sessions as PomodoroSession[];
  }

  async findByProjectId(projectId: string): Promise<PomodoroSession[]> {
    const sessions = await prisma.pomodoroSession.findMany({
      where: { projectId },
      orderBy: { startedAt: 'desc' },
    });
    return sessions as PomodoroSession[];
  }

  async findByTaskId(taskId: string): Promise<PomodoroSession[]> {
    const sessions = await prisma.pomodoroSession.findMany({
      where: { taskId },
      orderBy: { startedAt: 'desc' },
    });
    return sessions as PomodoroSession[];
  }

  async findActiveByUserId(userId: string): Promise<PomodoroSession | null> {
    const session = await prisma.pomodoroSession.findFirst({
      where: {
        userId,
        completedAt: null,
      },
      orderBy: { startedAt: 'desc' },
    });
    return session as PomodoroSession | null;
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<PomodoroSession[]> {
    const sessions = await prisma.pomodoroSession.findMany({
      where: {
        userId,
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { startedAt: 'asc' },
    });
    return sessions as PomodoroSession[];
  }

  async update(id: string, input: UpdateSessionInput): Promise<PomodoroSession> {
    const session = await prisma.pomodoroSession.update({
      where: { id },
      data: input,
    });
    return session as PomodoroSession;
  }

  async complete(id: string, completedAt: Date): Promise<PomodoroSession> {
    const session = await prisma.pomodoroSession.update({
      where: { id },
      data: { completedAt },
    });
    return session as PomodoroSession;
  }

  async pause(id: string, pausedAt: Date): Promise<PomodoroSession> {
    const session = await prisma.pomodoroSession.update({
      where: { id },
      data: { pausedAt },
    });
    return session as PomodoroSession;
  }

  async resume(id: string): Promise<PomodoroSession> {
    const session = await prisma.pomodoroSession.update({
      where: { id },
      data: { pausedAt: null },
    });
    return session as PomodoroSession;
  }
}