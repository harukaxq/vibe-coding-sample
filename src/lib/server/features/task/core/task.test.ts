import { describe, it, expect } from 'vitest';
import { createTask, isValidEstimatedPomodoros, calculateProgress } from './task';
import type { Task } from './task';

describe('task', () => {
  describe('createTask', () => {
    it('should create task with default values', () => {
      const input = {
        title: 'New Task',
        projectId: 'project1',
        userId: 'user1',
      };

      const result = createTask(input);

      expect(result.title).toBe('New Task');
      expect(result.description).toBeNull();
      expect(result.status).toBe('pending');
      expect(result.estimatedPomodoros).toBe(1);
      expect(result.completedPomodoros).toBe(0);
      expect(result.projectId).toBe('project1');
      expect(result.userId).toBe('user1');
    });

    it('should create task with custom values', () => {
      const input = {
        title: 'Custom Task',
        description: 'This is a custom task',
        estimatedPomodoros: 5,
        projectId: 'project1',
        userId: 'user1',
      };

      const result = createTask(input);

      expect(result.title).toBe('Custom Task');
      expect(result.description).toBe('This is a custom task');
      expect(result.status).toBe('pending');
      expect(result.estimatedPomodoros).toBe(5);
      expect(result.completedPomodoros).toBe(0);
    });
  });

  describe('isValidEstimatedPomodoros', () => {
    it('should return true for valid pomodoro counts', () => {
      expect(isValidEstimatedPomodoros(1)).toBe(true);
      expect(isValidEstimatedPomodoros(5)).toBe(true);
      expect(isValidEstimatedPomodoros(10)).toBe(true);
      expect(isValidEstimatedPomodoros(20)).toBe(true);
    });

    it('should return false for invalid pomodoro counts', () => {
      expect(isValidEstimatedPomodoros(0)).toBe(false);
      expect(isValidEstimatedPomodoros(-1)).toBe(false);
      expect(isValidEstimatedPomodoros(21)).toBe(false);
      expect(isValidEstimatedPomodoros(100)).toBe(false);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress correctly', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        description: null,
        status: 'in_progress',
        estimatedPomodoros: 4,
        completedPomodoros: 2,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26'),
        updatedAt: new Date('2025-07-26'),
        completedAt: null,
      };

      const progress = calculateProgress(task);
      expect(progress).toBe(50);
    });

    it('should return 0 when estimatedPomodoros is 0', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        description: null,
        status: 'pending',
        estimatedPomodoros: 0,
        completedPomodoros: 2,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26'),
        updatedAt: new Date('2025-07-26'),
        completedAt: null,
      };

      const progress = calculateProgress(task);
      expect(progress).toBe(0);
    });

    it('should cap progress at 100%', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        description: null,
        status: 'completed',
        estimatedPomodoros: 2,
        completedPomodoros: 5,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26'),
        updatedAt: new Date('2025-07-26'),
        completedAt: new Date('2025-07-26'),
      };

      const progress = calculateProgress(task);
      expect(progress).toBe(100);
    });

    it('should round progress to nearest integer', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        description: null,
        status: 'in_progress',
        estimatedPomodoros: 3,
        completedPomodoros: 1,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26'),
        updatedAt: new Date('2025-07-26'),
        completedAt: null,
      };

      const progress = calculateProgress(task);
      expect(progress).toBe(33);
    });
  });
});