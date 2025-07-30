import { describe, it, expect } from 'vitest';
import {
  createPomodoroSession,
  calculateElapsedMinutes,
  isSessionActive,
  canPauseSession,
  canResumeSession,
  isSessionComplete,
  WORK_DURATION,
  BREAK_DURATION,
} from './pomodoroSession';
import type { PomodoroSession } from './pomodoroSession';

describe('pomodoroSession', () => {
  describe('createPomodoroSession', () => {
    it('should create work session with default duration', () => {
      const input = {
        projectId: 'project1',
        userId: 'user1',
      };

      const result = createPomodoroSession(input);

      expect(result.type).toBe('work');
      expect(result.duration).toBe(WORK_DURATION);
      expect(result.taskId).toBeNull();
      expect(result.projectId).toBe('project1');
      expect(result.userId).toBe('user1');
    });

    it('should create break session with break duration', () => {
      const input = {
        type: 'break' as const,
        projectId: 'project1',
        userId: 'user1',
      };

      const result = createPomodoroSession(input);

      expect(result.type).toBe('break');
      expect(result.duration).toBe(BREAK_DURATION);
    });

    it('should create session with custom duration', () => {
      const input = {
        duration: 30,
        projectId: 'project1',
        userId: 'user1',
      };

      const result = createPomodoroSession(input);

      expect(result.duration).toBe(30);
    });

    it('should create session with taskId', () => {
      const input = {
        taskId: 'task1',
        projectId: 'project1',
        userId: 'user1',
      };

      const result = createPomodoroSession(input);

      expect(result.taskId).toBe('task1');
    });
  });

  describe('calculateElapsedMinutes', () => {
    it('should calculate elapsed minutes for active session', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: null,
        completedAt: null,
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:00:00Z'),
      };

      const currentTime = new Date('2025-07-26T10:10:00Z');
      const result = calculateElapsedMinutes(session, currentTime);

      expect(result).toBe(10);
    });

    it('should calculate elapsed minutes for paused session', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: new Date('2025-07-26T10:15:00Z'),
        completedAt: null,
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:15:00Z'),
      };

      const currentTime = new Date('2025-07-26T10:20:00Z');
      const result = calculateElapsedMinutes(session, currentTime);

      expect(result).toBe(15);
    });

    it('should calculate elapsed minutes for completed session', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: null,
        completedAt: new Date('2025-07-26T10:25:00Z'),
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:25:00Z'),
      };

      const currentTime = new Date('2025-07-26T10:30:00Z');
      const result = calculateElapsedMinutes(session, currentTime);

      expect(result).toBe(25);
    });
  });

  describe('isSessionActive', () => {
    it('should return true for active session', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: null,
        completedAt: null,
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:00:00Z'),
      };

      expect(isSessionActive(session)).toBe(true);
    });

    it('should return false for paused session', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: new Date('2025-07-26T10:15:00Z'),
        completedAt: null,
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:15:00Z'),
      };

      expect(isSessionActive(session)).toBe(false);
    });

    it('should return false for completed session', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: null,
        completedAt: new Date('2025-07-26T10:25:00Z'),
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:25:00Z'),
      };

      expect(isSessionActive(session)).toBe(false);
    });
  });

  describe('canPauseSession', () => {
    it('should return true for active session', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: null,
        completedAt: null,
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:00:00Z'),
      };

      expect(canPauseSession(session)).toBe(true);
    });
  });

  describe('canResumeSession', () => {
    it('should return true for paused session', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: new Date('2025-07-26T10:15:00Z'),
        completedAt: null,
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:15:00Z'),
      };

      expect(canResumeSession(session)).toBe(true);
    });

    it('should return false for active session', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: null,
        completedAt: null,
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:00:00Z'),
      };

      expect(canResumeSession(session)).toBe(false);
    });
  });

  describe('isSessionComplete', () => {
    it('should return true for explicitly completed session', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: null,
        completedAt: new Date('2025-07-26T10:20:00Z'),
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:20:00Z'),
      };

      const currentTime = new Date('2025-07-26T10:30:00Z');
      expect(isSessionComplete(session, currentTime)).toBe(true);
    });

    it('should return true when elapsed time exceeds duration', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: null,
        completedAt: null,
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:00:00Z'),
      };

      const currentTime = new Date('2025-07-26T10:30:00Z');
      expect(isSessionComplete(session, currentTime)).toBe(true);
    });

    it('should return false when elapsed time is less than duration', () => {
      const session: PomodoroSession = {
        id: '1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T10:00:00Z'),
        pausedAt: null,
        completedAt: null,
        taskId: null,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26T10:00:00Z'),
        updatedAt: new Date('2025-07-26T10:00:00Z'),
      };

      const currentTime = new Date('2025-07-26T10:20:00Z');
      expect(isSessionComplete(session, currentTime)).toBe(false);
    });
  });
});