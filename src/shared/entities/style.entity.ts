import { Entity, PrimaryGeneratedColumn, Column, Unique, BeforeInsert, BeforeUpdate } from 'typeorm';

@Entity()
@Unique(['title']) // Enforces unique title at database level
export class Style {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  updatedBy: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeTitle() {
    if (this.title) {
      // Trim and clean up title
      this.title = this.title.trim().replace(/\s+/g, ' ');
    }
  }
}