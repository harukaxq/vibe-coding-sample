import { PrismaClient } from '@prisma/client';
import type { TaskRepository } from '../../shared/port/repository/taskRepository';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../../features/task/core/task';

const prisma = new PrismaClient();

export class TaskRepositoryPrisma implements TaskRepository {
  async create(input: CreateTaskInput): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        estimatedPomodoros: input.estimatedPomodoros ?? 1,
        projectId: input.projectId,
        userId: input.userId,
      },
    });
    return task as Task;
  }

  async findById(id: string): Promise<Task | null> {
    const task = await prisma.task.findUnique({
      where: { id },
    });
    return task as Task | null;
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return tasks as Task[];
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return tasks as Task[];
  }

  async findByStatus(userId: string, status: TaskStatus): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { userId, status },
      orderBy: { createdAt: 'desc' },
    });
    return tasks as Task[];
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data: input,
    });
    return task as Task;
  }

  async updateStatus(id: string, status: TaskStatus, completedAt?: Date): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt,
      },
    });
    return task as Task;
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    });
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    await prisma.task.deleteMany({
      where: { projectId },
    });
  }

  async incrementCompletedPomodoros(id: string): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data: {
        completedPomodoros: {
          increment: 1,
        },
      },
    });
    return task as Task;
  }
}