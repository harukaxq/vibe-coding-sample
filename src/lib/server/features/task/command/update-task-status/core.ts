import type { TaskStatus } from '../../core/task';

export type UpdateTaskStatusCommandInput = {
  taskId: string;
  status: TaskStatus;
  userId: string;
};