import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import type { AuthService } from '../../shared/port/service/authService';

const SESSION_DURATION_HOURS = 24;

// セッション管理用の簡易ストア（本番環境ではRedisなどを使用）
const sessions = new Map<string, { userId: string; expiresAt: Date }>();

export class AuthServiceLucia implements AuthService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async generateSessionToken(): Promise<string> {
    return randomBytes(32).toString('hex');
  }

  async createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
    const token = await this.generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);
    
    sessions.set(token, { userId, expiresAt });
    
    return { token, expiresAt };
  }

  async validateSession(token: string): Promise<{ userId: string } | null> {
    const session = sessions.get(token);
    
    if (!session) {
      return null;
    }
    
    if (session.expiresAt < new Date()) {
      sessions.delete(token);
      return null;
    }
    
    return { userId: session.userId };
  }

  async deleteSession(token: string): Promise<void> {
    sessions.delete(token);
  }
}