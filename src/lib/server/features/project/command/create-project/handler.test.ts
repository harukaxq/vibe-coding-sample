import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Project } from '../../core/project';

// vi.hoistedを使用してモックを優先的に読み込む
const { mockCreate } = vi.hoisted(() => {
  const mockCreate = vi.fn();
  return { mockCreate };
});

// Mock modules
vi.mock('../../../../adapter/repository/projectRepository.prisma', () => ({
  ProjectRepositoryPrisma: vi.fn(() => ({
    create: mockCreate,
  })),
}));

import { createProject } from './handler';

describe('createProject command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create project with default values', async () => {
    const mockProject: Project = {
      id: 'project1',
      name: 'New Project',
      color: '#000000',
      targetPomodoros: 0,
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCreate.mockResolvedValue(mockProject);

    const input = {
      name: 'New Project',
      userId: 'user1',
    };

    const result = await createProject(input);

    expect(mockCreate).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockProject);
  });

  it('should create project with custom values', async () => {
    const mockProject: Project = {
      id: 'project1',
      name: 'Custom Project',
      color: '#FF5733',
      targetPomodoros: 25,
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCreate.mockResolvedValue(mockProject);

    const input = {
      name: 'Custom Project',
      color: '#FF5733',
      targetPomodoros: 25,
      userId: 'user1',
    };

    const result = await createProject(input);

    expect(mockCreate).toHaveBeenCalledWith(input);
    expect(result.color).toBe('#FF5733');
    expect(result.targetPomodoros).toBe(25);
  });

  it('should throw error when name is empty', async () => {
    const input = {
      name: '',
      userId: 'user1',
    };

    await expect(createProject(input)).rejects.toThrow('プロジェクト名を入力してください');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should throw error when name is too long', async () => {
    const input = {
      name: 'a'.repeat(101),
      userId: 'user1',
    };

    await expect(createProject(input)).rejects.toThrow('プロジェクト名は100文字以内で入力してください');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should throw error when color is invalid', async () => {
    const input = {
      name: 'Test Project',
      color: 'invalid-color',
      userId: 'user1',
    };

    await expect(createProject(input)).rejects.toThrow('色コードの形式が正しくありません');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should throw error when target pomodoros is negative', async () => {
    const input = {
      name: 'Test Project',
      targetPomodoros: -1,
      userId: 'user1',
    };

    await expect(createProject(input)).rejects.toThrow('目標ポモドーロ数は0〜100の範囲で設定してください');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should throw error when target pomodoros exceeds 100', async () => {
    const input = {
      name: 'Test Project',
      targetPomodoros: 101,
      userId: 'user1',
    };

    await expect(createProject(input)).rejects.toThrow('目標ポモドーロ数は0〜100の範囲で設定してください');
    expect(mockCreate).not.toHaveBeenCalled();
  });
});