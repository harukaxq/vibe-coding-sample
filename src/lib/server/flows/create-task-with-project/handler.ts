import { createTask } from '../../features/task/command/create-task/handler';
import { ProjectRepositoryPrisma } from '../../adapter/repository/projectRepository.prisma';
import type { CreateTaskInput, Task } from '../../features/task/core/task';

const projectRepository = new ProjectRepositoryPrisma();

export async function createTaskWithProject(input: CreateTaskInput): Promise<Task> {
  // 1. プロジェクトの存在確認
  const project = await projectRepository.findById(input.projectId);
  if (!project) {
    throw new Error('プロジェクトが見つかりません');
  }

  // 2. プロジェクトの所有者確認
  if (project.userId !== input.userId) {
    throw new Error('このプロジェクトにタスクを作成する権限がありません');
  }

  // 3. タスクの作成
  const task = await createTask(input);

  return task;
}