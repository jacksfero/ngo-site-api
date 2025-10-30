import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { MailService } from 'src/shared/mail/mail.service';
import { User } from 'src/shared/entities/user.entity';

@Injectable()
export class UserListener {
  private readonly logger = new Logger(UserListener.name);

  constructor(
    private readonly mailService: MailService,
    private readonly eventEmitter: EventEmitter2, // to emit other events like mail.send
  ) {}

  /**
   * 🔹 Triggered when a new user is created
   */
  @OnEvent('user.created')
  async handleUserCreated(user: User) {
    this.logger.log(`👤 New user created: ${user.email}`);

    // 1️⃣ Emit mail.send event (recommended pattern)
    this.eventEmitter.emit('mail.send', {
      to: user.email,
      subject: '🎉 Welcome to IndiGalleria!',
      template: 'welcome',
      context: { name: user.username },
    });

    // OR 2️⃣ Directly send via MailService (if you prefer inline)
    // await this.mailService.sendTemplateEmail({
    //   to: user.email,
    //   subject: '🎉 Welcome to IndiGalleria!',
    //   template: 'welcome',
    //   context: { name: user.fullName },
    // });
  }

  /**
   * 🔹 Triggered when a user updates profile
   */
  @OnEvent('user.updated')
  async handleUserUpdated(user: User) {
    this.logger.log(`📝 User updated: ${user.email}`);
    // Optional: Send notification or audit log
  }

  /**
   * 🔹 Triggered when a user is deleted
   */
  @OnEvent('user.deleted')
  async handleUserDeleted(user: User) {
    this.logger.log(`❌ User deleted: ${user.email}`);
    // Optional: Cleanup or farewell email
  }
}
