import { Global, Module } from '@nestjs/common';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';
import { MailListener } from './mail/mail.listener';
import { MailModule } from 'src/shared/mail/mail.module';
import { UserListener } from './user/user.listener';
import { ProductListener } from './product/product.listener';
import { OtpListener } from './otp/otp.listener';
import { ContactListener } from './contact/contact.listener';

@Global()
@Module({
  imports: [
    // ✅ Centralized global event emitter config
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    MailModule, // ✅ Inject mail service here so MailListener can use it
  ],
  providers: [
    MailListener,
    UserListener,ProductListener,OtpListener,ContactListener
    // Future listeners (uncomment as needed)
    // OtpListener,
    // UserListener,
  ],
  exports: [
    EventEmitterModule, // ✅ Makes EventEmitter2 injectable globally
  ],
})
export class EventsModule {
  constructor(private readonly eventEmitter: EventEmitter2) {
    console.log('✅ EventsModule initialized globally');
  }
}
