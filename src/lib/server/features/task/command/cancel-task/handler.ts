import type { Task } from '../../core/task';
import type { CancelTaskCommandInput } from './core';
import { canCancelTask } from '../../policy/taskPolicy';
import { TaskRepositoryPrisma } from '../../../../adapter/repository/taskRepository.prisma';

const taskRepository = new TaskRepositoryPrisma();

export async function cancelTask(input: CancelTaskCommandInput): Promise<Task> {
  // タスクの取得
  const task = await taskRepository.findById(input.taskId);
  if (!task) {
    throw new Error('タスクが見つかりません');
  }

  // 所有者確認
  if (task.userId !== input.userId) {
    throw new Error('このタスクを更新する権限がありません');
  }

  // 中止可能か確認
  if (!canCancelTask(task)) {
    throw new Error('タスクを中止できません');
  }

  // ステータス更新
  const updatedTask = await taskRepository.updateStatus(input.taskId, 'canceled');

  return updatedTask;
}
