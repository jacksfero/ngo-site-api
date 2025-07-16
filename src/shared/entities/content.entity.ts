import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  contents: string;

  @Column({ type: 'varchar', length: 255 })
  remarks: string;

  @Column({ type: Boolean, default: false })
  status: boolean;

  @Column({ type: 'int', default: null })
  createdBy: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
