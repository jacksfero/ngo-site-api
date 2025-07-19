import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('surface')
export class Surface {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  surfaceName: string;

  @Column({ type: 'boolean', default: false })
  status: boolean; // ✅ correct type: boolean

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
}
