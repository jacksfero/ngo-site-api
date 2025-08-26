import { Wishlist } from 'src/shared/entities/wishlist.entity';
import { Column, OneToMany, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, ManyToMany, JoinTable } from 'typeorm';
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

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ Product Title & Description
  @Column({ type: 'varchar', length: 150 })
  productTitle: string;

  @Column({ type: 'varchar', length: 150 })
  description: string;


  // ✅ Optional Integer fields
  @Column({ type: 'int', nullable: true })
  artist_price: number;

 /* @Column({ type: 'int', nullable: true })
  size_id: number;
 */
  @Column({ type: 'int', nullable: true })
  medium_id: number;

  @Column({ type: 'int', nullable: true })
  surface_id: number;

  // @Column({ type: 'int', nullable: true })
  // orientation_id: number;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  depth: number;

  @Column({ type: 'int', nullable: true })
  weight: number;

  @Column({ type: 'int', nullable: true })
  commission: number;

  // @Column({ type: 'int', nullable: true })
  // packingMode_id: number;

    

  @Column({ type: 'int', nullable: true })
  created_in: number;

  /*@Column({ type: 'int', nullable: true })
  exhibition_id: number;*/

  @Column({ type: 'varchar', nullable: true })
  tags: string;

  // ✅ Boolean Flags
  @Column({ type: 'boolean', default: false })
  original_painting: boolean;

  @Column({ type: 'boolean', default: false })
  new_arrival: boolean;

  @Column({ type: 'boolean', default: false })
  eliteChoice: boolean;

  @Column({ type: 'boolean', default: false })
  affordable_art: boolean;

  @Column({ type: 'boolean', default: false })
  price_on_demand: boolean;

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

  /*@Column({ type: 'boolean', default: false })
  inventory: boolean;*/

  @Column({ type: 'boolean', default: false })
  status: boolean;

  // ✅ Remarks & Conditions
  @Column({ type: 'text', nullable: true })
  remark_to_indigalleria: string;

  @Column({ type: 'text', nullable: true })
  remark_to_artist: string;

  @Column({ type: 'text', nullable: true })
  conditions: string;

  // ✅ Owner (Relation)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' }) // foreign key in DB need to change name owner_id
  owner: User;
  
  // @Column({ type: 'int', nullable: true })
  // category_id: number;

    // ✅ Category (Relation)
    @ManyToOne(() => Productcategory)
    @JoinColumn({ name: 'category_id' }) // foreign key in DB need to change name owner_id
    category: Productcategory;

  // ✅ Artist (Relation)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'artist_id' }) // foreign key in DB need to change name owner_id
  artist: User;
 
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

 @OneToMany(() => ProductImage, (image) => image.product, { cascade: true, eager: true })
images: ProductImage[];


  // ✅ Relations
  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlists: Wishlist[];

  @OneToMany(() => ExhibitionProduct, (map) => map.product)
  displayMappings: ExhibitionProduct[];

@OneToOne(() => ContactUs, (contactUs) => contactUs.product)
contact: ContactUs;
 

@OneToOne(() => Inventory, (inventory) => inventory.product, { cascade: true })
productInventory: Inventory;


 
// 👇 Packing Mode
@ManyToOne(() => PackingModeEntity, { eager: true }) 
@JoinColumn({ name: 'packing_mode_id' })
packingMode: PackingModeEntity;

@Column({ name: 'packing_mode_id', nullable: true })
packingModeId: number;

// 👇 Commission Type
@ManyToOne(() => CommissionType, { eager: true })
@JoinColumn({ name: 'commission_type_id' })
commissionType: CommissionType;

@Column({ name: 'commission_type_id', nullable: true })
commissionTypeId: number;

// 👇 Shipping Time
@ManyToOne(() => ShippingTime, { eager: true })
@JoinColumn({ name: 'shipping_time_id' })
shippingTime: ShippingTime;

@Column({ name: 'shipping_time_id', nullable: true })
shippingTimeId: number;
 
 // 🟢 Add relation to Size
 @ManyToOne(() => Size, { eager: true })
 @JoinColumn({ name: 'size_id' })
 size: Size;
 
 @Column({ name: 'size_id', nullable: true })
 size_id: number;

 // 🟢 Orientation
 @ManyToOne(() => Orientation, { eager: true })
 @JoinColumn({ name: 'orientation_id' })
 orientation: Orientation;

 @Column({ name: 'orientation_id', nullable: true })
 orientation_id: number;


 @ManyToMany(() => Subject,subject => subject.products, { eager: true, cascade: true })
 @JoinTable({
   name: 'products_subject',
   joinColumn: { name: 'product_id', referencedColumnName: 'id' },
   inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
 })
 subjects: Subject[];
 

 @ManyToMany(() => Style, style => style.products, { eager: true, cascade: true })
 @JoinTable({
   name: 'products_style',
   joinColumn: { name: 'product_id', referencedColumnName: 'id' },
   inverseJoinColumn: { name: 'style_id', referencedColumnName: 'id' },
 })
 styles: Style[];

 

}
/*
🔧 What You Should Do Now:

    ✅ Make sure you remove the raw owner_id column (since you're using relation).

    ✅ You can add similar @ManyToOne for artist, category, size, medium, etc., if you want full relation support later.

    ✅ You can add DTOs and services as needed.

    */


