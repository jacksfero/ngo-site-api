import {
    Entity,
    Column,
    PrimaryGeneratedColumn,    
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

 
  export enum AddressType {
    BILLING = 'billing',
    SHIPPING = 'shipping',
    PERSONAL = 'personal',   // new
  }

@Entity()
export class UsersAddress {

    @PrimaryGeneratedColumn()
    id: number;
 
    @Column()
    address: string;

    @Column()
    city: string;

    @Column()
    state: string;

    @Column()
    country: string;

    @Column()
    pin: string;

    @Column()
    aadhar: string;

    @Column()
    contact: string;

    @Column()
    GSTIN: string;

    @Column()
    tradeName: string;

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

    @Column({ type: 'enum', enum: AddressType })
    type: AddressType; // 'billing' or 'shipping'

   // User (Relation)
    // @ManyToOne(() => User)
    // @JoinColumn({ name: 'user_id' }) // foreign key in DB need to change name owner_id
    // user: User;

    @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @Column({ name: 'user_id' })
    userId: number;

    @Column({ default: false })
    isDefault: boolean;
}
  