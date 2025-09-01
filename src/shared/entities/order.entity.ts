import {PrimaryGeneratedColumn,Index,Column,JoinColumn,OneToMany,CreateDateColumn,UpdateDateColumn, ManyToOne,Entity } from "typeorm";
 
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
@Index(['user', 'status']) // Composite index for better query performance
@Index(['createdAt']) // Index for date-based queries
  export class Order {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @Column({ nullable: true })
    @Index()
    orderNumber: string; // ✅ Unique order identifier for customers


     @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true // Auto-load items with order
  })
  items: OrderItem[];
  
  @ManyToOne(() => UsersAddress, { eager: true, nullable: true })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: UsersAddress;

  @ManyToOne(() => UsersAddress, { eager: true, nullable: true })
  @JoinColumn({ name: 'billing_address_id' })
  billingAddress: UsersAddress; // ✅ Separate billing address
   
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;
  
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number; // ✅ Items total before shipping and tax
 
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingCost: number; // ✅ Shipping cost

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number; // ✅ Tax amount

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number; // ✅ Final total (subtotal + shipping + tax)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number; // ✅ Total discount applied

  @Column({ nullable: true })
  trackingNumber: string; // ✅ Shipping tracking number
  
  @Column({ nullable: true })
  carrier: string; // ✅ Shipping carrier (FedEx, UPS, etc.)

  @Column({ type: 'text', nullable: true })
  notes: string; // ✅ Order notes/comments

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date; // ✅ When order was shipped

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date; // ✅ When order was delivered

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date; // ✅ When order was cancelled

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Payment, (payment) => payment.order, { eager: true })
  payments: Payment[];

   // ✅ Add these payment-related fields
   @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
   paymentStatus: PaymentStatus;


   @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  refundAmount: number;

   // ✅ Virtual property for order status history (optional)
   @Column({ type: 'json', nullable: true })
   statusHistory: Array<{
     status: OrderStatus;
     timestamp: Date;
     note?: string;
   }>;
 
   // ✅ Helper method to generate order number
   generateOrderNumber(): void {
     if (!this.orderNumber) {
       const timestamp = new Date().getTime();
       const random = Math.floor(Math.random() * 1000);
       this.orderNumber = `ORD-${timestamp}-${random}`;
     }
   }
 
   // ✅ Calculate totals before saving
   calculateTotals(): void {
     this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
     this.totalAmount = this.subtotal + this.shippingCost + this.taxAmount - this.discountAmount;
   }

 // ✅ Helper method to update payment status
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
  