import {
  PrimaryGeneratedColumn,
  Index,
  Column,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Entity
} from "typeorm";

import { User } from "./user.entity";
import { OrderItem } from "./order-item.entity";
import { UsersAddress } from "./users-address.entity";
import { Payment, PaymentStatus } from "./payment.entity";

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  @Index()
  orderNumber: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true
  })
  items: OrderItem[];

  @ManyToOne(() => UsersAddress, { eager: true, nullable: true })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: UsersAddress;

  @ManyToOne(() => UsersAddress, { eager: true, nullable: true })
  @JoinColumn({ name: 'billing_address_id' })
  billingAddress: UsersAddress;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  shippingGstPct: number; // ✅ Added to mirror cart shipping GST

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingGstAmount: number; // ✅ GST value for shipping

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ nullable: true })
  carrier: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Payment, (payment) => payment.order, { eager: true })
  payments: Payment[];

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  refundAmount: number;

  @Column({ type: 'json', nullable: true })
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: Date;
    note?: string;
  }>;

  generateOrderNumber(): void {
    if (!this.orderNumber) {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 1000);
      this.orderNumber = `IGORD-${timestamp}-${random}`;
    }
  }

  calculateTotals(): void {
    const subtotal = this.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const taxAmount = this.items.reduce((sum, item) => sum + (Number(item.gstAmount) || 0), 0);
  
    const shipping = Number(this.shippingGstPct) || 0;
    const shippingGst = Number(this.shippingGstAmount) || 0;
  
    this.subtotal = subtotal;
    this.taxAmount = taxAmount;
    this.shippingGstPct = shipping;
    this.shippingGstAmount = shippingGst;
    this.totalAmount = subtotal + taxAmount + shipping + shippingGst;
  }

  updatePaymentStatus(payment: Payment): void {
    if (payment.status === PaymentStatus.SUCCESS) {
      this.paymentStatus = PaymentStatus.SUCCESS;
      this.paidAt = new Date();
      this.amountPaid = payment.amount;
    } else if (payment.status === PaymentStatus.FAILED) {
      this.paymentStatus = PaymentStatus.FAILED;
    } else if ([PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED].includes(payment.status)) {
      this.refundAmount = payment.refundAmount;
    }
  }
}