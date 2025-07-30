import { describe, it, expect } from 'vitest';
import { createUser, validateEmail, canUpdateEmail } from './user';
import type { User } from './user';

describe('user', () => {
  describe('createUser', () => {
    it('should create user with required fields', () => {
      const input = {
        email: 'test@example.com',
        hashedPassword: 'hashed_password_123',
      };

      const result = createUser(input);

      expect(result.email).toBe('test@example.com');
      expect(result.hashedPassword).toBe('hashed_password_123');
      expect(result.name).toBeNull();
    });

    it('should create user with name', () => {
      const input = {
        email: 'test@example.com',
        hashedPassword: 'hashed_password_123',
        name: 'Test User',
      };

      const result = createUser(input);

      expect(result.email).toBe('test@example.com');
      expect(result.hashedPassword).toBe('hashed_password_123');
      expect(result.name).toBe('Test User');
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@example.com')).toBe(true);
      expect(validateEmail('user+tag@example.co.jp')).toBe(true);
      expect(validateEmail('test123@test-domain.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
      expect(validateEmail('test@example .com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('canUpdateEmail', () => {
    const mockUser: User = {
      id: '1',
      email: 'current@example.com',
      hashedPassword: 'hashed',
      name: 'Current User',
      createdAt: new Date('2025-07-01'),
      updatedAt: new Date('2025-07-01'),
    };

    it('should return true when new email is different and valid', () => {
      const result = canUpdateEmail(mockUser, 'new@example.com');
      expect(result).toBe(true);
    });

    it('should return false when new email is the same as current', () => {
      const result = canUpdateEmail(mockUser, 'current@example.com');
      expect(result).toBe(false);
    });

    it('should return false when new email is invalid', () => {
      const result = canUpdateEmail(mockUser, 'invalid-email');
      expect(result).toBe(false);
    });

    it('should return false when new email is different but invalid', () => {
      const result = canUpdateEmail(mockUser, 'different@');
      expect(result).toBe(false);
    });
  });
});