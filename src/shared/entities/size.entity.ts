import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sizes')
export class Size {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  status: boolean; // true = Active, false = Inactive
}
