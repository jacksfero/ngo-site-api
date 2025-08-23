import {PrimaryGeneratedColumn,Column,JoinColumn,OneToMany,CreateDateColumn,UpdateDateColumn, ManyToOne,Entity } from "typeorm";
 
import { User } from "./user.entity";
import { OrderItem } from "./order-item.entity";
import { UsersAddress } from "./users-address.entity";
import { Payment } from "./payment.entity";

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}
  
  @Entity()
  export class Order {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];
  
    @ManyToOne(() => UsersAddress, { nullable: true })
    @JoinColumn({ name: 'shipping_address_id' })
    shippingAddress: UsersAddress;
   
    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Payment, (payment) => payment.order)
payments: Payment[];
  }
  