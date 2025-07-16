import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { Category } from 'src/modules/admin/blog/enums/category.enum';

@Entity('blog')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Category,
    default: Category.TECHNOLOGY,
  })
  categoryId: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

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

  @Column({ type: 'varchar', length: 100, default: null })
  tags: string;

  @Column({ type: 'varchar', length: 150, default: null })
  optionalTitle: string;

  @Column({ type: 'varchar', length: 150, default: null })
  titleImageURL: string;

  @Column({ type: Boolean, default: false })
  status: boolean;

  @Column({ default: false })
  @Expose({ groups: ['admin'] })
  isPublished: boolean;

  @Column({ type: 'int', default: null })
  createdBy: string;

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
