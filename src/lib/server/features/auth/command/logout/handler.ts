import { AuthServiceLucia } from '../../../../adapter/service/authService.lucia';

const authService = new AuthServiceLucia();

export async function logout(token: string): Promise<void> {
  await authService.deleteSession(token);
}