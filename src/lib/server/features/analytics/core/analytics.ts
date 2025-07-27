import type { PomodoroSession } from '../../pomodoro-session/core/pomodoroSession';
import type { Project } from '../../project/core/project';
import type { Task } from '../../task/core/task';

export type DailyStats = {
  date: Date;
  completedPomodoros: number;
  totalMinutes: number;
  projectBreakdown: Array<{
    projectId: string;
    projectName: string;
    completedPomodoros: number;
    totalMinutes: number;
  }>;
};

export type ProjectProgress = {
  projectId: string;
  projectName: string;
  targetPomodoros: number;
  completedPomodoros: number;
  progressPercentage: number;
  remainingPomodoros: number;
};

export type TimelineEntry = {
  sessionId: string;
  type: 'work' | 'break';
  projectName: string;
  taskTitle: string | null;
  startedAt: Date;
  completedAt: Date | null;
  duration: number;
};

export function calculateDailyStats(sessions: PomodoroSession[], projects: Project[], date: Date): DailyStats {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const daySessions = sessions.filter(s => 
    s.completedAt && 
    s.completedAt >= startOfDay && 
    s.completedAt <= endOfDay &&
    s.type === 'work'
  );

  const projectMap = new Map(projects.map(p => [p.id, p]));
  const projectStats = new Map<string, { count: number; minutes: number }>();

  let totalPomodoros = 0;
  let totalMinutes = 0;

  for (const session of daySessions) {
    totalPomodoros++;
    totalMinutes += session.duration;

    const current = projectStats.get(session.projectId) ?? { count: 0, minutes: 0 };
    projectStats.set(session.projectId, {
      count: current.count + 1,
      minutes: current.minutes + session.duration,
    });
  }

  const projectBreakdown = Array.from(projectStats.entries()).map(([projectId, stats]) => ({
    projectId,
    projectName: projectMap.get(projectId)?.name ?? 'Unknown',
    completedPomodoros: stats.count,
    totalMinutes: stats.minutes,
  }));

  return {
    date,
    completedPomodoros: totalPomodoros,
    totalMinutes,
    projectBreakdown,
  };
}

export function calculateProjectProgress(
  project: Project,
  completedSessions: PomodoroSession[]
): ProjectProgress {
  const projectSessions = completedSessions.filter(
    s => s.projectId === project.id && s.type === 'work' && s.completedAt
  );

  const completedPomodoros = projectSessions.length;
  const progressPercentage = project.targetPomodoros > 0
    ? Math.min(100, Math.round((completedPomodoros / project.targetPomodoros) * 100))
    : 0;

  return {
    projectId: project.id,
    projectName: project.name,
    targetPomodoros: project.targetPomodoros,
    completedPomodoros,
    progressPercentage,
    remainingPomodoros: Math.max(0, project.targetPomodoros - completedPomodoros),
  };
}

export function createTimelineEntry(
  session: PomodoroSession,
  project: Project,
  task: Task | null
): TimelineEntry {
  return {
    sessionId: session.id,
    type: session.type,
    projectName: project.name,
    taskTitle: task?.title ?? null,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    duration: session.duration,
  };
}