import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Index } from 'typeorm';

import { Role } from './role.entity'; // For runtime (if absolutely needed)

// console.log(Role); // Now works (but avoid in entities)

// console.log(
//   '------Permission Entity--------- DEBUG: In Permission Roles is',
//   Role,
// );

@Index(['resource', 'action'], { unique: true })
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Example: 'create_user', 'delete_post'

  @Column()
  description: string;

  @Column()
  resource: string; // Example: 'user', 'post'

  @Column()
  action: string; // Example: 'create', 'read', 'update', 'delete'

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}



/*******
 * 
 Recommended NGO Permission Structure

 users.create
users.read
users.update
users.delete

campaigns.create
campaigns.update
campaigns.delete

donations.view
donations.approve

blogs.create
blogs.update
blogs.delete


Guards Implementation (Important)

@UseGuards(PermissionsGuard)
@Permissions('campaign', 'create')


 */