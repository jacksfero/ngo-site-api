import { Wishlist } from 'src/shared/entities/wishlist.entity';
import { Column, OneToMany, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { ExhibitionProduct } from './exhibition-product.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', default: 0 })
  owner_id: number;

  @Column({ type: 'integer', default: 0 })
  artist_id: number;

  @Column({ type: 'integer', default: null })
  size_id: number;

  @Column({ type: 'integer', default: null })
  category_id: number;

  @Column({ type: 'varchar', length: 150 })
  productTitle: string;

  @Column({ type: 'varchar', length: 150 })
  description: string;

  @Column({ type: 'integer', default: null })
  artist_price: number;

  @Column({ type: Boolean, default: false })
  original_painting: boolean;

  @Column({ type: Boolean, default: false })
  new_arrival: boolean;

  @Column({ type: Boolean, default: false })
  eliteChoice: boolean;

  @Column({ type: Boolean, default: false })
  affordable_art: boolean;

  @Column({ type: Boolean, default: false })
  price_on_demand: boolean;

  @Column({ type: Boolean, default: false })
  negotiable: boolean;

  @Column({ type: Boolean, default: false })
  printing_rights: boolean;

  @Column({ type: Boolean, default: false })
  featured: boolean;

  @Column({ type: Boolean, default: false })
  refundable: boolean;

  @Column({ type: Boolean, default: false })
  certificate: boolean;

  @Column({ type: 'integer', default: null })
  medium_id: number;

  @Column({ type: 'integer', default: null })
  surface_id: number;

  @Column({ type: 'integer', default: null })
  orientation_id: number;

  @Column({ type: 'integer', default: null })
  width: number;

  @Column({ type: 'integer', default: null })
  height: number;

  @Column({ type: 'integer', default: null })
  depth: number;

  @Column({ type: 'integer', default: null })
  weight: number;

  @Column({ type: 'integer', default: null })
  commission: number;

  @Column({ type: 'integer', default: null })
  packingMode_id: number;

  @Column({ type: 'integer', default: null })
  shippingTime: number;

  @Column({ type: 'integer', default: null })
  created_in: number;

  @Column({ type: 'text', default: null })
  remark_to_indigalleria: number;

  @Column({ type: 'text', default: null })
  remark_to_artist: string;

  @Column({ type: 'text', default: null })
  conditions: string;

  @Column({ type: 'integer', default: null })
  exhibition_id: number;

  @Column({ type: 'varchar', default: null })
  tags: string;

  @Column({ type: Boolean, default: false })
  is_lock: boolean;

  @Column({ type: Boolean, default: false })
  inventory: boolean;

  @Column({ type: Boolean, default: false })
  status: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;


  @Column({ type: 'int', default: null })
  createdBy: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'int', default: null })
  updatedBy: number;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlists: Wishlist[];

   @OneToMany(() => ExhibitionProduct, (map) => map.product)
  displayMappings: ExhibitionProduct[];

  
}
