import { startSession } from '../../features/pomodoro-session/command/start-session/handler';
import { TaskRepositoryPrisma } from '../../adapter/repository/taskRepository.prisma';
import type { PomodoroSession } from '../../features/pomodoro-session/core/pomodoroSession';

const taskRepository = new TaskRepositoryPrisma();

export type StartPomodoroForTaskInput = {
  taskId: string;
  userId: string;
};

export async function startPomodoroForTask(input: StartPomodoroForTaskInput): Promise<PomodoroSession> {
  // 1. タスクの取得
  const task = await taskRepository.findById(input.taskId);
  if (!task) {
    throw new Error('タスクが見つかりません');
  }

  // 2. タスクの所有者確認
  if (task.userId !== input.userId) {
    throw new Error('このタスクでセッションを開始する権限がありません');
  }

  // 3. タスクのステータスを進行中に更新（pendingの場合のみ）
  if (task.status === 'pending') {
    await taskRepository.updateStatus(input.taskId, 'in_progress');
  }

  // 4. セッションの開始
  const session = await startSession({
    taskId: input.taskId,
    projectId: task.projectId,
    userId: input.userId,
    type: 'work',
  });

  return session;
}