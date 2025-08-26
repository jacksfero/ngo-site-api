import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
  
  @Entity('payments')
  export class Payment {
    @PrimaryGeneratedColumn()
    id: number;
  
    // ✅ Relation with Order
    @ManyToOne(() => Order, (order) => order.payments, { eager: true })
    @JoinColumn({ name: 'order_id' })
    order: Order;
  
    @Column({ name: 'order_id' })
    orderId: number;
  
    // ✅ Relation with User (who paid)
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @Column({ name: 'user_id' })
    userId: number;
  
    // ✅ Payment Gateway Info
    @Column({ nullable: true })
    txnId: string; // PayUMoney transaction id

   
  
    @Column({ nullable: true })
    paymentGateway: string; // 'PayUMoney' | 'Razorpay' | 'PayPal'
  
    @Column({ default: 'INR' })
  currency: string;

  @Column({ type: 'json', nullable: true })
  meta: any;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;
  
    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus; // pending | success | failed
  
    @Column({ type: 'json', nullable: true })
    gatewayResponse: any; // full PayUMoney response for debugging
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }
  