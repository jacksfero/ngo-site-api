import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('currency')
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  currency: string;

  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({
    type: 'decimal',
    precision: 19, // total digits (including decimals)
    scale: 4, // decimal places
    default: 0.0,
  })
  value: number;

  @Column({ type: 'varchar', default: null })
  icon: string;

  @Column({ type: Boolean, default: 0 })
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
