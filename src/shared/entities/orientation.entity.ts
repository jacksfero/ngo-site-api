import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('orientations')
export class Orientation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  status: boolean;
}
