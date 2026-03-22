// src/sites/ngo-site.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('ngo_sites')
export class NgoSite {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 200 })
  domain: string;

  @Column({ length: 200 })
  siteName: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  favicon: string;

  @Column({ nullable: true })
  themeColor: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  about: string;

  @Column({ default: true })
  status: boolean;

  // owner of this NGO site
  @OneToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}