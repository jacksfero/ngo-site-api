// src/users/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';

import { Role } from 'src/shared/entities/role.entity';
import { Wishlist } from 'src/shared/entities/wishlist.entity';
import { Blog } from './blog.entity';
import { ExhibitionProduct } from './exhibition-product.entity';

//console.log('----User Entiry---------- DEBUG:In User Role is', Role);

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, default: null })
  username: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  mobile: string;

  @Column()
  password: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlists: Wishlist[];

@OneToMany(() => Blog, (blog) => blog.author)
blogs: Blog[];

 @OneToMany(() => ExhibitionProduct, (map) => map.user)
  displayMappings: ExhibitionProduct[];


  @Column({ type: 'boolean', default: true })
  email_verified: boolean;

  @Column({ type: 'boolean', default: 0 })
  status: string;

  @Column({ type: 'varchar', length: 50, default: null })
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
