import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
 

@Entity('exhibition_page_views')
@Unique(['viewerIdentifier'])
export class ExhibitionPageView {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  viewerIdentifier: string;

  @CreateDateColumn()
  createdAt: Date;
}