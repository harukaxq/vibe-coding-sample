import type { CreateSessionInput } from '../../core/pomodoroSession';

export type StartSessionCommandInput = {
  taskId?: string;
  projectId: string;
  userId: string;
  type?: 'work' | 'break';
};