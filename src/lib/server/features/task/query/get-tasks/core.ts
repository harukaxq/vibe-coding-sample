import type { TaskStatus } from '../../core/task';

export type GetTasksQueryInput = {
  userId: string;
  projectId?: string;
  status?: TaskStatus;
};

export type TaskSummary = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  estimatedPomodoros: number;
  completedPomodoros: number;
  progress: number;
  projectId: string;
  createdAt: Date;
  completedAt: Date | null;
};