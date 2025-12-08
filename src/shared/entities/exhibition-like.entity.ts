
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
 

@Entity('exhibition_page_likes')
@Unique(['viewerIdentifier'])
export class ExhibitionPageLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  viewerIdentifier: string; // userId / IP / cookie UUID

  @CreateDateColumn()
  createdAt: Date;
}