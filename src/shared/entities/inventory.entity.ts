

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Shipping } from './shipping.entity';
import { AartworkGstSlot, ShippingGstSlot } from 'src/modules/admin/shipping/enums/gst.enum';



 

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Product, (product) => product.productInventory, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id', insert: false, update: false })
productId: number;

  @CreateDateColumn({ name: 'entry_date' })
  entryDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  status: boolean;


  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

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
/*

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Shipping } from './shipping.entity';
import { AartworkGstSlot, ShippingGstSlot } from 'src/modules/admin/shipping/enums/gst.enum';



export enum InventoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD_BY_ARTIST = 'sold_by_artist',
  TRASH = 'trash',
  SOLD_OUT = 'sold_out',
}

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Product, (product) => product.productInventory, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id', insert: false, update: false })
productId: number;

  @CreateDateColumn({ name: 'entry_date' })
  entryDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: InventoryStatus,
    default: InventoryStatus.INACTIVE,
  })
  status: InventoryStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

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
*/