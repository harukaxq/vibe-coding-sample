import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PomodoroSession } from '../../core/pomodoroSession';
import type { Project } from '../../../project/core/project';
import type { Task } from '../../../task/core/task';

// vi.hoistedを使用してモックを優先的に読み込む
const { mockFindActiveByUserId, mockCreateSession, mockFindProjectById, mockFindTaskById } = vi.hoisted(() => {
  const mockFindActiveByUserId = vi.fn();
  const mockCreateSession = vi.fn();
  const mockFindProjectById = vi.fn();
  const mockFindTaskById = vi.fn();
  return { mockFindActiveByUserId, mockCreateSession, mockFindProjectById, mockFindTaskById };
});

// Mock modules
vi.mock('../../../../adapter/repository/pomodoroSessionRepository.prisma', () => ({
  PomodoroSessionRepositoryPrisma: vi.fn(() => ({
    findActiveByUserId: mockFindActiveByUserId,
    create: mockCreateSession,
  })),
}));

vi.mock('../../../../adapter/repository/projectRepository.prisma', () => ({
  ProjectRepositoryPrisma: vi.fn(() => ({
    findById: mockFindProjectById,
  })),
}));

vi.mock('../../../../adapter/repository/taskRepository.prisma', () => ({
  TaskRepositoryPrisma: vi.fn(() => ({
    findById: mockFindTaskById,
  })),
}));

import { startSession } from './handler';

describe('startSession command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start work session without task', async () => {
    const mockProject: Project = {
      id: 'project1',
      name: 'Test Project',
      color: '#FF0000',
      targetPomodoros: 10,
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSession: PomodoroSession = {
      id: 'session1',
      type: 'work',
      duration: 25,
      startedAt: new Date(),
      pausedAt: null,
      completedAt: null,
      taskId: null,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindProjectById.mockResolvedValue(mockProject);
    mockFindActiveByUserId.mockResolvedValue(null);
    mockCreateSession.mockResolvedValue(mockSession);

    const input = {
      projectId: 'project1',
      userId: 'user1',
    };

    const result = await startSession(input);

    expect(mockFindProjectById).toHaveBeenCalledWith('project1');
    expect(mockFindActiveByUserId).toHaveBeenCalledWith('user1');
    expect(mockCreateSession).toHaveBeenCalledWith({
      type: 'work',
      taskId: undefined,
      projectId: 'project1',
      userId: 'user1',
    });
    expect(result).toEqual(mockSession);
  });

  it('should start break session with type specified', async () => {
    const mockProject: Project = {
      id: 'project1',
      name: 'Test Project',
      color: '#FF0000',
      targetPomodoros: 10,
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSession: PomodoroSession = {
      id: 'session1',
      type: 'break',
      duration: 5,
      startedAt: new Date(),
      pausedAt: null,
      completedAt: null,
      taskId: null,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindProjectById.mockResolvedValue(mockProject);
    mockFindActiveByUserId.mockResolvedValue(null);
    mockCreateSession.mockResolvedValue(mockSession);

    const input = {
      type: 'break' as const,
      projectId: 'project1',
      userId: 'user1',
    };

    const result = await startSession(input);

    expect(mockCreateSession).toHaveBeenCalledWith({
      type: 'break',
      taskId: undefined,
      projectId: 'project1',
      userId: 'user1',
    });
    expect(result.type).toBe('break');
  });

  it('should start session with task', async () => {
    const mockProject: Project = {
      id: 'project1',
      name: 'Test Project',
      color: '#FF0000',
      targetPomodoros: 10,
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockTask: Task = {
      id: 'task1',
      title: 'Test Task',
      description: null,
      status: 'in_progress',
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    const mockSession: PomodoroSession = {
      id: 'session1',
      type: 'work',
      duration: 25,
      startedAt: new Date(),
      pausedAt: null,
      completedAt: null,
      taskId: 'task1',
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindProjectById.mockResolvedValue(mockProject);
    mockFindTaskById.mockResolvedValue(mockTask);
    mockFindActiveByUserId.mockResolvedValue(null);
    mockCreateSession.mockResolvedValue(mockSession);

    const input = {
      taskId: 'task1',
      projectId: 'project1',
      userId: 'user1',
    };

    const result = await startSession(input);

    expect(mockFindTaskById).toHaveBeenCalledWith('task1');
    expect(result.taskId).toBe('task1');
  });

  it('should throw error when project does not exist', async () => {
    mockFindProjectById.mockResolvedValue(null);

    const input = {
      projectId: 'nonexistent',
      userId: 'user1',
    };

    await expect(startSession(input)).rejects.toThrow('プロジェクトが見つかりません');
    expect(mockFindActiveByUserId).not.toHaveBeenCalled();
  });

  it('should throw error when user does not own project', async () => {
    const mockProject: Project = {
      id: 'project1',
      name: 'Test Project',
      color: '#FF0000',
      targetPomodoros: 10,
      userId: 'user2', // Different user
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindProjectById.mockResolvedValue(mockProject);

    const input = {
      projectId: 'project1',
      userId: 'user1',
    };

    await expect(startSession(input)).rejects.toThrow('このプロジェクトでセッションを開始する権限がありません');
  });

  it('should throw error when task does not exist', async () => {
    const mockProject: Project = {
      id: 'project1',
      name: 'Test Project',
      color: '#FF0000',
      targetPomodoros: 10,
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindProjectById.mockResolvedValue(mockProject);
    mockFindTaskById.mockResolvedValue(null);

    const input = {
      taskId: 'nonexistent',
      projectId: 'project1',
      userId: 'user1',
    };

    await expect(startSession(input)).rejects.toThrow('タスクが見つかりません');
  });

  it('should throw error when user does not own task', async () => {
    const mockProject: Project = {
      id: 'project1',
      name: 'Test Project',
      color: '#FF0000',
      targetPomodoros: 10,
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockTask: Task = {
      id: 'task1',
      title: 'Test Task',
      description: null,
      status: 'pending',
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      projectId: 'project1',
      userId: 'user2', // Different user
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockFindProjectById.mockResolvedValue(mockProject);
    mockFindTaskById.mockResolvedValue(mockTask);

    const input = {
      taskId: 'task1',
      projectId: 'project1',
      userId: 'user1',
    };

    await expect(startSession(input)).rejects.toThrow('このタスクでセッションを開始する権限がありません');
  });

  it('should throw error when task and project do not match', async () => {
    const mockProject: Project = {
      id: 'project1',
      name: 'Test Project',
      color: '#FF0000',
      targetPomodoros: 10,
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockTask: Task = {
      id: 'task1',
      title: 'Test Task',
      description: null,
      status: 'pending',
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      projectId: 'project2', // Different project
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockFindProjectById.mockResolvedValue(mockProject);
    mockFindTaskById.mockResolvedValue(mockTask);

    const input = {
      taskId: 'task1',
      projectId: 'project1',
      userId: 'user1',
    };

    await expect(startSession(input)).rejects.toThrow('タスクとプロジェクトが一致しません');
  });

  it('should throw error when active session exists', async () => {
    const mockProject: Project = {
      id: 'project1',
      name: 'Test Project',
      color: '#FF0000',
      targetPomodoros: 10,
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingSession: PomodoroSession = {
      id: 'existing1',
      type: 'work',
      duration: 25,
      startedAt: new Date(),
      pausedAt: null,
      completedAt: null,
      taskId: null,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindProjectById.mockResolvedValue(mockProject);
    mockFindActiveByUserId.mockResolvedValue(existingSession);

    const input = {
      projectId: 'project1',
      userId: 'user1',
    };

    await expect(startSession(input)).rejects.toThrow('既にアクティブなセッションがあります');
    expect(mockCreateSession).not.toHaveBeenCalled();
  });
});