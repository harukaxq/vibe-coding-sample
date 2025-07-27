import type { RequestEvent } from '@sveltejs/kit';
import { AuthServiceLucia } from './adapter/service/authService.lucia';
import { UserRepositoryPrisma } from './adapter/repository/userRepository.prisma';

const authService = new AuthServiceLucia();
const userRepository = new UserRepositoryPrisma();

export async function requireAuth(event: RequestEvent) {
  const token = event.cookies.get('session');
  
  if (!token) {
    throw new Error('認証が必要です');
  }
  
  const session = await authService.validateSession(token);
  
  if (!session) {
    throw new Error('セッションが無効です');
  }
  
  const user = await userRepository.findById(session.userId);
  
  if (!user) {
    throw new Error('ユーザーが見つかりません');
  }
  
  return user;
}

export async function requireAdmin(event: RequestEvent) {
  const user = await requireAuth(event);
  
  // 今回はroleフィールドがないので、仮の実装
  // TODO: 管理者権限の実装
  
  return user;
}

export async function getAuthUser(event: RequestEvent) {
  const token = event.cookies.get('session');
  
  if (!token) {
    return null;
  }
  
  const session = await authService.validateSession(token);
  
  if (!session) {
    return null;
  }
  
  const user = await userRepository.findById(session.userId);
  
  return user;
}