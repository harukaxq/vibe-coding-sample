import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task } from '../../core/task';

// vi.hoistedを使用してモックを優先的に読み込む
const { mockFindById, mockUpdateStatus } = vi.hoisted(() => {
  const mockFindById = vi.fn();
  const mockUpdateStatus = vi.fn();
  return { mockFindById, mockUpdateStatus };
});

// Mock modules
vi.mock('../../../../adapter/repository/taskRepository.prisma', () => ({
  TaskRepositoryPrisma: vi.fn(() => ({
    findById: mockFindById,
    updateStatus: mockUpdateStatus,
  })),
}));

import { toggleTaskStatus } from './handler';

describe('toggleTaskStatus command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle pending task to completed', async () => {
    const pendingTask: Task = {
      id: 'task1',
      title: 'Test Task',
      description: null,
      status: 'pending',
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    const completedTask: Task = {
      ...pendingTask,
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindById.mockResolvedValue(pendingTask);
    mockUpdateStatus.mockResolvedValue(completedTask);

    const input = {
      taskId: 'task1',
      userId: 'user1',
    };

    const result = await toggleTaskStatus(input);

    expect(mockFindById).toHaveBeenCalledWith('task1');
    expect(mockUpdateStatus).toHaveBeenCalledWith('task1', 'completed', expect.any(Date));
    expect(result.status).toBe('completed');
    expect(result.completedAt).not.toBeNull();
  });

  it('should toggle completed task to pending', async () => {
    const completedTask: Task = {
      id: 'task1',
      title: 'Test Task',
      description: null,
      status: 'completed',
      estimatedPomodoros: 2,
      completedPomodoros: 2,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
    };

    const pendingTask: Task = {
      ...completedTask,
      status: 'pending',
      completedAt: null,
      updatedAt: new Date(),
    };

    mockFindById.mockResolvedValue(completedTask);
    mockUpdateStatus.mockResolvedValue(pendingTask);

    const input = {
      taskId: 'task1',
      userId: 'user1',
    };

    const result = await toggleTaskStatus(input);

    expect(mockUpdateStatus).toHaveBeenCalledWith('task1', 'pending', undefined);
    expect(result.status).toBe('pending');
    expect(result.completedAt).toBeNull();
  });

  it('should throw error when task does not exist', async () => {
    mockFindById.mockResolvedValue(null);

    const input = {
      taskId: 'nonexistent',
      userId: 'user1',
    };

    await expect(toggleTaskStatus(input)).rejects.toThrow('タスクが見つかりません');
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('should throw error when user does not own task', async () => {
    const task: Task = {
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

    mockFindById.mockResolvedValue(task);

    const input = {
      taskId: 'task1',
      userId: 'user1',
    };

    await expect(toggleTaskStatus(input)).rejects.toThrow('このタスクを更新する権限がありません');
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('should throw error when trying to toggle in_progress task', async () => {
    const inProgressTask: Task = {
      id: 'task1',
      title: 'Test Task',
      description: null,
      status: 'in_progress',
      estimatedPomodoros: 2,
      completedPomodoros: 1,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockFindById.mockResolvedValue(inProgressTask);

    const input = {
      taskId: 'task1',
      userId: 'user1',
    };

    await expect(toggleTaskStatus(input)).rejects.toThrow('進行中のタスクは直接完了にできません');
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('should throw error when trying to toggle cancelled task', async () => {
    const cancelledTask: Task = {
      id: 'task1',
      title: 'Test Task',
      description: null,
      status: 'cancelled',
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockFindById.mockResolvedValue(cancelledTask);

    const input = {
      taskId: 'task1',
      userId: 'user1',
    };

    await expect(toggleTaskStatus(input)).rejects.toThrow('進行中のタスクは直接完了にできません');
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });
});