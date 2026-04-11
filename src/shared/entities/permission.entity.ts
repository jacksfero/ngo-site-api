import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Index } from 'typeorm';

import { Role } from './role.entity'; // For runtime (if absolutely needed)

@Index(['resource', 'action'], { unique: true })
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column() 
  name: string; // Example: 'create_user', 'delete_post'

  @Column({ length: 100 })
  resource!: string; // user, blog, content

  @Column({ length: 50 })
  action!: string; // create, read, update, delete

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];
}