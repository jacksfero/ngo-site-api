import { Entity,Index, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Blog } from './blog.entity';
import { Product } from './product.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToMany(() => Blog, (blog) => blog.tags, )
  blogs: Blog[];

@ManyToMany(() => Product, product => product.tags)
products: Product[]; // Fixed: should be Product[] not Tag[]



}
