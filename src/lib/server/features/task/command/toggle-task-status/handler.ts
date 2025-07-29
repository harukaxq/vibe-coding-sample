import type { Task } from '../../core/task';
import type { ToggleTaskStatusCommandInput } from './core';
import { canToggleStatus } from '../../policy/taskPolicy';
import { TaskRepositoryPrisma } from '../../../../adapter/repository/taskRepository.prisma';

const taskRepository = new TaskRepositoryPrisma();

export async function toggleTaskStatus(input: ToggleTaskStatusCommandInput): Promise<Task> {
  // タスクの取得
  const task = await taskRepository.findById(input.taskId);
  if (!task) {
    throw new Error('タスクが見つかりません');
  }

  // 所有者確認
  if (task.userId !== input.userId) {
    throw new Error('このタスクを更新する権限がありません');
  }

  // 進行中のタスクは直接完了にできない
  if (!canToggleStatus(task)) {
    throw new Error('進行中のタスクは直接完了にできません');
  }

  // ステータスのトグル
  const newStatus = (task.status === 'completed' || task.status === 'canceled') ? 'pending' : 'completed';
  const completedAt = newStatus === 'completed' ? new Date() : undefined;

  // タスクの更新
  const updatedTask = await taskRepository.updateStatus(input.taskId, newStatus, completedAt);

  return updatedTask;
}
