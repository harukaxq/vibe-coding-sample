export type SessionType = 'work' | 'break';

export type PomodoroSession = Readonly<{
  id: string;
  type: SessionType;
  duration: number; // minutes
  startedAt: Date;
  pausedAt: Date | null;
  completedAt: Date | null;
  taskId: string | null;
  projectId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}>;

export type CreateSessionInput = {
  type?: SessionType;
  duration?: number;
  taskId?: string;
  projectId: string;
  userId: string;
};

export type UpdateSessionInput = {
  pausedAt?: Date;
  completedAt?: Date;
};

export const WORK_DURATION = 25; // minutes
export const BREAK_DURATION = 5; // minutes
export const LONG_BREAK_DURATION = 15; // minutes

export function createPomodoroSession(input: CreateSessionInput): Omit<PomodoroSession, 'id' | 'startedAt' | 'pausedAt' | 'completedAt' | 'createdAt' | 'updatedAt'> {
  return {
    type: input.type ?? 'work',
    duration: input.duration ?? (input.type === 'break' ? BREAK_DURATION : WORK_DURATION),
    taskId: input.taskId ?? null,
    projectId: input.projectId,
    userId: input.userId,
  };
}

export function calculateElapsedMinutes(session: PomodoroSession, currentTime: Date): number {
  const endTime = session.pausedAt ?? session.completedAt ?? currentTime;
  return Math.floor((endTime.getTime() - session.startedAt.getTime()) / (1000 * 60));
}

export function isSessionActive(session: PomodoroSession): boolean {
  return !session.pausedAt && !session.completedAt;
}

export function canPauseSession(session: PomodoroSession): boolean {
  return isSessionActive(session);
}

export function canResumeSession(session: PomodoroSession): boolean {
  return !!session.pausedAt && !session.completedAt;
}

export function isSessionComplete(session: PomodoroSession, currentTime: Date): boolean {
  if (session.completedAt) return true;
  
  const elapsedMinutes = calculateElapsedMinutes(session, currentTime);
  return elapsedMinutes >= session.duration;
}