import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

export enum OrderItemStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { eager: true })
  product: Product;

   @Column({ type: 'enum', enum: OrderItemStatus, default: OrderItemStatus.PENDING })
  status: OrderItemStatus;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  refundId?: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number; // ✅ Final unit price at time of purchase

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  originalPrice: number; // ✅ Original price (before discount)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountPct: number; // ✅ Discount %

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number; // ✅ Discount %

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  gstPct: number; // ✅ GST percentage at time of order

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  gstAmount: number; // ✅ GST value

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shipGstPct: number; // ✅ GST percentage at time of order

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shipGstAmount: number; // ✅ GST value

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingCostOther: number; // ✅ shippingCostOther value in case of isDomestic False

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shipGstAmountOther: number; // ✅ GST Amount in case of isDomestic False

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number; // ✅ (price - discount + gst + shipGst) * quantity

  @Column({ nullable: true })
  inventoryId: number; // ✅ Which inventory was used

   @Column({ nullable: true })
  shippingId: number; // ✅ Which inventory was used
 
  @Column({ type: 'text', nullable: true })
  productName: string; // ✅ Product name at time of purchase



  // ✅ Calculate total before saving
  // ✅ Updated calculation
  // ✅ Calculate total before saving
calculateTotal(exchangeRate = 1, isDomestic = true): void {
  const qty = Number(this.quantity) || 1;
  const baseUnitPrice = Number(this.originalPrice ?? this.price) || 0;

  // 1️⃣ Discount
  const discountAmtPerUnit = (baseUnitPrice * (this.discountPct || 0)) / 100;
  this.discountAmount = discountAmtPerUnit * qty;

  const discountedUnitPrice = baseUnitPrice - discountAmtPerUnit;

  // 2️⃣ Line total (pre-tax, pre-shipping)
  let lineTotal = discountedUnitPrice * qty;

  // 3️⃣ GST on product
  this.gstAmount = (lineTotal * (this.gstPct || 0)) / 100;

  // 4️⃣ Shipping + Shipping GST
  let shippingBase = 0;
  let shipGst = 0;

  if (isDomestic) {
    shippingBase = Number(this.shippingCost) || 0;
    shipGst = (shippingBase * (this.shipGstPct || 0)) / 100;
    this.shipGstAmount = shipGst;
  } else {
    shippingBase = Number(this.shippingCostOther) || 0;
    shipGst = (shippingBase * (this.shipGstPct || 0)) / 100;
    this.shipGstAmountOther = shipGst;
  }

  // 5️⃣ Final total in base currency
  const finalTotal = lineTotal + this.gstAmount + shippingBase + shipGst;

  // 6️⃣ Apply exchange rate → store in order currency
  this.total = finalTotal * exchangeRate;
  this.gstAmount *= exchangeRate;
  this.discountAmount *= exchangeRate;
  if (isDomestic) {
    this.shippingCost = shippingBase * exchangeRate;
    this.shipGstAmount *= exchangeRate;
  } else {
    this.shippingCostOther = shippingBase * exchangeRate;
    this.shipGstAmountOther *= exchangeRate;
  }

  // Save unit price in order currency
  this.price = discountedUnitPrice * exchangeRate;
}
}