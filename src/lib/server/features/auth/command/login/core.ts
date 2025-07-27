import type { LoginCredentials } from '../../core/auth';
import { validateEmail } from '../../../user/core/user';

export type LoginCommandInput = LoginCredentials;

export type LoginCommandResult = {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  session: {
    token: string;
    expiresAt: Date;
  };
};

export type LoginCommandError = 
  | { type: 'INVALID_EMAIL' }
  | { type: 'INVALID_CREDENTIALS' };

export function validateLoginInput(input: LoginCommandInput): LoginCommandError | null {
  if (!validateEmail(input.email)) {
    return { type: 'INVALID_EMAIL' };
  }

  return null;
}