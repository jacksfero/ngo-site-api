import { Entity,PrimaryGeneratedColumn ,Column} from "typeorm";

@Entity()
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
