import {PrimaryGeneratedColumn,Column,JoinColumn,OneToMany,CreateDateColumn,UpdateDateColumn, ManyToOne,Entity } from "typeorm";

import { Order } from "./order.entity";
import { Product } from "./product.entity";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // locked price at checkout
}
