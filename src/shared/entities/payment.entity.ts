import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  UPI = 'UPI',
  NETBANKING = 'NETBANKING',
  WALLET = 'WALLET',
  COD = 'COD', // Cash on Delivery
}

@Entity('payments')
@Index(['txnId']) // For faster lookup by transaction ID
@Index(['order', 'status']) // For order payment status queries
@Index(['user', 'createdAt']) // For user payment history
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ Relation with Order
  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'CASCADE' })
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
  @Column({ nullable: true, unique: true })
  txnId: string; // Payment gateway transaction ID

  @Column({ nullable: true })
  paymentGateway: string; // 'PayUMoney', 'Razorpay', 'PayPal', 'Stripe'

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod; // How customer paid

  @Column({ default: 'INR' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  refundAmount: number; // ✅ Track refunds

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  failureReason: string; // ✅ Why payment failed

  @Column({ type: 'json', nullable: true })
  gatewayResponse: any; // Raw gateway response

  @Column({ type: 'json', nullable: true })
  meta: any; // Additional metadata

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date; // ✅ When payment was successful

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date; // ✅ When refund was processed

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ✅ Helper methods
  markAsSuccess(txnId: string, gatewayResponse: any): void {
    this.status = PaymentStatus.SUCCESS;
    this.txnId = txnId;
    this.gatewayResponse = gatewayResponse;
    this.paidAt = new Date();
  }

  markAsFailed(reason: string, gatewayResponse: any): void {
    this.status = PaymentStatus.FAILED;
    this.failureReason = reason;
    this.gatewayResponse = gatewayResponse;
  }

  processRefund(amount: number): void {
    this.refundAmount = amount;
    this.refundedAt = new Date();
    this.status = amount === this.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
  }
}