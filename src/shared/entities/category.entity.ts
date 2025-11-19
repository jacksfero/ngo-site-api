import { Entity,Index, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Blog } from './blog.entity';

@Entity('categories')
@Index(['name'])   // 🔍 Faster searching
@Index(['slug'])   // 🔍 Faster slug URL lookup
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  createdBy: string;

  @Column({ type: Boolean, default: false })
  status: boolean;

  @OneToMany(() => Blog, (blog) => blog.category)
blogs: Blog[];
}
