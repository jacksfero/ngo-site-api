// entities/shipping-time.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('shipping_times')
export class ShippingTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // Example: "1 Day", "2 Days", etc.

  @Column({ default: true })
  isActive: boolean;

}