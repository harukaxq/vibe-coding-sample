import type { PomodoroSession, CreateSessionInput, UpdateSessionInput } from '../../../features/pomodoro-session/core/pomodoroSession';

export interface PomodoroSessionRepository {
  create(input: CreateSessionInput): Promise<PomodoroSession>;
  findById(id: string): Promise<PomodoroSession | null>;
  findByUserId(userId: string, limit?: number): Promise<PomodoroSession[]>;
  findByProjectId(projectId: string): Promise<PomodoroSession[]>;
  findByTaskId(taskId: string): Promise<PomodoroSession[]>;
  findActiveByUserId(userId: string): Promise<PomodoroSession | null>;
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<PomodoroSession[]>;
  update(id: string, input: UpdateSessionInput): Promise<PomodoroSession>;
  complete(id: string, completedAt: Date): Promise<PomodoroSession>;
  pause(id: string, pausedAt: Date): Promise<PomodoroSession>;
  resume(id: string): Promise<PomodoroSession>;
}