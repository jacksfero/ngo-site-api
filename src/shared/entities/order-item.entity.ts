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
  price: number; // ✅ Price at time of purchase

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number; // ✅ Original price before discount

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number; // ✅ Discount percentage

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number; // ✅ price * quantity

  @Column({ nullable: true })
  inventoryId: number; // ✅ Which inventory was used

  @Column({ nullable: true })
  sku: string; // ✅ Product SKU at time of purchase

  @Column({ type: 'text', nullable: true })
  productName: string; // ✅ Product name at time of purchase

  // ✅ Calculate total before saving
  calculateTotal(): void {
    this.total = this.price * this.quantity;
  }
}