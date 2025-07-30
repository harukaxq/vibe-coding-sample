import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PomodoroSession } from '../../core/pomodoroSession';

// vi.hoistedを使用してモックを優先的に読み込む
const { mockFindSessionById, mockCompleteSession, mockIncrementCompletedPomodoros } = vi.hoisted(() => {
  const mockFindSessionById = vi.fn();
  const mockCompleteSession = vi.fn();
  const mockIncrementCompletedPomodoros = vi.fn();
  return { mockFindSessionById, mockCompleteSession, mockIncrementCompletedPomodoros };
});

// Mock modules
vi.mock('../../../../adapter/repository/pomodoroSessionRepository.prisma', () => ({
  PomodoroSessionRepositoryPrisma: vi.fn(() => ({
    findById: mockFindSessionById,
    complete: mockCompleteSession,
  })),
}));

vi.mock('../../../../adapter/repository/taskRepository.prisma', () => ({
  TaskRepositoryPrisma: vi.fn(() => ({
    incrementCompletedPomodoros: mockIncrementCompletedPomodoros,
  })),
}));

import { completeSession } from './handler';

describe('completeSession command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete work session without task', async () => {
    const activeSession: PomodoroSession = {
      id: 'session1',
      type: 'work',
      duration: 25,
      startedAt: new Date('2025-07-26T10:00:00Z'),
      pausedAt: null,
      completedAt: null,
      taskId: null,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date('2025-07-26T10:00:00Z'),
      updatedAt: new Date('2025-07-26T10:00:00Z'),
    };

    const completedSession: PomodoroSession = {
      ...activeSession,
      completedAt: new Date('2025-07-26T10:25:00Z'),
      updatedAt: new Date('2025-07-26T10:25:00Z'),
    };

    mockFindSessionById.mockResolvedValue(activeSession);
    mockCompleteSession.mockResolvedValue(completedSession);

    const input = {
      sessionId: 'session1',
      userId: 'user1',
    };

    const result = await completeSession(input);

    expect(mockFindSessionById).toHaveBeenCalledWith('session1');
    expect(mockCompleteSession).toHaveBeenCalledWith('session1', expect.any(Date));
    expect(mockIncrementCompletedPomodoros).not.toHaveBeenCalled();
    expect(result).toEqual(completedSession);
  });

  it('should complete work session with task and increment pomodoros', async () => {
    const activeSession: PomodoroSession = {
      id: 'session1',
      type: 'work',
      duration: 25,
      startedAt: new Date('2025-07-26T10:00:00Z'),
      pausedAt: null,
      completedAt: null,
      taskId: 'task1',
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date('2025-07-26T10:00:00Z'),
      updatedAt: new Date('2025-07-26T10:00:00Z'),
    };

    const completedSession: PomodoroSession = {
      ...activeSession,
      completedAt: new Date('2025-07-26T10:25:00Z'),
      updatedAt: new Date('2025-07-26T10:25:00Z'),
    };

    mockFindSessionById.mockResolvedValue(activeSession);
    mockCompleteSession.mockResolvedValue(completedSession);
    mockIncrementCompletedPomodoros.mockResolvedValue(undefined);

    const input = {
      sessionId: 'session1',
      userId: 'user1',
    };

    const result = await completeSession(input);

    expect(mockIncrementCompletedPomodoros).toHaveBeenCalledWith('task1');
    expect(result).toEqual(completedSession);
  });

  it('should complete break session without incrementing pomodoros', async () => {
    const activeSession: PomodoroSession = {
      id: 'session1',
      type: 'break',
      duration: 5,
      startedAt: new Date('2025-07-26T10:25:00Z'),
      pausedAt: null,
      completedAt: null,
      taskId: 'task1',
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date('2025-07-26T10:25:00Z'),
      updatedAt: new Date('2025-07-26T10:25:00Z'),
    };

    const completedSession: PomodoroSession = {
      ...activeSession,
      completedAt: new Date('2025-07-26T10:30:00Z'),
      updatedAt: new Date('2025-07-26T10:30:00Z'),
    };

    mockFindSessionById.mockResolvedValue(activeSession);
    mockCompleteSession.mockResolvedValue(completedSession);

    const input = {
      sessionId: 'session1',
      userId: 'user1',
    };

    const result = await completeSession(input);

    expect(mockIncrementCompletedPomodoros).not.toHaveBeenCalled();
    expect(result).toEqual(completedSession);
  });

  it('should throw error when session does not exist', async () => {
    mockFindSessionById.mockResolvedValue(null);

    const input = {
      sessionId: 'nonexistent',
      userId: 'user1',
    };

    await expect(completeSession(input)).rejects.toThrow('セッションが見つかりません');
    expect(mockCompleteSession).not.toHaveBeenCalled();
  });

  it('should throw error when user does not own session', async () => {
    const session: PomodoroSession = {
      id: 'session1',
      type: 'work',
      duration: 25,
      startedAt: new Date(),
      pausedAt: null,
      completedAt: null,
      taskId: null,
      projectId: 'project1',
      userId: 'user2', // Different user
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindSessionById.mockResolvedValue(session);

    const input = {
      sessionId: 'session1',
      userId: 'user1',
    };

    await expect(completeSession(input)).rejects.toThrow('このセッションを完了する権限がありません');
    expect(mockCompleteSession).not.toHaveBeenCalled();
  });

  it('should throw error when session is already completed', async () => {
    const completedSession: PomodoroSession = {
      id: 'session1',
      type: 'work',
      duration: 25,
      startedAt: new Date('2025-07-26T10:00:00Z'),
      pausedAt: null,
      completedAt: new Date('2025-07-26T10:25:00Z'),
      taskId: null,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date('2025-07-26T10:00:00Z'),
      updatedAt: new Date('2025-07-26T10:25:00Z'),
    };

    mockFindSessionById.mockResolvedValue(completedSession);

    const input = {
      sessionId: 'session1',
      userId: 'user1',
    };

    await expect(completeSession(input)).rejects.toThrow('このセッションは既に完了しています');
    expect(mockCompleteSession).not.toHaveBeenCalled();
  });
});