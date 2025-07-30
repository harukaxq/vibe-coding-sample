import { describe, it, expect } from 'vitest';
import { createAuthSession, isSessionExpired } from './auth';
import type { AuthSession } from './auth';

describe('auth', () => {
  describe('createAuthSession', () => {
    it('should create auth session with userId', () => {
      const userId = 'user123';
      const result = createAuthSession(userId);

      expect(result.userId).toBe(userId);
      expect(result).not.toHaveProperty('token');
      expect(result).not.toHaveProperty('expiresAt');
    });
  });

  describe('isSessionExpired', () => {
    it('should return true when session is expired', () => {
      const session: AuthSession = {
        userId: 'user123',
        token: 'token123',
        expiresAt: new Date('2025-07-26T10:00:00Z'),
      };
      const currentTime = new Date('2025-07-26T11:00:00Z');

      const result = isSessionExpired(session, currentTime);

      expect(result).toBe(true);
    });

    it('should return false when session is not expired', () => {
      const session: AuthSession = {
        userId: 'user123',
        token: 'token123',
        expiresAt: new Date('2025-07-26T12:00:00Z'),
      };
      const currentTime = new Date('2025-07-26T11:00:00Z');

      const result = isSessionExpired(session, currentTime);

      expect(result).toBe(false);
    });

    it('should return false when session expires at exact current time', () => {
      const testTime = new Date('2025-07-26T12:00:00Z');
      const session: AuthSession = {
        userId: 'user123',
        token: 'token123',
        expiresAt: testTime,
      };

      const result = isSessionExpired(session, testTime);

      expect(result).toBe(false);
    });
  });
});