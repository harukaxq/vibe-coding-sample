import type { UpdateUserInput } from '../../core/user';
import { validateEmail } from '../../core/user';

export type UpdateProfileCommandInput = {
  userId: string;
  updates: UpdateUserInput;
};

export type UpdateProfileCommandError = 
  | { type: 'INVALID_EMAIL' }
  | { type: 'USER_NOT_FOUND' }
  | { type: 'EMAIL_ALREADY_EXISTS' };

export function validateUpdateProfileInput(input: UpdateProfileCommandInput): UpdateProfileCommandError | null {
  if (input.updates.email && !validateEmail(input.updates.email)) {
    return { type: 'INVALID_EMAIL' };
  }

  return null;
}