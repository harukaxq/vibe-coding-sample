import { register } from '../../features/auth/command/register/handler';
import { login } from '../../features/auth/command/login/handler';
import type { RegisterInput } from '../../features/auth/core/auth';
import type { LoginCommandResult } from '../../features/auth/command/login/core';

export async function registerAndLogin(input: RegisterInput): Promise<LoginCommandResult> {
  // 1. ユーザーを登録
  const user = await register(input);

  // 2. 登録したユーザーで自動ログイン
  const loginResult = await login({
    email: input.email,
    password: input.password,
  });

  return loginResult;
}