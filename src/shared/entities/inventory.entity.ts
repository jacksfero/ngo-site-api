import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Product } from './product.entity';
  
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
  
    @Column({ nullable: true })
    gstSlot: string; // dropdown, e.g., "5%", "12%", "18%"
  
    @Column({ nullable: true })
    shippingWeight: string; // dropdown, e.g., "0-1kg", "1-5kg"
  
    @Column({ nullable: true })
    shippingSlot: string; // dropdown, e.g., "Standard", "Express"
  
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
  