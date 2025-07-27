export type PasswordValidationResult = {
  isValid: boolean;
  errors: string[];
};

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('パスワードには英字を含める必要があります');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('パスワードには数字を含める必要があります');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function canResetPassword(lastResetTime: Date | null, currentTime: Date): boolean {
  if (!lastResetTime) return true;
  
  const hoursSinceLastReset = (currentTime.getTime() - lastResetTime.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastReset > 1; // 1時間に1回まで
}