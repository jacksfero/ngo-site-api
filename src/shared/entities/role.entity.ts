// src/roles/role.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';
import { NgoSite } from './ngo-site.entity';


@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ length: 100 })
  name!: string; // admin, editor, volunteer

  @Column({ nullable: true })
  description?: string;

  // 🔥 MULTI-TENANT
  @ManyToOne(() => NgoSite, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site: NgoSite;

 
  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true, // ✅ good for RBAC
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[];
}