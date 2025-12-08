import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blog_likes')
@Unique(['blog', 'viewerIdentifier'])
export class BlogLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Blog, blog => blog.likes, { onDelete: 'CASCADE' })
  blog: Blog;

  @Column()
  viewerIdentifier: string;

  @CreateDateColumn()
  createdAt: Date;

}