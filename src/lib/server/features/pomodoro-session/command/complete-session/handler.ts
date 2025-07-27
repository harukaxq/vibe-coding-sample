import type { PomodoroSession } from '../../core/pomodoroSession';
import type { CompleteSessionCommandInput } from './core';
import { PomodoroSessionRepositoryPrisma } from '../../../../adapter/repository/pomodoroSessionRepository.prisma';
import { TaskRepositoryPrisma } from '../../../../adapter/repository/taskRepository.prisma';

const sessionRepository = new PomodoroSessionRepositoryPrisma();
const taskRepository = new TaskRepositoryPrisma();

export async function completeSession(input: CompleteSessionCommandInput): Promise<PomodoroSession> {
  // セッションの取得
  const session = await sessionRepository.findById(input.sessionId);
  if (!session) {
    throw new Error('セッションが見つかりません');
  }

  // 所有者確認
  if (session.userId !== input.userId) {
    throw new Error('このセッションを完了する権限がありません');
  }

  // 既に完了している場合
  if (session.completedAt) {
    throw new Error('このセッションは既に完了しています');
  }

  // セッションの完了
  const completedSession = await sessionRepository.complete(input.sessionId, new Date());

  // タスクに紐づいている場合、完了ポモドーロ数を増やす
  if (session.taskId && session.type === 'work') {
    await taskRepository.incrementCompletedPomodoros(session.taskId);
  }

  return completedSession;
}