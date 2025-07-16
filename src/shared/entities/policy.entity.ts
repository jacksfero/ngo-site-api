import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('policy')
export class Policy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  policyDetails: string;

  @Column({ type: 'varchar', length: 255 })
  remarks: string;

  @Column({ type: Boolean, default: false })
  status: boolean;

  @Column({ type: 'int', default: null })
  createdBy: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
