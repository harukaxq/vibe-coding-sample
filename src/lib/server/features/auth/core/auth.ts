export type AuthSession = Readonly<{
  userId: string;
  token: string;
  expiresAt: Date;
}>;

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  name?: string;
};

export function createAuthSession(userId: string): Omit<AuthSession, 'token' | 'expiresAt'> {
  return {
    userId,
  };
}

export function isSessionExpired(session: AuthSession, currentTime: Date): boolean {
  return session.expiresAt < currentTime;
}