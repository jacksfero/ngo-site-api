import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  key: string; // S3 object key

  @Column({ length: 512 })
  url: string; // public URL (S3 or CDN)

  @Column({ length: 255, nullable: true })
  filename?: string;

  @Column({ length: 50, nullable: true })
  mimeType?: string;

  @Column({ type: 'int', nullable: true })
  size?: number;

  @Column({ nullable: true })
  altText?: string;

  @Column({ nullable: true })
  title?: string;

  @CreateDateColumn()
  createdAt: Date;
}
