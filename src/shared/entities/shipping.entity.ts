import { Column, OneToOne,Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Inventory } from './inventory.entity';

@Entity('shipping')
export class Shipping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  weightSlot: string;

  @Column({
    type: 'decimal',
    precision: 18, // total digits (including decimals)
    scale: 2, // decimal places
    default: 0.0,
  })
  costINR: number;

  @Column({
    type: 'decimal',
    precision: 18, // total digits (including decimals)
    scale: 2, // decimal places
    default: 0.0,
  })
  CostOthers: number;

 @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  updatedBy: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;


  @OneToOne(() => Inventory, (inventory) => inventory.shippingWeight, { cascade: true })
  shippingInventory: Inventory;
}
