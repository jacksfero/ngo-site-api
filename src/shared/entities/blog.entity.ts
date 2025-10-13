import { Column, JoinTable,OneToMany, ManyToMany, ManyToOne, Entity, PrimaryGeneratedColumn, Unique, BeforeInsert, BeforeUpdate } from 'typeorm';
 
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { User } from './user.entity';
import { BlogView } from './blog-view.entity';

@Entity('blog')
@Unique(['slug']) // Enforce unique slug
@Unique(['title']) // Enforce unique title
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (category) => category.blogs, { eager: true })
  category: Category;

  @ManyToMany(() => Tag, { eager: true, cascade: true })
  @JoinTable({
    name: 'blog_posts_tags',
    joinColumn: { name: 'blog_post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @ManyToOne(() => User, (user) => user.blogs, { eager: true })
  author: User;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 200, nullable: true, default: null })
  titleImage: string | null;

  @Column({ type: 'varchar', length: 150 })
  slug: string;

  @Column({ type: 'varchar', length: 200 })
  h1Title: string;

  @Column({ default: 0 })
  views: number; // 👈 view counter

   @OneToMany(() => BlogView, (view) => view.blog)
  blogViews: BlogView[];

  @Column({
    type: 'longtext',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  blogContent: string;

  @Column({ type: 'text', nullable: true, default: null})
  keywordsTag: string;
 
  @Column({ type: 'text', nullable: true, default: null })
  descriptionTag: string;
 
  @Column({ type: 'varchar', length: 150, nullable: true, default: null })
  optionalTitle: string;
 
  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

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
      this.title = this.title.trim().replace(/\s+/g, ' ');
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