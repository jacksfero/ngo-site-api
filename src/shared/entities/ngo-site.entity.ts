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
  OneToMany,
} from 'typeorm';

import { User } from './user.entity';

@Entity('sites')
export class NgoSite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string; // helpngo

  @Column({ length: 200 })
  siteName: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  favicon: string;

  @Column({ nullable: true })
  themeColor: string;

  @Column({ default: true })
  status: boolean;
  // owner of this NGO site
  // ✅ OWNER
  @OneToOne(() => User, (user) => user.ownedSite)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  // ✅ TEAM USERS
  @OneToMany(() => User, (user) => user.site)
  users: User[];

  // @ManyToOne(() => NgoSite, (site) => site.users, { nullable: true })
  // @JoinColumn({ name: 'site_id' })
  // site: NgoSite;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
