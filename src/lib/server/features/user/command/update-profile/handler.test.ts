import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '../../core/user';

// vi.hoistedを使用してモックを優先的に読み込む
const { mockFindById, mockExists, mockUpdate } = vi.hoisted(() => {
  const mockFindById = vi.fn();
  const mockExists = vi.fn();
  const mockUpdate = vi.fn();
  return { mockFindById, mockExists, mockUpdate };
});

// Mock modules
vi.mock('../../../../adapter/repository/userRepository.prisma', () => ({
  UserRepositoryPrisma: vi.fn(() => ({
    findById: mockFindById,
    exists: mockExists,
    update: mockUpdate,
  })),
}));

import { updateProfile } from './handler';

describe('updateProfile command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user name only', async () => {
    const existingUser: User = {
      id: 'user1',
      email: 'test@example.com',
      hashedPassword: 'hashed_password',
      name: 'Old Name',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedUser: User = {
      ...existingUser,
      name: 'New Name',
      updatedAt: new Date(),
    };

    mockFindById.mockResolvedValue(existingUser);
    mockUpdate.mockResolvedValue(updatedUser);

    const input = {
      userId: 'user1',
      updates: {
        name: 'New Name',
      },
    };

    const result = await updateProfile(input);

    expect(mockFindById).toHaveBeenCalledWith('user1');
    expect(mockExists).not.toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith('user1', { name: 'New Name' });
    expect(result.name).toBe('New Name');
  });

  it('should update email when new email is valid and not taken', async () => {
    const existingUser: User = {
      id: 'user1',
      email: 'old@example.com',
      hashedPassword: 'hashed_password',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedUser: User = {
      ...existingUser,
      email: 'new@example.com',
      updatedAt: new Date(),
    };

    mockFindById.mockResolvedValue(existingUser);
    mockExists.mockResolvedValue(false);
    mockUpdate.mockResolvedValue(updatedUser);

    const input = {
      userId: 'user1',
      updates: {
        email: 'new@example.com',
      },
    };

    const result = await updateProfile(input);

    expect(mockExists).toHaveBeenCalledWith('new@example.com');
    expect(mockUpdate).toHaveBeenCalledWith('user1', { email: 'new@example.com' });
    expect(result.email).toBe('new@example.com');
  });

  it('should update both name and email', async () => {
    const existingUser: User = {
      id: 'user1',
      email: 'old@example.com',
      hashedPassword: 'hashed_password',
      name: 'Old Name',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedUser: User = {
      ...existingUser,
      email: 'new@example.com',
      name: 'New Name',
      updatedAt: new Date(),
    };

    mockFindById.mockResolvedValue(existingUser);
    mockExists.mockResolvedValue(false);
    mockUpdate.mockResolvedValue(updatedUser);

    const input = {
      userId: 'user1',
      updates: {
        name: 'New Name',
        email: 'new@example.com',
      },
    };

    const result = await updateProfile(input);

    expect(mockUpdate).toHaveBeenCalledWith('user1', {
      name: 'New Name',
      email: 'new@example.com',
    });
    expect(result.name).toBe('New Name');
    expect(result.email).toBe('new@example.com');
  });

  it('should not check email existence when email is not changed', async () => {
    const existingUser: User = {
      id: 'user1',
      email: 'test@example.com',
      hashedPassword: 'hashed_password',
      name: 'Old Name',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedUser: User = {
      ...existingUser,
      name: 'New Name',
      updatedAt: new Date(),
    };

    mockFindById.mockResolvedValue(existingUser);
    mockUpdate.mockResolvedValue(updatedUser);

    const input = {
      userId: 'user1',
      updates: {
        name: 'New Name',
        email: 'test@example.com', // Same email
      },
    };

    const result = await updateProfile(input);

    expect(mockExists).not.toHaveBeenCalled();
    expect(result).toEqual(updatedUser);
  });

  it('should throw error when user does not exist', async () => {
    mockFindById.mockResolvedValue(null);

    const input = {
      userId: 'nonexistent',
      updates: {
        name: 'New Name',
      },
    };

    await expect(updateProfile(input)).rejects.toThrow('ユーザーが見つかりません');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should throw error when email is invalid', async () => {
    const existingUser: User = {
      id: 'user1',
      email: 'test@example.com',
      hashedPassword: 'hashed_password',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindById.mockResolvedValue(existingUser);

    const input = {
      userId: 'user1',
      updates: {
        email: 'invalid-email',
      },
    };

    await expect(updateProfile(input)).rejects.toThrow('メールアドレスの形式が正しくありません');
    expect(mockExists).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should throw error when new email is already taken', async () => {
    const existingUser: User = {
      id: 'user1',
      email: 'old@example.com',
      hashedPassword: 'hashed_password',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindById.mockResolvedValue(existingUser);
    mockExists.mockResolvedValue(true);

    const input = {
      userId: 'user1',
      updates: {
        email: 'taken@example.com',
      },
    };

    await expect(updateProfile(input)).rejects.toThrow('このメールアドレスは既に使用されています');
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});