import {PrimaryGeneratedColumn,Column,JoinColumn,OneToMany,CreateDateColumn,UpdateDateColumn, ManyToOne,Entity } from "typeorm";
import { CartItem } from "./cart-item.entity";
import { User } from "./user.entity";


@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

 // @ManyToOne(() => User, (user) => user.carts)
 @ManyToOne(() => User, {   eager: true }) // eager: auto-loads user when fetching cart
 @JoinColumn({ name: 'user_id' })
 user: User;
 

 @Column({ nullable: true })
  guestId?: string; // for guest user

  @OneToMany(() => CartItem, (item) => item.cart, {  cascade: true,eager: true })
  items: CartItem[];

  @Column({ default: false })
  isCheckedOut: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
