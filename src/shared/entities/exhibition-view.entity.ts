import { Entity,Index, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
 

@Entity('exhibition_page_views')
@Index(['page'])
@Index(['page', 'viewerIdentifier'])
export class ExhibitionPageView {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  page: string; // 'list' | 'live'

  @Column({ length: 255 })
  viewerIdentifier: string; // IP / cookie / session

  @CreateDateColumn()
  createdAt: Date;
}