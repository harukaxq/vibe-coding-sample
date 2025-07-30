import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '../../../user/core/user';

// vi.hoistedを使用してモックを優先的に読み込む
const { mockFindByEmail, mockCreate, mockHashPassword } = vi.hoisted(() => {
  const mockFindByEmail = vi.fn();
  const mockCreate = vi.fn();
  const mockHashPassword = vi.fn();
  return { mockFindByEmail, mockCreate, mockHashPassword };
});

// モジュール全体をモック
vi.mock('../../../../adapter/repository/userRepository.prisma', () => ({
  UserRepositoryPrisma: vi.fn(() => ({
    findByEmail: mockFindByEmail,
    create: mockCreate,
  })),
}));

vi.mock('../../../../adapter/service/authService.lucia', () => ({
  AuthServiceLucia: vi.fn(() => ({
    hashPassword: mockHashPassword,
  })),
}));

import { register } from './handler';

describe('register command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register new user successfully', async () => {
    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      hashedPassword: 'hashed_password',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindByEmail.mockResolvedValue(null);
    mockHashPassword.mockResolvedValue('hashed_password');
    mockCreate.mockResolvedValue(mockUser);

    const input = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User',
    };

    const result = await register(input);

    expect(mockFindByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockHashPassword).toHaveBeenCalledWith('SecurePass123!');
    expect(mockCreate).toHaveBeenCalledWith({
      email: 'test@example.com',
      hashedPassword: 'hashed_password',
      name: 'Test User',
    });
    expect(result).toEqual(mockUser);
  });

  it('should register user without name', async () => {
    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      hashedPassword: 'hashed_password',
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindByEmail.mockResolvedValue(null);
    mockHashPassword.mockResolvedValue('hashed_password');
    mockCreate.mockResolvedValue(mockUser);

    const input = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    const result = await register(input);

    expect(mockCreate).toHaveBeenCalledWith({
      email: 'test@example.com',
      hashedPassword: 'hashed_password',
    });
    expect(result.name).toBeNull();
  });

  it('should throw error for invalid email format', async () => {
    const input = {
      email: 'invalid-email',
      password: 'SecurePass123!',
    };

    await expect(register(input)).rejects.toThrow('メールアドレスの形式が正しくありません');
    expect(mockFindByEmail).not.toHaveBeenCalled();
  });

  it('should throw error when email is already registered', async () => {
    const existingUser: User = {
      id: 'existing1',
      email: 'test@example.com',
      hashedPassword: 'hashed',
      name: 'Existing User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFindByEmail.mockResolvedValue(existingUser);

    const input = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    await expect(register(input)).rejects.toThrow('このメールアドレスは既に使用されています');
    expect(mockHashPassword).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should throw error for weak password', async () => {
    const input = {
      email: 'test@example.com',
      password: '123', // Too short
    };

    await expect(register(input)).rejects.toThrow();
    expect(mockFindByEmail).not.toHaveBeenCalled();
  });
});