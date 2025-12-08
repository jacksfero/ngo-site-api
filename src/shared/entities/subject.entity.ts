import { Entity,Index, PrimaryGeneratedColumn, Column, Unique, BeforeInsert, BeforeUpdate, ManyToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('subject')
@Unique(['subject']) // Enforces unique subject at database level
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

 
  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Index()
  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  updatedBy: string;

  @Index()
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Index()
  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToMany(() => Product, (product) => product.subjects)
  products: Product[];

  @BeforeInsert()
  @BeforeUpdate()
  normalizeSubject() {
    if (this.subject) {
      // Trim and clean up subject
      this.subject = this.subject.trim().replace(/\s+/g, ' ');
    }
  }
}