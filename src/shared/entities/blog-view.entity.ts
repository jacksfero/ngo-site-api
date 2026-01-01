import { Entity,Index, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blog_views')
@Index(['blog'])
export class BlogView {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Blog, (blog) => blog.blogViews, { onDelete: 'CASCADE' })
  blog: Blog;

  @Column()
  viewerIdentifier: string; // could be userId or IP

  @CreateDateColumn()
  viewedAt: Date;
}
