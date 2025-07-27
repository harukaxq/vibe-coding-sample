import type { GetProjectsQueryInput, ProjectSummary } from './core';
import { ProjectRepositoryPrisma } from '../../../../adapter/repository/projectRepository.prisma';

const projectRepository = new ProjectRepositoryPrisma();

export async function getProjects(input: GetProjectsQueryInput): Promise<ProjectSummary[]> {
  const projects = await projectRepository.findByUserId(input.userId);

  return projects.map(project => ({
    id: project.id,
    name: project.name,
    color: project.color,
    targetPomodoros: project.targetPomodoros,
    createdAt: project.createdAt,
  }));
}