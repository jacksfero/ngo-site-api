import { PrimaryGeneratedColumn,Entity, Column, OneToMany } from "typeorm";
import { ExhibitionProduct } from "./exhibition-product.entity";

@Entity('exhibitions')
export class Exhibition {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 150, })
    ExibitionTitle: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'datetime', nullable: true })
    DateStart: Date;

    @Column({ type: 'datetime', nullable: true })
    DateEnd: Date;



    @Column({ type: 'varchar', length: 200, nullable: true })
    imageURL: string;



    @Column({ type: 'boolean', default: false })
    exhibitionStatus: boolean;

    @Column({ type: 'boolean', default: false })
    status: boolean;

    @Column({ type: 'varchar', length: 50, nullable: true })
    createdBy: string;

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

     @OneToMany(() => ExhibitionProduct, (map) => map.exhibition)
  displayMappings: ExhibitionProduct[];

}
