import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
 
//import { ContactUsType,Art_Type } from 'src/modules/admin/contactus/enums/contact-us-type.enum';
import { ContactUsType,Art_Type } from '../../modules/admin/contactus/enums/contact-us-type.enum';


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

      @Column({ type: 'enum', enum: Art_Type, default: Art_Type.DEFAULT })
    art_type: Art_Type;

    @Column({ nullable: true})
    subject: string;

    @Column({ nullable: true})
    productName: string;


   @Column({ nullable: true})
  product_id: number;
  
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
