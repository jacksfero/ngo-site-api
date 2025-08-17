import {
    PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Entity
} from "typeorm";
import { Cart } from "./cart.entity";
import { Product } from "./product.entity";

//Cart Entity (One Active Cart Per User)

@Entity()
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
    cart: Cart;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number; // snapshot price at time of adding to cart
}
