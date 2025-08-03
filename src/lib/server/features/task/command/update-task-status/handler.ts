import type { Task } from '../../core/task';
import type { UpdateTaskStatusCommandInput } from './core';
import { TaskRepositoryPrisma } from '../../../../adapter/repository/taskRepository.prisma';

const taskRepository = new TaskRepositoryPrisma();

export async function updateTaskStatus(input: UpdateTaskStatusCommandInput): Promise<Task> {
  // タスクの取得
  const task = await taskRepository.findById(input.taskId);
  if (!task) {
    throw new Error('タスクが見つかりません');
  }

  // 所有者確認
  if (task.userId !== input.userId) {
    throw new Error('このタスクを更新する権限がありません');
  }

  // ステータスが進行中の場合、ポモドーロセッションが実行中でないことを確認
  if (input.status === 'in_progress') {
    // TODO: アクティブなポモドーロセッションがある場合のチェックが必要
  }

  // completedAtの設定
  const completedAt = input.status === 'completed' ? new Date() : undefined;

  // タスクの更新
  const updatedTask = await taskRepository.updateStatus(input.taskId, input.status, completedAt);

  return updatedTask;
}