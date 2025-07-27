import { PrismaClient } from '@prisma/client';
import type { ProjectRepository } from '../../shared/port/repository/projectRepository';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../../features/project/core/project';

const prisma = new PrismaClient();

export class ProjectRepositoryPrisma implements ProjectRepository {
  async create(input: CreateProjectInput): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        name: input.name,
        color: input.color ?? '#000000',
        targetPomodoros: input.targetPomodoros ?? 0,
        userId: input.userId,
      },
    });
    return project;
  }

  async findById(id: string): Promise<Project | null> {
    const project = await prisma.project.findUnique({
      where: { id },
    });
    return project;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return projects;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const project = await prisma.project.update({
      where: { id },
      data: input,
    });
    return project;
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({
      where: { id },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    const count = await prisma.project.count({
      where: { userId },
    });
    return count;
  }
}