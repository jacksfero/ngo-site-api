import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { NgoSite } from './ngo-site.entity';
import { User } from './user.entity';
import { ContentStatus } from 'src/modules/admin/content/enums/content.status.enum';
import { PageType } from 'src/modules/admin/content/enums/page.type.enum';

@Entity('content_pages')
@Unique(['site', 'slug']) // 🔥 important (same slug allowed in different sites)
export class ContentPage {

  @PrimaryGeneratedColumn()
  id!: number;

  // 🔑 MULTI-TENANT
  @ManyToOne(() => NgoSite, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site!: NgoSite;
 
  @Index()
  @Column({ length: 200 })
  title!: string;

  @Index()
  @Column({ length: 200 })
  slug: string; // about-us, terms, privacy

  @Column({
    type: 'enum',
    enum: PageType,
    default: PageType.ABOUT,
  })
  type:PageType = PageType.ABOUT;

  @Column({
    type: 'longtext',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  content!: string;

  // SEO
  @Column({ nullable: true })
  metaTitle!: string;

  @Column({ nullable: true })
  metaDescription!: string;

  @Column({ nullable: true })
  keywords!: string;

  // publish control
  @Index()
@Column({
  type: 'enum',
  enum: ContentStatus,
  default: ContentStatus.UNPUBLISHED,
})
status: ContentStatus = ContentStatus.UNPUBLISHED;

  @Column({ default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

 
 @ManyToOne(() => User, { nullable: true })
@JoinColumn({ name: 'created_by' })
createdBy: User;

@ManyToOne(() => User, { nullable: true })
@JoinColumn({ name: 'updated_by' })
updatedBy: User;
}