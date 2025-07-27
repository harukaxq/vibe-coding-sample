import type { PomodoroSession } from '../../core/pomodoroSession';
import type { StartSessionCommandInput } from './core';
import { PomodoroSessionRepositoryPrisma } from '../../../../adapter/repository/pomodoroSessionRepository.prisma';
import { TaskRepositoryPrisma } from '../../../../adapter/repository/taskRepository.prisma';
import { ProjectRepositoryPrisma } from '../../../../adapter/repository/projectRepository.prisma';

const sessionRepository = new PomodoroSessionRepositoryPrisma();
const taskRepository = new TaskRepositoryPrisma();
const projectRepository = new ProjectRepositoryPrisma();

export async function startSession(input: StartSessionCommandInput): Promise<PomodoroSession> {
  // プロジェクトの存在確認
  const project = await projectRepository.findById(input.projectId);
  if (!project) {
    throw new Error('プロジェクトが見つかりません');
  }

  // プロジェクトの所有者確認
  if (project.userId !== input.userId) {
    throw new Error('このプロジェクトでセッションを開始する権限がありません');
  }

  // タスクが指定されている場合の確認
  if (input.taskId) {
    const task = await taskRepository.findById(input.taskId);
    if (!task) {
      throw new Error('タスクが見つかりません');
    }
    if (task.userId !== input.userId) {
      throw new Error('このタスクでセッションを開始する権限がありません');
    }
    if (task.projectId !== input.projectId) {
      throw new Error('タスクとプロジェクトが一致しません');
    }
  }

  // アクティブなセッションがないか確認
  const activeSession = await sessionRepository.findActiveByUserId(input.userId);
  if (activeSession) {
    throw new Error('既にアクティブなセッションがあります');
  }

  // セッションの作成
  const session = await sessionRepository.create({
    type: input.type ?? 'work',
    taskId: input.taskId,
    projectId: input.projectId,
    userId: input.userId,
  });

  return session;
}