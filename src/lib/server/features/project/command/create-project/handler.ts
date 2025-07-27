import type { Project } from '../../core/project';
import type { CreateProjectCommandInput } from './core';
import { validateCreateProjectInput } from './core';
import { ProjectRepositoryPrisma } from '../../../../adapter/repository/projectRepository.prisma';

const projectRepository = new ProjectRepositoryPrisma();

export async function createProject(input: CreateProjectCommandInput): Promise<Project> {
  // 入力検証
  const validationError = validateCreateProjectInput(input);
  if (validationError) {
    if (validationError.type === 'NAME_TOO_SHORT') {
      throw new Error('プロジェクト名を入力してください');
    }
    if (validationError.type === 'NAME_TOO_LONG') {
      throw new Error('プロジェクト名は100文字以内で入力してください');
    }
    if (validationError.type === 'INVALID_COLOR') {
      throw new Error('色コードの形式が正しくありません');
    }
    if (validationError.type === 'INVALID_TARGET_POMODOROS') {
      throw new Error('目標ポモドーロ数は0〜100の範囲で設定してください');
    }
  }

  // プロジェクトの作成
  const project = await projectRepository.create(input);

  return project;
}