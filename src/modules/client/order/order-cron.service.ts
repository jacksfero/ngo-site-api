import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Order,OrderStatus } from 'src/shared/entities/order.entity';
import { Repository, LessThan,DataSource,IsNull } from 'typeorm';
 import { Inventory } from 'src/shared/entities/inventory.entity';
 import { Payment    } from 'src/shared/entities/payment.entity';
import { PaymentStatus } from 'src/shared/payment/enum/payment-status.enum';
import { Cart } from 'src/shared/entities/cart.entity';
import { subHours } from 'date-fns';
@Injectable()
export class OrderCronService {
  private readonly logger = new Logger(OrderCronService.name);

  constructor(
     @InjectRepository(Order)
    private orderRepo: Repository<Order>,

@InjectRepository(Cart)
private cartRepo: Repository<Cart>,



    private dataSource: DataSource, // ✅ For transactions
  ) {}

  // ✅ Run every hour (adjust if needed)
//  @Cron(CronExpression.EVERY_30_MINUTES)
   // @Cron(CronExpression.EVERY_MINUTE)
     @Cron(CronExpression.EVERY_30_MINUTES)
  async handleOrderCleanup() {
    this.logger.log('🚀 Starting Cron: Cleaning up unpaid ghost orders...');

     const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Define Expiry (30 minutes ago)
      const expiryTime = new Date(Date.now() - 30 * 60 * 1000);

      // 2. Find orders that are PENDING and haven't been paid
      const staleOrders = await queryRunner.manager.find(Order, {
        where: {
          status: OrderStatus.PENDING,
          createdAt: LessThan(expiryTime),
        },
        relations: ['items', 'payments'],
      });

      if (staleOrders.length === 0) {
        this.logger.log('✅ No stale orders found.');
        return;
      }

      for (const order of staleOrders) {
        this.logger.log(`♻️ Processing Order #${order.orderNumber} for deletion`);



        const hasSuccessfulPayment = order.payments?.some(
        (p) => p.status === PaymentStatus.SUCCESS
      );
if (hasSuccessfulPayment) {
        this.logger.warn(`⚠️ Skipping Order #${order.orderNumber}: Payment found but Order status was PENDING. Syncing...`);
        
        // Safety Sync: If payment is success but order is pending, fix the order instead of deleting
        order.status = OrderStatus.CONFIRMED;
        await queryRunner.manager.save(order);
        continue; // Do not delete this order
      }
      // 3. TRIPLE CHECK: Check for "Initiated" payments
      // If a payment was started in the last 10 mins, maybe give it more time
      const hasRecentActivity = order.payments?.some(
        (p) => p.createdAt > new Date(Date.now() - 10 * 60 * 1000)
      );
      if (hasRecentActivity) {
        this.logger.log(`⏳ Order #${order.orderNumber} has recent payment activity. Skipping for now.`);
        continue;
      }


        // 3. Restore Stock to Inventory
       for (const item of order.items) {
        await queryRunner.manager.increment(Inventory, { id: item.inventoryId }, 'quantity', item.quantity);
      }

        // 4. Delete the Order
        // Using remove() also deletes related OrderItems if cascade is set
        await queryRunner.manager.remove(order);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`✨ Successfully cleaned up ${staleOrders.length} stale orders.`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('❌ Cron Job Failed:', error.message);
    } finally {
      await queryRunner.release();
    }
  }

 
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCartCleanup() {
    this.logger.log('🧹 Starting Cron: Cleaning up abandoned guest carts...');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Define Expiry: Guest carts with no activity for 24 hours
      // You can adjust this to 48 or 72 hours depending on your business logic
      const thresholdDate = subHours(new Date(), 24);

      // 2. Identify Stale Guest Carts
      // We look for carts where:
      // - user is null (Guest)
      // - isCheckedOut is false (Abandoned)
      // - updatedAt is older than 24h
      const staleCarts = await this.cartRepo.find({
        where: {
          user: IsNull(), 
          isCheckedOut: false,
          updatedAt: LessThan(thresholdDate),
        },
        // We don't strictly need 'items' here because of eager: true in Entity,
        // but it's good to be aware that they will be loaded.
      });

      if (staleCarts.length === 0) {
        this.logger.log('✅ No stale guest carts found.');
        await queryRunner.rollbackTransaction();
        return;
      }

      this.logger.log(`Found ${staleCarts.length} abandoned carts. Deleting...`);

      // 3. Batch Delete
      // Because you have 'onDelete: CASCADE' and 'cascade: true',
      // removing the Cart objects will wipe the CartItems from the DB.
      await queryRunner.manager.remove(staleCarts);

      await queryRunner.commitTransaction();
      this.logger.log(`✨ Successfully removed ${staleCarts.length} abandoned guest carts.`);
      
    } catch (error) {
      this.logger.error(`❌ Cart Cleanup Failed: ${error.message}`);
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
    } finally {
      await queryRunner.release();
    }
  }







}
