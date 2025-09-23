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
  const priceSafe = inventoryPrice ?? 0;
  const gstSafe = artgst ?? 0;
  const shippingINRSafe = costInr ?? 0;
  const shippingOtherSafe = costOther ?? 0;
  const shippingGstSafe = shipgst ?? 0;
  const rateSafe = exchangeRate > 0 ? exchangeRate : 1;

  // 1️⃣ Discount per unit (INR)
  const discountPerUnitINR = Number(((priceSafe * inventoryDiscount) / 100).toFixed(2));
  const discountedPricePerUnitINR = priceSafe - discountPerUnitINR;

  // 2️⃣ GST per unit (INR)
  const gstPerUnitINR = Number(((discountedPricePerUnitINR * gstSafe) / 100).toFixed(2));

  // 3️⃣ Shipping per unit (INR)
  const baseShippingINR = Number(isDomestic ? shippingINRSafe : shippingOtherSafe);
  const shippingGstNumINR = Number(((baseShippingINR * shippingGstSafe) / 100).toFixed(2));
  const shippingPerUnitINR = baseShippingINR + shippingGstNumINR;

  // 4️⃣ Totals in INR
  const discountedPriceINR = discountedPricePerUnitINR * this.quantity;
  const gstAmountINR = gstPerUnitINR * this.quantity;
  const shippingTotalINR = shippingPerUnitINR * this.quantity;
  const discountAmountINR = discountPerUnitINR * this.quantity;

  const totalINR = discountedPriceINR + gstAmountINR + shippingTotalINR;

  // 5️⃣ Convert to cart currency
  const convertedPrice = Number((discountedPriceINR / rateSafe).toFixed(2));
  const convertedGst = Number((gstAmountINR / rateSafe).toFixed(2));
  const convertedShipping = Number((shippingTotalINR / rateSafe).toFixed(2));
  const convertedDiscount = Number((discountAmountINR / rateSafe).toFixed(2));
  const convertedTotal = Number((totalINR / rateSafe).toFixed(2));

  if ([convertedPrice, convertedGst, convertedShipping, convertedTotal].some(v => isNaN(v))) {
    throw new Error('Price calculation failed: some values are NaN');
  }

  // 6️⃣ Save values (all in cart currency now)
  this.originalPrice = Number((priceSafe / rateSafe).toFixed(2)); // original unit price in cart currency
  this.discountAmount = convertedDiscount;
  this.price = convertedPrice;
  this.gstAmount = convertedGst;
  this.shipInr = isDomestic ? convertedShipping : 0;
  this.shipOther = !isDomestic ? convertedShipping : 0;
  this.total = convertedTotal;
}
}
