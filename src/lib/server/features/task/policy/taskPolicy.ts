import type { Task, TaskStatus } from '../core/task';

export function canTransitionStatus(currentStatus: TaskStatus, newStatus: TaskStatus): boolean {
  const validTransitions: Record<TaskStatus, TaskStatus[]> = {
    pending: ['in_progress', 'canceled'],
    in_progress: ['pending', 'completed', 'canceled'],
    completed: ['pending', 'canceled'],
    canceled: ['pending']
  };

  return validTransitions[currentStatus].includes(newStatus);
}

export function shouldUpdateCompletedAt(task: Task, newStatus: TaskStatus): boolean {
  return task.status !== 'completed' && newStatus === 'completed';
}

export function shouldClearCompletedAt(task: Task, newStatus: TaskStatus): boolean {
  return task.status === 'completed' && newStatus !== 'completed';
}

export function canStartPomodoro(task: Task): boolean {
  return task.status === 'pending' || task.status === 'in_progress';
}

export function canDeleteTask(task: Task): boolean {
  // 進行中のタスクは削除できない
  return task.status !== 'in_progress';
}

export function canToggleStatus(task: Task): boolean {
  return task.status !== 'in_progress'; // 進行中のタスクは直接完了にできない
}

export function canCancelTask(task: Task): boolean {
  // 未着手または進行中のタスクを中止できる
  return task.status === 'pending' || task.status === 'in_progress';
}
