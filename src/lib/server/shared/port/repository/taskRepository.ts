import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../../../features/task/core/task';

export interface TaskRepository {
  create(input: CreateTaskInput): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByUserId(userId: string): Promise<Task[]>;
  findByProjectId(projectId: string): Promise<Task[]>;
  findByStatus(userId: string, status: TaskStatus): Promise<Task[]>;
  update(id: string, input: UpdateTaskInput): Promise<Task>;
  updateStatus(id: string, status: TaskStatus, completedAt?: Date): Promise<Task>;
  delete(id: string): Promise<void>;
  deleteByProjectId(projectId: string): Promise<void>;
  incrementCompletedPomodoros(id: string): Promise<Task>;
}