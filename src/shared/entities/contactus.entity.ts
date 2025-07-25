import { ContactUsType } from 'src/modules/admin/contactus/enums/contact-us-type.enum';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ContactUs {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    phonecode: string;

    @Column()
    mobile: string;

    @Column()
    email: string;

    @Column('text')
    message: string;

    @Column({ type: 'enum', enum: ContactUsType })
    type: ContactUsType;

    @Column()
    subject: string;

   @ManyToOne(() => Product, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
