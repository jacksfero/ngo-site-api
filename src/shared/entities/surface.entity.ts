import { BeforeInsert,Index, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';


@Entity('surface')
@Unique(['surfaceName'])
export class Surface {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  surfaceName: string;

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
  trimSurfaceName() {
    if (this.surfaceName) {
      // Trim and replace multiple spaces with single space
      this.surfaceName = this.surfaceName.trim().replace(/\s+/g, ' ');
    }
  }
}
