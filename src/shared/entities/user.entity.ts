// src/users/user.entity.ts
import {
  Entity, Index,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable, OneToOne,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { Role } from './role.entity';
 
import { Blog } from './blog.entity';
 
 
import { UsersAddress } from './users-address.entity';
import { BankDetail } from './user-bank-detail.entity';
import { KycDetails } from './user-kyc.entity';
import { UserProfileImage } from './user-profile-image.entity';
 
import { UsersAbout } from './users-about.entity';
import { NgoSite } from './ngo-site.entity';


@Entity('users') 
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 150, nullable: true })
  username?: string;
  
    
  @Column({ type: 'varchar', length: 150, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phonecode?: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
  mobile: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password: string | null;

  @ManyToMany(() => Role, (role) => role.users, { eager: false })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
 
  @Index()
  @Column({ type: 'boolean', nullable: true, })
  is_verified: boolean;

  @Index()
  @Column({ type: 'boolean', default: false, })
  status: boolean;

  @Column({ type: 'boolean', default: false, select: false })
  featured_artist?: boolean;

  @Column({ type: 'boolean', default: false, select: false })
  homePageDisplay?: boolean;
 

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  adminRemark?: string;

  // 🟢 Add relation to Artist test Type
 

  @Column({ type: 'boolean', default: true, select: false })
  termscondition?: boolean;

  @Column({ type: 'boolean', default: true, select: false })
  isSubscribe?: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  createdBy: string;

  @Index()
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Index()
  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Blog, (blog) => blog.author)
  blogs: Blog[];


@OneToOne(() => NgoSite, (site) => site.owner)
site: NgoSite;



  @OneToMany(() => UsersAddress, (address) => address.user, { cascade: true })
  addresses: UsersAddress[];

  @OneToMany(() => BankDetail, (bank) => bank.user)
  bankDetails: BankDetail[];

  @OneToMany(() => UsersAbout, (about) => about.user)
  aboutDetails: UsersAbout;

  @OneToMany(() => KycDetails, (kyc) => kyc.user)
  kycDetails: KycDetails[];

  @OneToOne(() => UserProfileImage, (profileImage) => profileImage.user)
  profileImage: UserProfileImage;

}


/*******
 * 
 * 
 * 
 * Need to delete below coloum
 * 
featured_artist
homePageDisplay
profileEdit
adminRemark
isSubscribe
termscondition
 */