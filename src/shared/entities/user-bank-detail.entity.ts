import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity('user_bank_details')
  export class BankDetail {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.bankDetails, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @Column({ name: 'user_id' })
    userId: number;
  
    @Column({ length: 100 })
    accountHolderName: string;
  
    @Column({ length: 50 })
    accountNumber: string;
  
    @Column({ length: 20 })
    ifscCode: string;
  
    @Column({ length: 100 })
    bankName: string;
  
    @Column({ length: 100, nullable: true })
    branchName: string;
  
    @Column({ default: false })
    isDefault: boolean;
  
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
  }
  