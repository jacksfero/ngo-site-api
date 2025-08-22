// shared/entities/packing-mode.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('packing_modes')
export class PackingModeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // e.g. Rolled, Boxed, Framed

  @Column({ default: true })
  isActive: boolean;
}
