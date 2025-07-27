import type { RegisterInput } from '../../core/auth';
import { validateEmail } from '../../../user/core/user';
import { validatePasswordStrength } from '../../policy/authPolicy';

export type RegisterCommandInput = RegisterInput;

export type RegisterCommandError = 
  | { type: 'INVALID_EMAIL' }
  | { type: 'WEAK_PASSWORD'; errors: string[] }
  | { type: 'EMAIL_ALREADY_EXISTS' };

export function validateRegisterInput(input: RegisterCommandInput): RegisterCommandError | null {
  if (!validateEmail(input.email)) {
    return { type: 'INVALID_EMAIL' };
  }

  const passwordValidation = validatePasswordStrength(input.password);
  if (!passwordValidation.isValid) {
    return { type: 'WEAK_PASSWORD', errors: passwordValidation.errors };
  }

  return null;
}

export function buildUserData(input: RegisterCommandInput, hashedPassword: string) {
  return {
    email: input.email,
    hashedPassword,
    name: input.name,
  };
}