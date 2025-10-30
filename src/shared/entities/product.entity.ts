import { Wishlist } from 'src/shared/entities/wishlist.entity';
import { Column, Unique,OneToMany, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { ExhibitionProduct } from './exhibition-product.entity';
import { ProductImage } from './product-image.entity';
import { ContactUs } from './contactus.entity';
import { Inventory } from './inventory.entity';
import { Productcategory } from './productcategory.entity';
import { PackingModeEntity } from './packing-mode.entity';
import { CommissionType } from './commission-type.entity';
import { ShippingTime } from './shipping-time.entity';
import { Size } from './size.entity';
import { Orientation } from './orientation.entity';
import { Subject } from './subject.entity';
import { Style } from './style.entity';
import { Medium } from './medium.entity';
import { Surface } from './surface.entity';
import { Tag } from './tag.entity';


export enum ProductStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive', 
  SOLD_OUT = 'Sold_Out',
  SOLD_BY_ARTIST = 'Sold_by_Artist',
  TRASH = 'Trash'
}

export enum PriceOnDemand {
  DISPLAY_PRICE = '0',
  PRICE_ON_DEMAND = '1',
  CONTACT_FOR_THIS_ART = '2',
}

@Entity()
@Unique(['slug']) // Enforce unique slug
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ Product Title & Description
  @Column({ type: 'varchar', length: 150 })
  productTitle: string;

  @Column({ type: 'text',  nullable: true })
  description: string|null; 

  @Column({ type: 'varchar', length: 150,default: null  })
  slug: string;

   // ✅ Optional Integer fields
  @Column({ type: 'int', nullable: true })
  artist_price: number;
 
  
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  width: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  height: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  depth: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  weight: number;
 
  @Column({ type: 'int', nullable: true })
  created_in: number;

  /*@Column({ type: 'int', nullable: true })
  exhibition_id: number;*/

  
  // ✅ Boolean Flags
  @Column({ type: 'boolean', default: false })
  original_painting: boolean;

  @Column({ type: 'boolean', default: false })
  new_arrival: boolean;

  @Column({ type: 'boolean', default: false })
  eliteChoice: boolean;

  @Column({ type: 'boolean', default: false })
  affordable_art: boolean;
 
   @Column({
    type: 'enum',
    enum: PriceOnDemand,
    default: PriceOnDemand.DISPLAY_PRICE
  })
  price_on_demand: PriceOnDemand;

  @Column({ type: 'boolean', default: false })
  negotiable: boolean;

  @Column({ type: 'boolean', default: false })
  printing_rights: boolean;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @Column({ type: 'boolean', default: false })
  refundable: boolean;

  @Column({ type: 'boolean', default: false })
  certificate: boolean;

  @Column({ type: 'boolean', default: false })
  is_lock: boolean;

  @Column({ type: 'boolean', default: true })
  terms_and_conditions: boolean;

  /*@Column({ type: 'boolean', default: false })
  inventory: boolean;*/

    // @Column({ type: 'boolean', default: false })
    // status: boolean;

   // ✅ Add status field with enum
   @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.INACTIVE
  })
  is_active: ProductStatus;

  // ✅ Remarks & Conditions
  @Column({ type: 'text', nullable: true })
  remark_to_indigalleria: string;

  @Column({ type: 'text', nullable: true })
  remark_to_artist: string;

  @Column({ type: 'text', nullable: true })
  conditions: string;
 
  // ✅ Audit Trail
  @Column({ type: 'int', nullable: true })
  createdBy: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'int', nullable: true })
  updatedBy: number;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;


@Column({ type: 'varchar', length: 255, nullable: true })
defaultImage: string | null;


@Column({ type: 'varchar', length: 150, nullable: true })
alt_text: string | null;


 @OneToMany(() => ProductImage, (image) => image.product, { cascade: true, /*eager: true*/ })
images: ProductImage[];


  // ✅ Relations
  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlists: Wishlist[];

  @OneToMany(() => ExhibitionProduct, (map) => map.product)
  displayMappings: ExhibitionProduct[];

 
@OneToOne(() => Inventory, (inventory) => inventory.product, { cascade: true })
productInventory: Inventory;
 

// ✅ Owner (Relation)
@ManyToOne(() => User )
@JoinColumn({ name: 'owner_id' }) // foreign key in DB need to change name owner_id
owner: User;

  // ✅ Category (Relation)
@ManyToOne(() => Productcategory)
@JoinColumn({ name: 'category_id' }) // foreign key in DB need to change name owner_id
category: Productcategory;

// ✅ Artist (Relation)
@ManyToOne(() => User, (user) => user.products,)
@JoinColumn({ name: 'artist_id' }) // foreign key in DB need to change name owner_id
artist: User;


// 👇 Medium Mode
@ManyToOne(() => Medium,  { nullable: true, onDelete: 'SET NULL'  }) 
@JoinColumn({ name: 'medium_id' })
medium: Medium|null;

// @Column({ name: 'medium_id', nullable: true })
// mediumId: number;

// 👇 Surface Mode
@ManyToOne(() => Surface,   { nullable: true, onDelete: 'SET NULL'  }) 
@JoinColumn({ name: 'surface_id' })
surface: Surface|null;
 
// @Column({ name: 'surface_id', nullable: true })
// surfaceId: number;


// 👇 Packing Mode
@ManyToOne(() => PackingModeEntity, ) 
@JoinColumn({ name: 'packing_mode_id' })
packingMode: PackingModeEntity;

@Column({ name: 'packing_mode_id', nullable: true })
packingModeId: number;

// 👇 Commission Type
@ManyToOne(() => CommissionType,  )
@JoinColumn({ name: 'commission_type_id' })
commissionType: CommissionType;

@Column({ name: 'commission_type_id', nullable: true })
commissionTypeId: number;

// 👇 Shipping Time
@ManyToOne(() => ShippingTime, )
@JoinColumn({ name: 'shipping_time_id' })
shippingTime: ShippingTime;

@Column({ name: 'shipping_time_id', nullable: true })
shippingTimeId: number;
 
 // 🟢 Add relation to Size
 @ManyToOne(() => Size, )
 @JoinColumn({ name: 'size_id' })
 size: Size;
 
 @Column({ name: 'size_id', nullable: true })
 size_id: number;

 // 🟢 Orientation
 @ManyToOne(() => Orientation,  )
 @JoinColumn({ name: 'orientation_id' })
 orientation: Orientation;

 @Column({ name: 'orientation_id', nullable: true })
 orientation_id: number;

 @ManyToMany(() => Subject,subject => subject.products,  )
 @JoinTable({
   name: 'products_subject',
   joinColumn: { name: 'product_id', referencedColumnName: 'id' },
   inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
 })
 subjects: Subject[];
 
  @ManyToMany(() => Style, style => style.products,  )
  @JoinTable({
    name: 'products_style',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'style_id', referencedColumnName: 'id' },
  })
  styles: Style[];

@ManyToMany(() => Tag, tag => tag.products)
@JoinTable({
  name: 'products_tag',
  joinColumn: { name: 'product_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
})
tags: Tag[];
 
}
  
/*
🔧 What You Should Do Now:

    ✅ Make sure you remove the raw owner_id column (since you're using relation).

    ✅ You can add similar @ManyToOne for artist, category, size, medium, etc., if you want full relation support later.

    ✅ You can add DTOs and services as needed.

    */
