// src/user-profile-image/entities/user-profile-image.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
@Entity()
export class UserProfileImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  @OneToOne(() => User, (user) => user.profileImage, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
