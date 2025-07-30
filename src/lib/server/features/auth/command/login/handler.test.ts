import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '../../../user/core/user';

// vi.hoistedを使用してモックを優先的に読み込む
const { mockFindByEmail, mockVerifyPassword, mockCreateSession } = vi.hoisted(() => {
  const mockFindByEmail = vi.fn();
  const mockVerifyPassword = vi.fn();
  const mockCreateSession = vi.fn();
  return { mockFindByEmail, mockVerifyPassword, mockCreateSession };
});

// モジュール全体をモック
vi.mock('../../../../adapter/repository/userRepository.prisma', () => ({
  UserRepositoryPrisma: vi.fn(() => ({
    findByEmail: mockFindByEmail,
  })),
}));

vi.mock('../../../../adapter/service/authService.lucia', () => ({
  AuthServiceLucia: vi.fn(() => ({
    verifyPassword: mockVerifyPassword,
    createSession: mockCreateSession,
  })),
}));

import { login } from './handler';

describe('login command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      hashedPassword: 'hashed_password',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSession = {
      token: 'session_token',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    mockFindByEmail.mockResolvedValue(mockUser);
    mockVerifyPassword.mockResolvedValue(true);
    mockCreateSession.mockResolvedValue(mockSession);

    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = await login(input);

    expect(mockFindByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockVerifyPassword).toHaveBeenCalledWith('password123', 'hashed_password');
    expect(mockCreateSession).toHaveBeenCalledWith('user1');
    expect(result).toEqual({
      user: {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
      },
      session: mockSession,
    });
  });

  it('should throw error for invalid email format', async () => {
    const input = {
      email: 'invalid-email',
      password: 'password123',
    };

    await expect(login(input)).rejects.toThrow('メールアドレスの形式が正しくありません');
    expect(mockFindByEmail).not.toHaveBeenCalled();
  });

  it('should throw error when user does not exist', async () => {
    mockFindByEmail.mockResolvedValue(null);

    const input = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    await expect(login(input)).rejects.toThrow('メールアドレスまたはパスワードが正しくありません');
    expect(mockVerifyPassword).not.toHaveBeenCalled();
  });

  it('should throw error when password is incorrect', async () => {
    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      hashedPassword: 'hashed_password',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindByEmail.mockResolvedValue(mockUser);
    mockVerifyPassword.mockResolvedValue(false);

    const input = {
      email: 'test@example.com',
      password: 'wrong_password',
    };

    await expect(login(input)).rejects.toThrow('メールアドレスまたはパスワードが正しくありません');
    expect(mockCreateSession).not.toHaveBeenCalled();
  });
});