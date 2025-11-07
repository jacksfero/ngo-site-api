import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { OtpVerification } from '../entities/OtpVerification.entity';

@Injectable()
export class OtpCronService {
  private readonly logger = new Logger(OtpCronService.name);

  constructor(
    @InjectRepository(OtpVerification)
    private readonly otpRepo: Repository<OtpVerification>,
  ) {}

  // ✅ Run every hour (adjust if needed)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredOtps() {
    const now = new Date();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await this.otpRepo.delete({
      expiresAt: LessThan(cutoff),
    });

    if (result.affected && result.affected > 0) {
      this.logger.log(`🧹 Deleted ${result.affected} expired OTPs`);
    } else {
      this.logger.log(`✅ No expired OTPs found`);
    }
  }
}
