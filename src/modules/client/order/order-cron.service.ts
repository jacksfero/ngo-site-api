import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Order,OrderStatus } from 'src/shared/entities/order.entity';
import { Repository, LessThan,DataSource } from 'typeorm';
 import { Inventory } from 'src/shared/entities/inventory.entity';
@Injectable()
export class OrderCronService {
  private readonly logger = new Logger(OrderCronService.name);
private dataSource: DataSource; // ✅ For transactions
  constructor(
     @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  // ✅ Run every hour (adjust if needed)
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
        relations: ['items'],
      });

      if (staleOrders.length === 0) {
        this.logger.log('✅ No stale orders found.');
        return;
      }

      for (const order of staleOrders) {
        this.logger.log(`♻️ Processing Order #${order.orderNumber} for deletion`);

        // 3. Restore Stock to Inventory
        for (const item of order.items) {
          if (item.inventoryId) {
            await queryRunner.manager.increment(
              Inventory,
              { id: item.inventoryId },
              'quantity',
              item.quantity,
            );
            this.logger.log(`   - Restored ${item.quantity} units to Inventory ID: ${item.inventoryId}`);
          }
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
}
