
import { Entity,Index, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
 

@Entity('exhibition_page_likes')
@Index(['page'])
@Index(['page', 'viewerIdentifier'], { unique: true }) // ✅ one like per user per page
export class ExhibitionPageLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  page: string; // 'list' | 'live'

  @Column({ length: 255 })
  viewerIdentifier: string; // userId / IP / cookie UUID

  @CreateDateColumn()
  createdAt: Date;
}