import type { User } from '../../../user/core/user';
import type { RegisterCommandInput } from './core';
import { validateRegisterInput, buildUserData } from './core';
import { UserRepositoryPrisma } from '../../../../adapter/repository/userRepository.prisma';
import { AuthServiceLucia } from '../../../../adapter/service/authService.lucia';

const userRepository = new UserRepositoryPrisma();
const authService = new AuthServiceLucia();

export async function register(input: RegisterCommandInput): Promise<User> {
  // 入力検証
  const validationError = validateRegisterInput(input);
  if (validationError) {
    if (validationError.type === 'INVALID_EMAIL') {
      throw new Error('メールアドレスの形式が正しくありません');
    }
    if (validationError.type === 'WEAK_PASSWORD') {
      throw new Error(validationError.errors.join(', '));
    }
  }

  // メールアドレスの重複チェック
  const existingUser = await userRepository.findByEmail(input.email);
  if (existingUser) {
    throw new Error('このメールアドレスは既に使用されています');
  }

  // パスワードのハッシュ化
  const hashedPassword = await authService.hashPassword(input.password);

  // ユーザーデータの構築
  const userData = buildUserData(input, hashedPassword);

  // ユーザーの作成
  const user = await userRepository.create(userData);

  return user;
}