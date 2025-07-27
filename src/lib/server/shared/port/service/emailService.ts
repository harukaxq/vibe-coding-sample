export interface EmailService {
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
}