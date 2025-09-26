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
  subtotal: number; //(sum of item base prices – discounts, without tax)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number; //(sum of all item GST + shipping GST)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;  //total Discount AMount

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;  // subtotal + Tax Amount

  @Column({ length: 3, default: 'INR' })
currency: string;

  @Column('decimal', { precision: 10, scale: 4, default: 1 })
  exchangeRate: number; // INR → selected currency

@Column({ length: 2, nullable: true })
country: string;

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
  if (!this.items || this.items.length === 0) {
    this.subtotal = 0;
    this.discountAmount = 0;
    this.taxAmount = 0;
    this.totalAmount = 0;
    return;
  }

  // 1️⃣ Subtotal before tax/shipping (sum of discounted product totals)
  const subtotal = this.items.reduce(
    (sum, item) => {
      const unitPrice = Number(item.originalPrice ?? item.price) || 0;
      const lineTotal = unitPrice * (item.quantity || 1);
      return sum + lineTotal;
    },
    0,
  );

  // 2️⃣ Discounts
  const discountAmount = this.items.reduce(
    (sum, item) => sum + (Number(item.discountAmount) || 0),
    0,
  );

  // 3️⃣ GST on products
  const productTax = this.items.reduce(
    (sum, item) => sum + (Number(item.gstAmount) || 0),
    0,
  );

  // 4️⃣ Shipping + GST
  const shippingTotal = this.items.reduce(
    (sum, item) => sum + (Number(item.shippingCost) || 0),
    0,
  );

  const shippingTax = this.items.reduce(
    (sum, item) => sum + (Number(item.shipGstAmount) || 0),
    0,
  );

  // 5️⃣ Final aggregation
  this.subtotal = subtotal - discountAmount; // Net products
  this.discountAmount = discountAmount;
  this.taxAmount = productTax + shippingTax;
  this.totalAmount = this.subtotal + this.taxAmount + shippingTotal;
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