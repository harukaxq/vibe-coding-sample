import type { GetTasksQueryInput, TaskSummary } from './core';
import { calculateProgress } from '../../core/task';
import { TaskRepositoryPrisma } from '../../../../adapter/repository/taskRepository.prisma';

const taskRepository = new TaskRepositoryPrisma();

export async function getTasks(input: GetTasksQueryInput): Promise<TaskSummary[]> {
  let tasks;

  if (input.status) {
    tasks = await taskRepository.findByStatus(input.userId, input.status);
  } else if (input.projectId) {
    tasks = await taskRepository.findByProjectId(input.projectId);
    // プロジェクトIDで絞る場合も、ユーザーIDでフィルタ
    tasks = tasks.filter(task => task.userId === input.userId);
  } else {
    tasks = await taskRepository.findByUserId(input.userId);
  }

  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    estimatedPomodoros: task.estimatedPomodoros,
    completedPomodoros: task.completedPomodoros,
    progress: calculateProgress(task),
    projectId: task.projectId,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
  }));
}