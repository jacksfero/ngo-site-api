import {
    PrimaryGeneratedColumn,BeforeInsert,BeforeUpdate, Column, JoinColumn, ManyToOne, Entity
} from "typeorm";
import { Cart } from "./cart.entity";
import { Product } from "./product.entity";
import { Currency } from "./currency.entity";

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

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number; // Final price after discount

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number; // Original price before discount

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number; // Discount percentage

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total: number; // price * quantity

  @Column({ type: 'int', nullable: true })
  inventoryId: number; // Reference to specific inventor

  // ✅ Automatically calculate total before save
  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal() {
    if (this.price && this.quantity) {
      this.total = Number((this.price * this.quantity).toFixed(2));
    }
  }


  // ✅ Helper method to update prices from inventory
  updatePrices(inventoryPrice: number, inventoryDiscount: number = 0) {
    this.originalPrice = inventoryPrice;
    this.discount = inventoryDiscount;
    this.price = inventoryDiscount > 0 
      ? Number((inventoryPrice - (inventoryPrice * inventoryDiscount / 100)).toFixed(2))
      : inventoryPrice;
    this.calculateTotal(); // Recalculate total
  }

}
