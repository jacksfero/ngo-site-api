import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('features')
export class Feature {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;
}