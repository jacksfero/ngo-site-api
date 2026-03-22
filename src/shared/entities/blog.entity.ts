import { Column, Index, JoinTable, OneToMany, ManyToMany, ManyToOne, Entity, PrimaryGeneratedColumn, Unique, BeforeInsert, BeforeUpdate, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { User } from './user.entity';
import { BlogView } from './blog-view.entity';
import { BlogLike } from './blog-like.entity';
import { NgoSite } from './ngo-site.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;


  @ManyToOne(() => Category, (category) => category.blogs, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'blog_posts_tags',
    joinColumn: { name: 'blog_post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];


  @ManyToOne(() => User, (user) => user.blogs)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => NgoSite)
  site: NgoSite;


  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 200, nullable: true, default: null })
  titleImage: string | null;

  @Index(['slug'], { unique: true })
  @Column({ type: 'varchar', length: 200 })
  slug: string;

  @Column({ type: 'varchar', length: 200 })
  h1Title: string;

  @Column({ default: 0 })
  views: number; // 👈 view counter

  @OneToMany(() => BlogView, (view) => view.blog)
  blogViews: BlogView[];

  @Column({ default: 0 })
  likeCount: number;

  @OneToMany(() => BlogLike, (like) => like.blog)
  likes: BlogLike[];


  @Column({
    type: 'longtext',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  blogContent: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  metaKeywords: string;

  @Column({ type: 'text', nullable: true, default: null })
  metaDescription: string;

  @Column({ type: 'varchar', length: 150, nullable: true, default: null })
  metaTitle: string;


  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'scheduled'],
    default: 'draft',
  })
  status: string;

  @Column({ default: false })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @Index()
  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  scheduledPublishDate: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeFields() {
    // Normalize title
    if (this.title) {
      this.title = this.title.trim().replace(/[^a-z0-9-]/g, '');
    }

    // Normalize slug (convert to lowercase and replace spaces with hyphens)
    if (this.slug) {
      this.slug = this.slug.trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');
    }

    // Normalize h1Title
    if (this.h1Title) {
      this.h1Title = this.h1Title.trim().replace(/\s+/g, ' ');
    }
  }
}