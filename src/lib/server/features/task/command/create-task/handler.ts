import type { Task } from '../../core/task';
import type { CreateTaskCommandInput } from './core';
import { validateCreateTaskInput } from './core';
import { TaskRepositoryPrisma } from '../../../../adapter/repository/taskRepository.prisma';
import { ProjectRepositoryPrisma } from '../../../../adapter/repository/projectRepository.prisma';

const taskRepository = new TaskRepositoryPrisma();
const projectRepository = new ProjectRepositoryPrisma();

export async function createTask(input: CreateTaskCommandInput): Promise<Task> {
  // 入力検証
  const validationError = validateCreateTaskInput(input);
  if (validationError) {
    if (validationError.type === 'TITLE_TOO_SHORT') {
      throw new Error('タスクのタイトルを入力してください');
    }
    if (validationError.type === 'TITLE_TOO_LONG') {
      throw new Error('タスクのタイトルは200文字以内で入力してください');
    }
    if (validationError.type === 'DESCRIPTION_TOO_LONG') {
      throw new Error('タスクの説明は1000文字以内で入力してください');
    }
    if (validationError.type === 'INVALID_ESTIMATED_POMODOROS') {
      throw new Error('予想ポモドーロ数は1〜20の範囲で設定してください');
    }
  }

  // プロジェクトの存在確認
  const project = await projectRepository.findById(input.projectId);
  if (!project) {
    throw new Error('プロジェクトが見つかりません');
  }

  // プロジェクトの所有者確認
  if (project.userId !== input.userId) {
    throw new Error('このプロジェクトにタスクを作成する権限がありません');
  }

  // タスクの作成
  const task = await taskRepository.create(input);

  return task;
}