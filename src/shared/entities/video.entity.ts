import { ManyToOne, JoinColumn, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';


@Entity('video')
export class Video {


    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' }) // creates `user_id` foreign key in DB
    user: User;

    @Column({ type: 'varchar', length: 50, nullable: true })
    videoUrl: string;

    @Column({ type: 'boolean', default: false })
    status: boolean;

    @Column({ type: 'varchar', length: 50, nullable: true })
    createdBy: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    updatedBy: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
