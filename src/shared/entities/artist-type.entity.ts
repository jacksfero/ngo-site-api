import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('artist_type')
export class ArtistType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  status: boolean; // true = Active, false = Inactive
}
