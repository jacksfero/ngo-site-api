import {Unique,Index, BeforeInsert, BeforeUpdate,Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('medium')
@Unique(['name'])
export class Medium {
  @PrimaryGeneratedColumn()
  id: number;

    @Index()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index()
  @Column({ type: 'boolean', default: false })
  status: boolean; // ✅ correct type: boolean

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

  @BeforeInsert()
  @BeforeUpdate()
  trimName() {
    if (this.name) {
      // Trim and replace multiple spaces with single space
      this.name = this.name.trim().replace(/\s+/g, ' ');
    }
  }
}
