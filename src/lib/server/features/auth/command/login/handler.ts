import type { LoginCommandInput, LoginCommandResult } from './core';
import { validateLoginInput } from './core';
import { UserRepositoryPrisma } from '../../../../adapter/repository/userRepository.prisma';
import { AuthServiceLucia } from '../../../../adapter/service/authService.lucia';

const userRepository = new UserRepositoryPrisma();
const authService = new AuthServiceLucia();

export async function login(input: LoginCommandInput): Promise<LoginCommandResult> {
  // 入力検証
  const validationError = validateLoginInput(input);
  if (validationError) {
    if (validationError.type === 'INVALID_EMAIL') {
      throw new Error('メールアドレスの形式が正しくありません');
    }
  }

  // ユーザーの取得
  const user = await userRepository.findByEmail(input.email);
  if (!user) {
    throw new Error('メールアドレスまたはパスワードが正しくありません');
  }

  // パスワードの検証
  const isValidPassword = await authService.verifyPassword(input.password, user.hashedPassword);
  if (!isValidPassword) {
    throw new Error('メールアドレスまたはパスワードが正しくありません');
  }

  // セッションの作成
  const session = await authService.createSession(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    session,
  };
}