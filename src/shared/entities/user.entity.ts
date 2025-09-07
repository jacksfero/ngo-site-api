// src/users/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable,OneToOne,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { Role } from './role.entity';
import { Wishlist } from './wishlist.entity';
import { Blog } from './blog.entity';
import { ExhibitionProduct } from './exhibition-product.entity';
import { Video } from './video.entity';
import { Cart } from './cart.entity';
import { UsersAddress } from './users-address.entity';
import { BankDetail } from './user-bank-detail.entity';
import { KycDetails } from './user-kyc.entity';
import { UserProfileImage } from './user-profile-image.entity';
import { ArtistType } from './artist-type.entity';

 
@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: true  })
  username: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true})
  email: string;

 @Column({ type: 'varchar', length: 50,   nullable: true })
  phonecode: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
  mobile: string;

  @Column({ nullable: false, select: false})
  password: string;

  @ManyToMany(() => Role, (role) => role.users ,{ eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlists: Wishlist[];

  @OneToMany(() => Video, (video) => video.user)
videos: Video[];

@OneToMany(() => Blog, (blog) => blog.author)
blogs: Blog[];

 @OneToMany(() => ExhibitionProduct, (map) => map.user)
  displayMappings: ExhibitionProduct[];

  @Column({ type: 'boolean', nullable: true })
  is_verified: boolean;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'boolean', default: false })
  featured_artist: boolean;

 @Column({ type: 'boolean', default: false })
  homePageDisplay: boolean;

  @Column({ type: 'boolean', default: false })
  profileEdit: boolean;
   
  @Column({ type: 'varchar', length: 255,   nullable: true })
  adminRemark: string;

 // 🟢 Add relation to Artist test Type
 @ManyToOne(() => ArtistType, )
 @JoinColumn({ name: 'artist_type_id' })
 artistType: ArtistType;
  
 @Column({ name: 'artist_type_id', nullable: true })
 artist_type_id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  createdBy: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;



  @OneToMany(() => UsersAddress, (address) => address.user, { cascade: true })
addresses: UsersAddress[];

@OneToMany(() => BankDetail, (bank) => bank.user)
bankDetails: BankDetail[];

@OneToMany(() => KycDetails, (kyc) => kyc.user)
kycDetails: KycDetails[];

@OneToOne(() => UserProfileImage, (profileImage) => profileImage.user)
profileImage: UserProfileImage;

}


