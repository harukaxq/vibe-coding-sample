export interface AuthService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  generateSessionToken(): Promise<string>;
  createSession(userId: string): Promise<{ token: string; expiresAt: Date }>;
  validateSession(token: string): Promise<{ userId: string } | null>;
  deleteSession(token: string): Promise<void>;
}