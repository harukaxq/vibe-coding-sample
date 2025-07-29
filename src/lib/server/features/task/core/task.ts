export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type Task = Readonly<{
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  estimatedPomodoros: number;
  completedPomodoros: number;
  projectId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}>;

export type CreateTaskInput = {
  title: string;
  description?: string;
  estimatedPomodoros?: number;
  projectId: string;
  userId: string;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  estimatedPomodoros?: number;
  completedPomodoros?: number;
};

export function createTask(input: CreateTaskInput): Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'> {
  return {
    title: input.title,
    description: input.description ?? null,
    status: 'pending',
    estimatedPomodoros: input.estimatedPomodoros ?? 1,
    completedPomodoros: 0,
    projectId: input.projectId,
    userId: input.userId,
  };
}

export function isValidEstimatedPomodoros(count: number): boolean {
  return count >= 1 && count <= 20; // 1〜20ポモドーロまで
}

export function calculateProgress(task: Task): number {
  if (task.estimatedPomodoros === 0) return 0;
  return Math.min(100, Math.round((task.completedPomodoros / task.estimatedPomodoros) * 100));
}