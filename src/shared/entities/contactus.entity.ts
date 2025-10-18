import { ContactUsType } from 'src/modules/admin/contactus/enums/contact-us-type.enum';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ContactUs {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true})
    name: string;

    @Column({ nullable: true})
    phonecode: string;

    @Column({ nullable: true})
    mobile: string;

    @Column()
    email: string;

    @Column('text',{ nullable: true})
    message: string;

    @Column({ type: 'enum', enum: ContactUsType })
    type: ContactUsType;

    @Column({ nullable: true})
    subject: string;

   @ManyToOne(() => Product, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
  
 @Column({ type: 'varchar', length: 50, nullable: true })
  updatedBy: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
