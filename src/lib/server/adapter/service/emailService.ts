import type { EmailService } from '../../shared/port/service/emailService';

export class EmailServiceDummy implements EmailService {
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    console.log(`[EmailService] Password reset email would be sent to ${email} with token ${resetToken}`);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    console.log(`[EmailService] Welcome email would be sent to ${email} (${name})`);
  }
}