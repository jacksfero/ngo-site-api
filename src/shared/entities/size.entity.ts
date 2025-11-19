import { Entity,Index, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sizes')
export class Size {
  @PrimaryGeneratedColumn()
  id: number;

@Index()
  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  status: boolean; // true = Active, false = Inactive
}
