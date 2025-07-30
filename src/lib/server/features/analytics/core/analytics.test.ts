import { describe, it, expect } from 'vitest';
import { calculateDailyStats, calculateProjectProgress, createTimelineEntry } from './analytics';
import type { PomodoroSession } from '../../pomodoro-session/core/pomodoroSession';
import type { Project } from '../../project/core/project';
import type { Task } from '../../task/core/task';

describe('analytics', () => {
  describe('calculateDailyStats', () => {
    it('should calculate daily stats correctly', () => {
      const testDate = new Date('2025-07-26T12:00:00Z');
      const sessions: PomodoroSession[] = [
        {
          id: '1',
          userId: 'user1',
          projectId: 'project1',
          taskId: 'task1',
          type: 'work',
          duration: 25,
          startedAt: new Date('2025-07-26T09:00:00Z'),
          completedAt: new Date('2025-07-26T09:25:00Z'),
          createdAt: new Date('2025-07-26T09:00:00Z'),
          updatedAt: new Date('2025-07-26T09:25:00Z'),
        },
        {
          id: '2',
          userId: 'user1',
          projectId: 'project1',
          taskId: 'task2',
          type: 'work',
          duration: 25,
          startedAt: new Date('2025-07-26T10:00:00Z'),
          completedAt: new Date('2025-07-26T10:25:00Z'),
          createdAt: new Date('2025-07-26T10:00:00Z'),
          updatedAt: new Date('2025-07-26T10:25:00Z'),
        },
        {
          id: '3',
          userId: 'user1',
          projectId: 'project2',
          taskId: 'task3',
          type: 'work',
          duration: 25,
          startedAt: new Date('2025-07-26T11:00:00Z'),
          completedAt: new Date('2025-07-26T11:25:00Z'),
          createdAt: new Date('2025-07-26T11:00:00Z'),
          updatedAt: new Date('2025-07-26T11:25:00Z'),
        },
        {
          id: '4',
          userId: 'user1',
          projectId: 'project1',
          taskId: 'task1',
          type: 'break',
          duration: 5,
          startedAt: new Date('2025-07-26T09:25:00Z'),
          completedAt: new Date('2025-07-26T09:30:00Z'),
          createdAt: new Date('2025-07-26T09:25:00Z'),
          updatedAt: new Date('2025-07-26T09:30:00Z'),
        },
        {
          id: '5',
          userId: 'user1',
          projectId: 'project1',
          taskId: 'task1',
          type: 'work',
          duration: 25,
          startedAt: new Date('2025-07-27T09:00:00Z'),
          completedAt: new Date('2025-07-27T09:25:00Z'),
          createdAt: new Date('2025-07-27T09:00:00Z'),
          updatedAt: new Date('2025-07-27T09:25:00Z'),
        },
      ];

      const projects: Project[] = [
        {
          id: 'project1',
          name: 'Project 1',
          color: '#FF0000',
          targetPomodoros: 10,
          userId: 'user1',
          createdAt: new Date('2025-07-01'),
          updatedAt: new Date('2025-07-01'),
        },
        {
          id: 'project2',
          name: 'Project 2',
          color: '#00FF00',
          targetPomodoros: 20,
          userId: 'user1',
          createdAt: new Date('2025-07-01'),
          updatedAt: new Date('2025-07-01'),
        },
      ];

      const result = calculateDailyStats(sessions, projects, testDate);

      expect(result.date).toEqual(testDate);
      expect(result.completedPomodoros).toBe(3);
      expect(result.totalMinutes).toBe(75);
      expect(result.projectBreakdown).toHaveLength(2);
      expect(result.projectBreakdown).toContainEqual({
        projectId: 'project1',
        projectName: 'Project 1',
        completedPomodoros: 2,
        totalMinutes: 50,
      });
      expect(result.projectBreakdown).toContainEqual({
        projectId: 'project2',
        projectName: 'Project 2',
        completedPomodoros: 1,
        totalMinutes: 25,
      });
    });

    it('should return empty stats for day with no sessions', () => {
      const testDate = new Date('2025-07-26');
      const sessions: PomodoroSession[] = [];
      const projects: Project[] = [];

      const result = calculateDailyStats(sessions, projects, testDate);

      expect(result.completedPomodoros).toBe(0);
      expect(result.totalMinutes).toBe(0);
      expect(result.projectBreakdown).toHaveLength(0);
    });
  });

  describe('calculateProjectProgress', () => {
    it('should calculate project progress correctly', () => {
      const project: Project = {
        id: 'project1',
        name: 'Project 1',
        color: '#FF0000',
        targetPomodoros: 10,
        userId: 'user1',
        createdAt: new Date('2025-07-01'),
        updatedAt: new Date('2025-07-01'),
      };

      const completedSessions: PomodoroSession[] = [
        {
          id: '1',
          userId: 'user1',
          projectId: 'project1',
          taskId: 'task1',
          type: 'work',
          duration: 25,
          startedAt: new Date('2025-07-26T09:00:00Z'),
          completedAt: new Date('2025-07-26T09:25:00Z'),
          createdAt: new Date('2025-07-26T09:00:00Z'),
          updatedAt: new Date('2025-07-26T09:25:00Z'),
        },
        {
          id: '2',
          userId: 'user1',
          projectId: 'project1',
          taskId: 'task2',
          type: 'work',
          duration: 25,
          startedAt: new Date('2025-07-26T10:00:00Z'),
          completedAt: new Date('2025-07-26T10:25:00Z'),
          createdAt: new Date('2025-07-26T10:00:00Z'),
          updatedAt: new Date('2025-07-26T10:25:00Z'),
        },
        {
          id: '3',
          userId: 'user1',
          projectId: 'project1',
          taskId: 'task3',
          type: 'work',
          duration: 25,
          startedAt: new Date('2025-07-26T11:00:00Z'),
          completedAt: new Date('2025-07-26T11:25:00Z'),
          createdAt: new Date('2025-07-26T11:00:00Z'),
          updatedAt: new Date('2025-07-26T11:25:00Z'),
        },
        {
          id: '4',
          userId: 'user1',
          projectId: 'project2',
          taskId: 'task4',
          type: 'work',
          duration: 25,
          startedAt: new Date('2025-07-26T12:00:00Z'),
          completedAt: new Date('2025-07-26T12:25:00Z'),
          createdAt: new Date('2025-07-26T12:00:00Z'),
          updatedAt: new Date('2025-07-26T12:25:00Z'),
        },
      ];

      const result = calculateProjectProgress(project, completedSessions);

      expect(result.projectId).toBe('project1');
      expect(result.projectName).toBe('Project 1');
      expect(result.targetPomodoros).toBe(10);
      expect(result.completedPomodoros).toBe(3);
      expect(result.progressPercentage).toBe(30);
      expect(result.remainingPomodoros).toBe(7);
    });

    it('should cap progress at 100%', () => {
      const project: Project = {
        id: 'project1',
        name: 'Project 1',
        color: '#FF0000',
        targetPomodoros: 2,
        userId: 'user1',
        createdAt: new Date('2025-07-01'),
        updatedAt: new Date('2025-07-01'),
      };

      const completedSessions: PomodoroSession[] = [
        {
          id: '1',
          userId: 'user1',
          projectId: 'project1',
          taskId: 'task1',
          type: 'work',
          duration: 25,
          startedAt: new Date('2025-07-26T09:00:00Z'),
          completedAt: new Date('2025-07-26T09:25:00Z'),
          createdAt: new Date('2025-07-26T09:00:00Z'),
          updatedAt: new Date('2025-07-26T09:25:00Z'),
        },
        {
          id: '2',
          userId: 'user1',
          projectId: 'project1',
          taskId: 'task2',
          type: 'work',
          duration: 25,
          startedAt: new Date('2025-07-26T10:00:00Z'),
          completedAt: new Date('2025-07-26T10:25:00Z'),
          createdAt: new Date('2025-07-26T10:00:00Z'),
          updatedAt: new Date('2025-07-26T10:25:00Z'),
        },
        {
          id: '3',
          userId: 'user1',
          projectId: 'project1',
          taskId: 'task3',
          type: 'work',
          duration: 25,
          startedAt: new Date('2025-07-26T11:00:00Z'),
          completedAt: new Date('2025-07-26T11:25:00Z'),
          createdAt: new Date('2025-07-26T11:00:00Z'),
          updatedAt: new Date('2025-07-26T11:25:00Z'),
        },
      ];

      const result = calculateProjectProgress(project, completedSessions);

      expect(result.completedPomodoros).toBe(3);
      expect(result.progressPercentage).toBe(100);
      expect(result.remainingPomodoros).toBe(0);
    });
  });

  describe('createTimelineEntry', () => {
    it('should create timeline entry with task', () => {
      const session: PomodoroSession = {
        id: 'session1',
        userId: 'user1',
        projectId: 'project1',
        taskId: 'task1',
        type: 'work',
        duration: 25,
        startedAt: new Date('2025-07-26T09:00:00Z'),
        completedAt: new Date('2025-07-26T09:25:00Z'),
        createdAt: new Date('2025-07-26T09:00:00Z'),
        updatedAt: new Date('2025-07-26T09:25:00Z'),
      };

      const project: Project = {
        id: 'project1',
        name: 'Project 1',
        color: '#FF0000',
        targetPomodoros: 10,
        userId: 'user1',
        createdAt: new Date('2025-07-01'),
        updatedAt: new Date('2025-07-01'),
      };

      const task: Task = {
        id: 'task1',
        title: 'Task 1',
        description: null,
        status: 'pending',
        estimatedPomodoros: 2,
        completedPomodoros: 0,
        projectId: 'project1',
        userId: 'user1',
        createdAt: new Date('2025-07-26'),
        updatedAt: new Date('2025-07-26'),
        completedAt: null,
      };

      const result = createTimelineEntry(session, project, task);

      expect(result.sessionId).toBe('session1');
      expect(result.type).toBe('work');
      expect(result.projectName).toBe('Project 1');
      expect(result.taskTitle).toBe('Task 1');
      expect(result.startedAt).toEqual(session.startedAt);
      expect(result.completedAt).toEqual(session.completedAt);
      expect(result.duration).toBe(25);
    });

    it('should create timeline entry without task', () => {
      const session: PomodoroSession = {
        id: 'session1',
        userId: 'user1',
        projectId: 'project1',
        taskId: null,
        type: 'break',
        duration: 5,
        startedAt: new Date('2025-07-26T09:25:00Z'),
        completedAt: new Date('2025-07-26T09:30:00Z'),
        createdAt: new Date('2025-07-26T09:25:00Z'),
        updatedAt: new Date('2025-07-26T09:30:00Z'),
      };

      const project: Project = {
        id: 'project1',
        name: 'Project 1',
        color: '#FF0000',
        targetPomodoros: 10,
        userId: 'user1',
        createdAt: new Date('2025-07-01'),
        updatedAt: new Date('2025-07-01'),
      };

      const result = createTimelineEntry(session, project, null);

      expect(result.taskTitle).toBeNull();
      expect(result.type).toBe('break');
    });
  });
});