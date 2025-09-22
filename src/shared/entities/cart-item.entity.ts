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
  inventoryPrice: number,
  artgst: number,
  costInr: number,
  costOther: number,
  shipgst: number,
  inventoryDiscount: number = 0,
  exchangeRate: number = 1,
  isDomestic: boolean
) {
  const priceSafe = inventoryPrice ?? 0;
  const gstSafe = artgst ?? 0;
  const shippingINRSafe = costInr ?? 0;
  const shippingOtherSafe = costOther ?? 0;
  const shippingGstSafe = shipgst ?? 0;
  const rateSafe = exchangeRate > 0 ? exchangeRate : 1;

  // 1️⃣ Discount per unit
  const discountPerUnit = Number(((priceSafe * inventoryDiscount) / 100).toFixed(2));
  const discountedPricePerUnit = priceSafe - discountPerUnit;

  // 2️⃣ GST per unit
  const gstPerUnit = Number(((discountedPricePerUnit * gstSafe) / 100).toFixed(2));

  // 3️⃣ Shipping per unit
  const baseShipping = Number(isDomestic ? shippingINRSafe : shippingOtherSafe);
  const shippingGstNum = Number(((baseShipping * shippingGstSafe) / 100).toFixed(2));
  const shippingPerUnit = baseShipping + shippingGstNum;

  // 4️⃣ Totals for given quantity
  const discountedPrice = discountedPricePerUnit * this.quantity;
  const gstAmount = gstPerUnit * this.quantity;
  const shippingTotal = shippingPerUnit * this.quantity;

  // 5️⃣ Total in INR
  const totalInINR = discountedPrice + gstAmount + shippingTotal;

  // 6️⃣ Convert to cart currency
  const convertedPrice = Number((discountedPrice / rateSafe).toFixed(2));
  const convertedGst = Number((gstAmount / rateSafe).toFixed(2));
  const convertedShipping = Number((shippingTotal / rateSafe).toFixed(2));
  const convertedTotal = Number((totalInINR / rateSafe).toFixed(2));

  if ([convertedPrice, convertedGst, convertedShipping, convertedTotal].some(v => isNaN(v))) {
    throw new Error('Price calculation failed: some values are NaN');
  }

  // 7️⃣ Save values
  this.originalPrice = priceSafe;
  this.discountAmount = discountPerUnit * this.quantity;
  this.price = convertedPrice;
  this.gstAmount = convertedGst;
  this.shipInr = isDomestic ? convertedShipping : 0;
  this.shipOther = !isDomestic ? convertedShipping : 0;
  this.total = convertedTotal;
}
}
