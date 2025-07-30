import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoistedを使用してモックを優先的に読み込む
const { mockDeleteSession } = vi.hoisted(() => {
  const mockDeleteSession = vi.fn();
  return { mockDeleteSession };
});

// Mock modules
vi.mock('../../../../adapter/service/authService.lucia', () => ({
  AuthServiceLucia: vi.fn(() => ({
    deleteSession: mockDeleteSession,
  })),
}));

import { logout } from './handler';

describe('logout command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should logout successfully', async () => {
    mockDeleteSession.mockResolvedValue(undefined);

    const token = 'session_token_123';
    await logout(token);

    expect(mockDeleteSession).toHaveBeenCalledWith('session_token_123');
    expect(mockDeleteSession).toHaveBeenCalledTimes(1);
  });
});