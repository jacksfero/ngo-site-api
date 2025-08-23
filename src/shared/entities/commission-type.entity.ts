// shared/entities/commission-type.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('commission_types')
export class CommissionType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string; // e.g. "25 % Commission"

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentage: number; // e.g. 25.00

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;
}
