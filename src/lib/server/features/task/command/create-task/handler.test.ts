import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Task } from '../../core/task';
import type { Project } from '../../../project/core/project';

// vi.hoistedを使用してモックを優先的に読み込む
const { mockCreateTask, mockFindProjectById } = vi.hoisted(() => {
  const mockCreateTask = vi.fn();
  const mockFindProjectById = vi.fn();
  return { mockCreateTask, mockFindProjectById };
});

// Mock modules
vi.mock('../../../../adapter/repository/taskRepository.prisma', () => ({
  TaskRepositoryPrisma: vi.fn(() => ({
    create: mockCreateTask,
  })),
}));

vi.mock('../../../../adapter/repository/projectRepository.prisma', () => ({
  ProjectRepositoryPrisma: vi.fn(() => ({
    findById: mockFindProjectById,
  })),
}));

import { createTask } from './handler';

describe('createTask command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create task with default values', async () => {
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
      title: 'New Task',
      description: null,
      status: 'pending',
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockFindProjectById.mockResolvedValue(mockProject);
    mockCreateTask.mockResolvedValue(mockTask);

    const input = {
      title: 'New Task',
      projectId: 'project1',
      userId: 'user1',
    };

    const result = await createTask(input);

    expect(mockFindProjectById).toHaveBeenCalledWith('project1');
    expect(mockCreateTask).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockTask);
  });

  it('should create task with custom values', async () => {
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
      title: 'Custom Task',
      description: 'Task description',
      status: 'pending',
      estimatedPomodoros: 5,
      completedPomodoros: 0,
      projectId: 'project1',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    mockFindProjectById.mockResolvedValue(mockProject);
    mockCreateTask.mockResolvedValue(mockTask);

    const input = {
      title: 'Custom Task',
      description: 'Task description',
      estimatedPomodoros: 5,
      projectId: 'project1',
      userId: 'user1',
    };

    const result = await createTask(input);

    expect(mockCreateTask).toHaveBeenCalledWith(input);
    expect(result.description).toBe('Task description');
    expect(result.estimatedPomodoros).toBe(5);
  });

  it('should throw error when title is empty', async () => {
    const input = {
      title: '',
      projectId: 'project1',
      userId: 'user1',
    };

    await expect(createTask(input)).rejects.toThrow('タスクのタイトルを入力してください');
    expect(mockFindProjectById).not.toHaveBeenCalled();
  });

  it('should throw error when title is too long', async () => {
    const input = {
      title: 'a'.repeat(201),
      projectId: 'project1',
      userId: 'user1',
    };

    await expect(createTask(input)).rejects.toThrow('タスクのタイトルは200文字以内で入力してください');
    expect(mockFindProjectById).not.toHaveBeenCalled();
  });

  it('should throw error when description is too long', async () => {
    const input = {
      title: 'Test Task',
      description: 'a'.repeat(1001),
      projectId: 'project1',
      userId: 'user1',
    };

    await expect(createTask(input)).rejects.toThrow('タスクの説明は1000文字以内で入力してください');
    expect(mockFindProjectById).not.toHaveBeenCalled();
  });

  it('should throw error when estimated pomodoros is invalid', async () => {
    const input = {
      title: 'Test Task',
      estimatedPomodoros: 0,
      projectId: 'project1',
      userId: 'user1',
    };

    await expect(createTask(input)).rejects.toThrow('予想ポモドーロ数は1〜20の範囲で設定してください');
    expect(mockFindProjectById).not.toHaveBeenCalled();
  });

  it('should throw error when estimated pomodoros exceeds 20', async () => {
    const input = {
      title: 'Test Task',
      estimatedPomodoros: 21,
      projectId: 'project1',
      userId: 'user1',
    };

    await expect(createTask(input)).rejects.toThrow('予想ポモドーロ数は1〜20の範囲で設定してください');
    expect(mockFindProjectById).not.toHaveBeenCalled();
  });

  it('should throw error when project does not exist', async () => {
    mockFindProjectById.mockResolvedValue(null);

    const input = {
      title: 'Test Task',
      projectId: 'nonexistent',
      userId: 'user1',
    };

    await expect(createTask(input)).rejects.toThrow('プロジェクトが見つかりません');
    expect(mockCreateTask).not.toHaveBeenCalled();
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
      title: 'Test Task',
      projectId: 'project1',
      userId: 'user1',
    };

    await expect(createTask(input)).rejects.toThrow('このプロジェクトにタスクを作成する権限がありません');
    expect(mockCreateTask).not.toHaveBeenCalled();
  });
});