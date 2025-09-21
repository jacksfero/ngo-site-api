import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { eager: true })
  product: Product;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // ✅ Final unit price at time of purchase

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number; // ✅ Original price (before discount)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number; // ✅ Discount %

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  gstPct: number; // ✅ GST percentage at time of order

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  gstAmount: number; // ✅ GST value

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number; // ✅ (price - discount + gst) * quantity

  @Column({ nullable: true })
  inventoryId: number; // ✅ Which inventory was used
 
  @Column({ type: 'text', nullable: true })
  productName: string; // ✅ Product name at time of purchase

  // ✅ Calculate total before saving
  calculateTotal(): void {
    const qty = Number(this.quantity) || 0;
    const unitPrice = Number(this.price) || 0;
    const discountPct = Number(this.discount) || 0;
    const gstPct = Number(this.gstPct) || 0;
  
    let total = qty * unitPrice;
  
    if (discountPct > 0) {
      total -= (total * discountPct) / 100;
    }
  
    let gst = 0;
    if (gstPct > 0) {
      gst = (total * gstPct) / 100;
    }
  
    this.gstAmount = gst;
    this.total = total + gst;
  }
}