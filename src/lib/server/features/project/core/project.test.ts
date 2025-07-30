import { describe, it, expect } from 'vitest';
import { createProject, isValidColor, isValidTargetPomodoros } from './project';

describe('project', () => {
  describe('createProject', () => {
    it('should create project with default values', () => {
      const input = {
        name: 'New Project',
        userId: 'user1',
      };

      const result = createProject(input);

      expect(result.name).toBe('New Project');
      expect(result.color).toBe('#000000');
      expect(result.targetPomodoros).toBe(0);
      expect(result.userId).toBe('user1');
    });

    it('should create project with custom values', () => {
      const input = {
        name: 'Custom Project',
        color: '#FF5733',
        targetPomodoros: 25,
        userId: 'user1',
      };

      const result = createProject(input);

      expect(result.name).toBe('Custom Project');
      expect(result.color).toBe('#FF5733');
      expect(result.targetPomodoros).toBe(25);
      expect(result.userId).toBe('user1');
    });
  });

  describe('isValidColor', () => {
    it('should return true for valid hex colors', () => {
      expect(isValidColor('#000000')).toBe(true);
      expect(isValidColor('#FFFFFF')).toBe(true);
      expect(isValidColor('#FF5733')).toBe(true);
      expect(isValidColor('#ff5733')).toBe(true);
      expect(isValidColor('#AbCdEf')).toBe(true);
    });

    it('should return false for invalid hex colors', () => {
      expect(isValidColor('#00000')).toBe(false);
      expect(isValidColor('#0000000')).toBe(false);
      expect(isValidColor('#GGGGGG')).toBe(false);
      expect(isValidColor('FF5733')).toBe(false);
      expect(isValidColor('#FF573')).toBe(false);
      expect(isValidColor('#FF57333')).toBe(false);
      expect(isValidColor('red')).toBe(false);
      expect(isValidColor('')).toBe(false);
    });
  });

  describe('isValidTargetPomodoros', () => {
    it('should return true for valid pomodoro counts', () => {
      expect(isValidTargetPomodoros(0)).toBe(true);
      expect(isValidTargetPomodoros(1)).toBe(true);
      expect(isValidTargetPomodoros(25)).toBe(true);
      expect(isValidTargetPomodoros(50)).toBe(true);
      expect(isValidTargetPomodoros(100)).toBe(true);
    });

    it('should return false for invalid pomodoro counts', () => {
      expect(isValidTargetPomodoros(-1)).toBe(false);
      expect(isValidTargetPomodoros(101)).toBe(false);
      expect(isValidTargetPomodoros(200)).toBe(false);
      expect(isValidTargetPomodoros(-10)).toBe(false);
    });
  });
});