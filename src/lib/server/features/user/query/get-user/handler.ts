import type { GetUserQueryInput, GetUserQueryResult } from './core';
import { UserRepositoryPrisma } from '../../../../adapter/repository/userRepository.prisma';

const userRepository = new UserRepositoryPrisma();

export async function getUser(input: GetUserQueryInput): Promise<GetUserQueryResult> {
  const user = await userRepository.findById(input.userId);
  
  if (!user) {
    throw new Error('ユーザーが見つかりません');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}