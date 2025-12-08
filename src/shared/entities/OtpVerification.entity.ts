import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { OtpType,UserType } from '../../modules/auth/dto/start-verification.dto';

@Entity('otp_verifications')
@Index(['identifier', 'type']) // For faster lookup
export class OtpVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  identifier: string; // email or mobile


  @Column({ type: 'enum', enum: UserType })
  userType?: UserType;

  @Column()
  otp: string;

  @Column({ type: 'enum', enum: OtpType })
  type: OtpType;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ default: 0 })
  attempts: number;


  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
