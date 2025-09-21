import {
  PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, Column, JoinColumn, ManyToOne, Entity
} from "typeorm";
import { Cart } from "./cart.entity";
import { Product } from "./product.entity";
import { Currency } from "./currency.entity";
import { numBytes } from "aws-sdk/clients/finspace";

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
  price: number; // Final price (per unit, converted)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number; // Original price before discount (in INR)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number; // total discount amount

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  gstAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipInr: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipOther: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total: number; // Final total for this item

  @Column({ type: 'int', nullable: true })
  inventoryId: number;

  // 🚀 Updated price calculation
  updatePrices(
    inventoryPrice: number,   // Base price in INR
    artgst: number,           // GST %
    costInr: number,          // Shipping INR
    costOther: number,        // Shipping outside
    shipgst: number,          // Shipping GST %
    inventoryDiscount: number = 0,
    exchangeRate: number = 1, // Cart-level exchangeRate
    isDomestic: boolean       // true = India
  ) {
    // 0️⃣ Ensure all numeric inputs are valid
    const priceSafe = inventoryPrice ?? 0;
    const gstSafe = artgst ?? 0;
    const shippingINRSafe = costInr ?? 0;
    const shippingOtherSafe = costOther ?? 0;
    const shippingGstSafe = shipgst ?? 0;
    const rateSafe = exchangeRate > 0 ? exchangeRate : 1;
  
    // 1️⃣ Discount
    const discountAmount = Number(((priceSafe * inventoryDiscount) / 100).toFixed(2));
    const discountedPrice = priceSafe - discountAmount;
   // console.log('-------',discountedPrice)
    // 2️⃣ GST
    const gstAmount = Number(((discountedPrice * gstSafe) / 100).toFixed(2));
   // console.log('-------',gstAmount)
    // 3️⃣ Shipping
    const baseShipping = Number(isDomestic ? shippingINRSafe : shippingOtherSafe)  ;
    const shippingGstNum = Number(((baseShipping * Number(shippingGstSafe  )) / 100).toFixed(2));
    const shippingTotal = Number(baseShipping + shippingGstNum);
   // console.log(baseShipping,'-------',shippingGstNum,'------',shippingTotal)
    // 4️⃣ Total in INR
    const totalInINR = discountedPrice + gstAmount + shippingTotal;
  
    // 5️⃣ Convert to cart currency
    const convertedPrice = Number((discountedPrice / rateSafe).toFixed(2));
    const convertedGst = Number((gstAmount / rateSafe).toFixed(2));
    const convertedShipping = Number((shippingTotal / rateSafe).toFixed(2));
    const convertedTotal = Number((totalInINR / rateSafe).toFixed(2));
 
    // 6️⃣ Validate before saving
    if ([convertedPrice, convertedGst, convertedShipping, convertedTotal].some(v => isNaN(v))) {
      throw new Error('Price calculation failed: some values are NaN');
    }
  
    // 7️⃣ Save values
    this.originalPrice = priceSafe;
    this.discountAmount = discountAmount;
    this.price = convertedPrice;
    this.gstAmount = convertedGst;
    this.shipInr = isDomestic ? convertedShipping : 0;
    this.shipOther = !isDomestic ? convertedShipping : 0;
    this.total = convertedTotal;
  }
}
