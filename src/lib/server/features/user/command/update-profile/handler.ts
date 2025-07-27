import type { User } from '../../core/user';
import type { UpdateProfileCommandInput } from './core';
import { validateUpdateProfileInput } from './core';
import { UserRepositoryPrisma } from '../../../../adapter/repository/userRepository.prisma';

const userRepository = new UserRepositoryPrisma();

export async function updateProfile(input: UpdateProfileCommandInput): Promise<User> {
  // 入力検証
  const validationError = validateUpdateProfileInput(input);
  if (validationError) {
    if (validationError.type === 'INVALID_EMAIL') {
      throw new Error('メールアドレスの形式が正しくありません');
    }
  }

  // ユーザーの存在確認
  const existingUser = await userRepository.findById(input.userId);
  if (!existingUser) {
    throw new Error('ユーザーが見つかりません');
  }

  // メールアドレスを変更する場合、重複チェック
  if (input.updates.email && input.updates.email !== existingUser.email) {
    const emailExists = await userRepository.exists(input.updates.email);
    if (emailExists) {
      throw new Error('このメールアドレスは既に使用されています');
    }
  }

  // ユーザー情報の更新
  const updatedUser = await userRepository.update(input.userId, input.updates);

  return updatedUser;
}