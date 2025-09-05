import {
    Entity,
    Column,
    PrimaryGeneratedColumn,    
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { text } from 'stream/consumers';


@Entity()
export class UsersAbout {

    @PrimaryGeneratedColumn()
    id: number;

   // User (Relation)
    @ManyToOne(() => User)
    @JoinColumn({ name: 'owner_id' }) // foreign key in DB need to change name owner_id
    user: User;

    @Column({type:'text',nullable: true })
    about: string;

    @Column({type:'text',nullable: true })
    awards: string;

    @Column({type:'text',nullable: true })
    shows: string;

    @Column({type:'text',nullable: true })
    exhibition: string;

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

/**
 * 
 * 

const about = await usersAboutRepo.findOne({
  where: { user: { id: userId } },
  relations: ['user'],
});


export class UsersAboutDto {
  @Expose()
  about: string;

  @Expose()
  awards: string;

  @Expose()
  shows: string;

  @Expose()
  exhibition: string;
}

return plainToInstance(UsersAboutDto, about, { excludeExtraneousValues: true });

async getArtistAbout(userId: number): Promise<UsersAboutDto | null> {
  const about = await this.usersAboutRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!about) return null;

  return plainToInstance(UsersAboutDto, about, { excludeExtraneousValues: true });
}

 */