import type { Project, CreateProjectInput, UpdateProjectInput } from '../../../features/project/core/project';

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  update(id: string, input: UpdateProjectInput): Promise<Project>;
  delete(id: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}