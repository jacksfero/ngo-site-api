import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { Exhibition } from "./exhibition.entity";
import { User } from "./user.entity";

@Entity('exhibition_products')
export class ExhibitionProduct {
    @PrimaryGeneratedColumn()
    id: number;


    @ManyToOne(() => Exhibition, (exhibition) => exhibition.displayMappings)
    exhibition: Exhibition;


    @ManyToOne(() => Product, (product) => product.displayMappings)
    product: Product;

    @ManyToOne(() => User, (user) => user.displayMappings)
    user: User; // Product owner
 

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}