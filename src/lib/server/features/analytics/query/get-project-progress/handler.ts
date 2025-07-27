import type { GetProjectProgressQueryInput, ProjectProgressData } from './core';
import { calculateProjectProgress } from '../../core/analytics';
import { ProjectRepositoryPrisma } from '../../../../adapter/repository/projectRepository.prisma';
import { PomodoroSessionRepositoryPrisma } from '../../../../adapter/repository/pomodoroSessionRepository.prisma';

const projectRepository = new ProjectRepositoryPrisma();
const sessionRepository = new PomodoroSessionRepositoryPrisma();

export async function getProjectProgress(input: GetProjectProgressQueryInput): Promise<ProjectProgressData[]> {
  const days = input.days ?? 7;
  
  // 期間の計算
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // ユーザーのプロジェクトを取得
  const projects = await projectRepository.findByUserId(input.userId);

  // 期間内のセッションを取得
  const sessions = await sessionRepository.findByDateRange(input.userId, startDate, endDate);

  // プロジェクトごとの進捗を計算
  const progressData: ProjectProgressData[] = [];

  for (const project of projects) {
    const projectSessions = sessions.filter(s => s.projectId === project.id);
    const progress = calculateProjectProgress(project, projectSessions);

    progressData.push({
      projectId: progress.projectId,
      projectName: progress.projectName,
      color: project.color,
      targetPomodoros: progress.targetPomodoros,
      completedPomodoros: progress.completedPomodoros,
      progressPercentage: progress.progressPercentage,
      remainingPomodoros: progress.remainingPomodoros,
    });
  }

  return progressData;
}