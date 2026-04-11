// src/sites/site-setting.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';

import { NgoSite } from './ngo-site.entity';

@Entity('site_settings')
@Index(['site', 'key'], { unique: true })
export class SiteSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => NgoSite)
  site: NgoSite;

  @Column()
  key: string;

  @Column('text')
  value: string;
}
