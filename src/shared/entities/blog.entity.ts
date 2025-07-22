import { Column, JoinTable, ManyToMany, ManyToOne, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';

import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { User } from './user.entity';


@Entity('blog')
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

  @Column({
    type: 'longtext', // Correct type for MySQL long text
    charset: 'utf8mb4', // Supports full Unicode including emojis
    collation: 'utf8mb4_unicode_ci',
  })
  blogContent: string;

  @Column({ type: 'varchar', length: 255, default: null })
  keywordsTag: string;

  @Column({ type: 'varchar', length: 255, default: null })
  descriptionTag: string;



  @Column({ type: 'varchar', length: 150, default: null })
  optionalTitle: string;

  @Column({ type: 'varchar', length: 150, default: null })
  titleImageURL: string;

  @Column({ type: Boolean, default: false })
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
    type: 'timestamp', // 👈 Specify column type
    nullable: true, // 👈 Allow NULL in database
    default: null, // 👈 Default value (optional)
  })
  scheduledPublishDate: Date | null; // 👈 Union type with null


}
