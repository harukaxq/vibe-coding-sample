import type { Task } from '../../core/task';
import type { CancelTaskCommandInput } from './core';
import { canTransitionStatus } from '../../policy/taskPolicy';
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

  // 新しいステータスを決定
  const newStatus = task.status === 'canceled' ? 'pending' : 'canceled';

  // ステータス遷移が可能かチェック
  if (!canTransitionStatus(task.status, newStatus)) {
    throw new Error(`タ��クのステータスを'${task.status}'から'${newStatus}'に変更できません`);
  }

  // タスクの更新
  const updatedTask = await taskRepository.updateStatus(input.taskId, newStatus);

  return updatedTask;
}
