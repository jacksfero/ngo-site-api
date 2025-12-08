

import {
  Entity,Index,
  PrimaryGeneratedColumn,
  Column,ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Shipping } from './shipping.entity';
 import { AartworkGstSlot, ShippingGstSlot } from '../../modules/admin/shipping/enums/gst.enum';
 

export enum InventoryStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD_OUT = 'sold_out',
  DISCONTINUED = 'discontinued',
  ARCHIVED = 'archived',
}
 
@Entity()
@Index('idx_inventory_price', ['price'])
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

 
  // ✅ FIXED: Change to Many-to-One (one product, multiple inventory records)
  @ManyToOne(() => Product, (product) => product.productInventory, { 
    eager: true,
    onDelete: 'CASCADE' // Delete inventory when product is deleted
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Index()
  @Column({ name: 'product_id' })
  productId: number; // ✅ Keep productId for easier queries

  @CreateDateColumn({ name: 'entry_date' })
  entryDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Index()
  @Column({ type: 'boolean', default: false })
  status: boolean;

   @Index()
  @Column({ type: 'int', default: 0 })
  quantity: number; // ✅ CRITICAL: Stock quantity

  @Index()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

 @Index()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount: number; // % discount or absolute value, depending on logic

  @Column({ type: 'int', nullable: true })
  gstSlot: AartworkGstSlot; // dropdown, e.g., "5%", "12%", "18%"

  @ManyToOne(() => Shipping, (shipping) => shipping.shippingInventory, { eager: true })
  @JoinColumn({ name: 'shipping_id' })
  shippingWeight: Shipping;

  @Column({ type: 'int', nullable: true })
  shippingSlot: ShippingGstSlot; // dropdown, e.g., "Standard", "Express"

  
  @Column({ type: 'text', nullable: true })
termsAndConditions: string;


@CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

 // ✅ Audit Trail
 @Column({ type: 'int', nullable: true })
 createdBy: number;

 @Column({ type: 'int', nullable: true })
 updatedBy: number;


}
  